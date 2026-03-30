<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import { createPersonalNote, fetchMeeting, fetchPersonalNotes, updatePersonalNote, selfCheckinMeetingParticipant, fetchAvailableDelegates } from '@/modules/meetings/services/meetingService'

import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const meetingStore = useMeetingStore()

const loading = ref(true)
const meeting = ref(null)
const activeTab = ref('agenda')

// Personal Notes
const personalNotes = ref('')
const personalNoteId = ref(null)
const isSavingNote = ref(false)
const lastSaved = ref(null)

// Current User State & Self Checkin
const userData = useCookie('userData')
const currentUserParticipant = computed(() => {
  if (!meeting.value?.participants || !userData.value) return null

  return meeting.value.participants.find(p => p.user_id === userData.value.id)
})

const isCheckinSubmitting = ref(false)
const isAbsentDialogOpen = ref(false)
const absenceReason = ref('')
const isDelegateDialogOpen = ref(false)
const delegatedToId = ref(null)
const availableUsers = ref([])

const loadAvailableUsers = async () => {
  if (availableUsers.value.length > 0) return
  if (!meeting.value?.id) return
  try {
    const res = await fetchAvailableDelegates(meeting.value.id)
    availableUsers.value = res.data || []
  } catch (error) {
    console.error('Failed to load users for delegation:', error)
  }
}

const handleSelfCheckin = async (status) => {
  if (!meeting.value?.id) return
  isCheckinSubmitting.value = true
  
  const payload = { attendance_status: status }
  if (status === 'absent') payload.absence_reason = absenceReason.value
  if (status === 'delegated') payload.delegated_to_id = delegatedToId.value

  try {
    const res = await selfCheckinMeetingParticipant(meeting.value.id, payload)
    
    // Update local state
    if (currentUserParticipant.value) {
      Object.assign(currentUserParticipant.value, res.data.data)
    }
    
    // Close dialogs
    isAbsentDialogOpen.value = false
    isDelegateDialogOpen.value = false
  } catch (error) {
    console.error('Checkin failed:', error)
  } finally {
    isCheckinSubmitting.value = false
  }
}


// Voting Modal (nhận event qua WebSocket hoặc mở thủ công)
const isVotingModalOpen = ref(false)
const activeVote = ref(null)
const selectedVoteAnswer = ref(null)
const isSubmittingVote = ref(false)

// Speak request
const isSpeakRequested = ref(false)
const isRequestingSpeak = ref(false)
const speechRequestId = ref(null)

// Countdown timer
const countdownDisplay = ref('00:00:00')
let countdownInterval = null

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    if (!meeting.value?.end_at) {
      countdownDisplay.value = '00:00:00'

      return
    }

    // Parse end_at (format: "HH:mm:ss DD/MM/YYYY" or ISO)
    let endTime
    const raw = meeting.value.end_at
    if (raw.includes('/')) {
      const parts = raw.split(' ')
      const timePart = parts[0]
      const datePart = parts[1]?.split('/') || []
      if (datePart.length === 3) {
        endTime = new Date(`${datePart[2]}-${datePart[1]}-${datePart[0]}T${timePart}`)
      }
    }
    if (!endTime) endTime = new Date(raw)

    const now = new Date()
    const diff = Math.max(0, endTime - now)
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')

    countdownDisplay.value = `${h}:${m}:${s}`
  }, 1000)
}

// Computed attendance stats
const attendanceStats = computed(() => {
  const participants = meeting.value?.participants || []
  const total = participants.length
  const present = participants.filter(p => p.attendance_status === 'present').length
  const absent = participants.filter(p => p.attendance_status === 'absent').length
  const guest = participants.filter(p => p.meeting_role === 'guest').length

  return { total, present, absent, guest }
})

const loadMeeting = async () => {
  loading.value = true
  try {
    const [res, notesRes] = await Promise.all([
      fetchMeeting(route.params.id),
      fetchPersonalNotes(route.params.id).catch(() => ({ data: [] })),
    ])

    meeting.value = res.data
    meetingStore.setCurrentMeeting(meeting.value)
    meetingStore.subscribeToMeeting(meeting.value.id)

    if (notesRes.data && notesRes.data.length > 0) {
      personalNotes.value = notesRes.data[0].content
      personalNoteId.value = notesRes.data[0].id
    }

    startCountdown()
  }
  catch (error) {
    console.error('Failed to load meeting details', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMeeting()
})

onUnmounted(() => {
  meetingStore.unsubscribeFromMeeting()
  if (countdownInterval) clearInterval(countdownInterval)
})

// Listen to WS sync payload for meeting details
watch(() => meetingStore.currentMeeting, newVal => {
  if (newVal) {
    meeting.value.status = newVal.status
  }
}, { deep: true })

// Auto-save logic
let initialLoad = true

watchDebounced(
  personalNotes,
  async newVal => {
    if (initialLoad) {
      initialLoad = false

      return
    }
    if (!meeting.value?.id) return

    isSavingNote.value = true
    try {
      if (personalNoteId.value) {
        await updatePersonalNote(meeting.value.id, personalNoteId.value, { content: newVal })
      }
      else {
        const res = await createPersonalNote(meeting.value.id, { content: newVal })

        personalNoteId.value = res.data.id
      }
      lastSaved.value = new Date().toLocaleTimeString('vi-VN')
    }
    catch (error) {
      console.error('Failed to save note', error)
    }
    finally {
      isSavingNote.value = false
    }
  },
  { debounce: 1500, maxWait: 5000 },
)

// ===== ĐĂNG KÝ PHÁT BIỂU =====
const requestSpeak = async () => {
  if (!meeting.value?.id) return

  isRequestingSpeak.value = true
  try {
    const { createSpeechRequest } = await import('@/modules/meetings/services/meetingService')
    const res = await createSpeechRequest(meeting.value.id)

    speechRequestId.value = res.data?.id || null
    isSpeakRequested.value = true
  }
  catch (error) {
    console.error('Failed to request speak:', error)
  }
  finally {
    isRequestingSpeak.value = false
  }
}

const cancelSpeakRequest = async () => {
  if (!meeting.value?.id || !speechRequestId.value) return
  try {
    const { deleteSpeechRequest } = await import('@/modules/meetings/services/meetingService')

    await deleteSpeechRequest(meeting.value.id, speechRequestId.value)
    isSpeakRequested.value = false
    speechRequestId.value = null
  }
  catch (error) {
    console.error('Failed to cancel speak request:', error)
  }
}

// ===== BIỂU QUYẾT MODAL =====
const submitVote = async () => {
  if (!activeVote.value || selectedVoteAnswer.value === null) return

  isSubmittingVote.value = true
  try {
    const { castVote } = await import('@/modules/meetings/services/meetingService')

    await castVote(meeting.value.id, activeVote.value.id, selectedVoteAnswer.value)
    isVotingModalOpen.value = false
    activeVote.value = null
    selectedVoteAnswer.value = null
  }
  catch (error) {
    console.error('Failed to submit vote:', error)
  }
  finally {
    isSubmittingVote.value = false
  }
}

const resolveStatusLabel = status => {
  if (status === 'active' || status === 'in_progress') return 'Đang diễn ra'
  if (status === 'draft' || status === 'scheduled') return 'Chưa bắt đầu'

  return 'Đã kết thúc'
}

const resolveStatusBadgeClass = status => {
  if (status === 'active' || status === 'in_progress') return 'status-badge-live'
  if (status === 'draft' || status === 'scheduled') return 'status-badge-draft'

  return 'status-badge-completed'
}

const getPresenterName = presenterId => {
  if (!presenterId || !meeting.value?.participants) return ''
  const p = meeting.value.participants.find(x => x.user_id === presenterId)

  return p?.user?.name || ''
}

const getChairperson = () => {
  if (!meeting.value?.participants) return null

  return meeting.value.participants.find(p => ['chairperson', 'chair'].includes(p.meeting_role || p.role))
}

const getSecretary = () => {
  if (!meeting.value?.participants) return null

  return meeting.value.participants.find(p => p.meeting_role === 'secretary' || p.role === 'secretary')
}
</script>

<template>
  <!-- Loading -->
  <div
    v-if="loading"
    class="d-flex justify-center align-center pa-16"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="48"
    />
  </div>

  <div v-else-if="meeting">
    <!-- ==================== HEADER BANNER ==================== -->
    <div class="meeting-header-banner">
      <VRow align="start">
        <VCol
          cols="12"
          md="7"
        >
          <div class="meeting-tag">
            <VIcon
              icon="tabler-calendar-event"
              size="14"
            />
            {{ meeting.meeting_type || 'Cuộc họp định kỳ' }}
          </div>
          <h1 class="meeting-title">
            {{ meeting.title }}
          </h1>
          <p
            v-if="meeting.description"
            class="meeting-description"
          >
            {{ meeting.description }}
          </p>
        </VCol>

        <VCol
          cols="12"
          md="5"
        >
          <div class="countdown-box">
            <span :class="resolveStatusBadgeClass(meeting.status)">
              {{ resolveStatusLabel(meeting.status) }}
            </span>
            <div class="countdown-timer-wrapper">
              <div class="countdown-label">
                THỜI GIAN CÒN LẠI
              </div>
              <div class="countdown-time">
                <VIcon
                  icon="tabler-alarm"
                  class="timer-icon"
                  size="24"
                />
                {{ countdownDisplay }}
              </div>
            </div>
            <div
              v-if="['active', 'in_progress'].includes(meeting.status)"
              class="header-actions"
            >
              <button class="action-btn-outline red">
                <VIcon
                  icon="tabler-player-pause"
                  size="16"
                />
                Tạm Dừng Cuộc Họp
              </button>
              <button class="action-btn-outline purple">
                <VIcon
                  icon="tabler-arrow-autofit-right"
                  size="16"
                />
                Ủy Quyền Điều Hành
              </button>
            </div>
          </div>
        </VCol>
      </VRow>

      <!-- Meeting Info Row -->
      <div class="meeting-info-row">
        <div class="meeting-info-item">
          <div>
            <div class="info-label">
              <VIcon
                icon="tabler-clock"
                size="12"
                class="me-1"
              /> Thời gian cuộc họp
            </div>
            <div class="info-value">
              {{ meeting.start_at || 'Chưa xác định' }}
            </div>
          </div>
        </div>
        <div class="meeting-info-item">
          <div>
            <div class="info-label">
              <VIcon
                icon="tabler-map-pin"
                size="12"
                class="me-1"
              /> Địa điểm
            </div>
            <div class="info-value">
              {{ meeting.location || 'Phòng họp trực tuyến' }}
            </div>
          </div>
        </div>
        <div
          v-if="getChairperson()"
          class="meeting-info-item"
        >
          <div>
            <div class="info-label">
              <VIcon
                icon="tabler-crown"
                size="12"
                class="me-1"
              /> Chủ trì
            </div>
            <div class="info-value">
              {{ getChairperson()?.user?.name || 'Chưa chỉ định' }}
            </div>
          </div>
        </div>
        <div
          v-if="getSecretary()"
          class="meeting-info-item"
        >
          <div>
            <div class="info-label">
              <VIcon
                icon="tabler-writing"
                size="12"
                class="me-1"
              /> Thư ký
            </div>
            <div class="info-value">
              {{ getSecretary()?.user?.name || 'Chưa chỉ định' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TABS NAVIGATION ==================== -->
    <VTabs
      v-model="activeTab"
      class="meeting-tabs"
    >
      <VTab value="agenda">
        <VIcon
          icon="tabler-list-details"
          size="18"
          class="me-2"
        />
        Chương trình họp
      </VTab>
      <VTab value="documents">
        <VIcon
          icon="tabler-file-text"
          size="18"
          class="me-2"
        />
        Tài liệu họp
      </VTab>
      <VTab value="management">
        <VIcon
          icon="tabler-settings"
          size="18"
          class="me-2"
        />
        Thông tin điều hành
      </VTab>
      <VTab value="voting">
        <VIcon
          icon="tabler-checkbox"
          size="18"
          class="me-2"
        />
        Biểu quyết
      </VTab>
      <VTab value="conclusions">
        <VIcon
          icon="tabler-clipboard-check"
          size="18"
          class="me-2"
        />
        Kết luận cuộc họp
      </VTab>
    </VTabs>

    <!-- ==================== TAB CONTENT ==================== -->
    <VWindow
      v-model="activeTab"
      class="disable-tab-transition"
    >
      <!-- ========== TAB 1: CHƯƠNG TRÌNH HỌP ========== -->
      <VWindowItem value="agenda">
        <VRow>
          <VCol
            cols="12"
            lg="7"
          >
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-list-details"
                    class="section-icon"
                  />
                  Chương trình cuộc họp
                </div>
                <div class="d-flex gap-2" v-if="currentUserParticipant">
                  <template v-if="currentUserParticipant.attendance_status === 'pending' || !currentUserParticipant.attendance_status">
                    <VBtn
                      size="small"
                      color="primary"
                      prepend-icon="tabler-user-check"
                      :loading="isCheckinSubmitting"
                      @click="handleSelfCheckin('present')"
                    >
                      Báo Có Mặt
                    </VBtn>
                    <VBtn
                      size="small"
                      color="error"
                      variant="outlined"
                      prepend-icon="tabler-user-x"
                      @click="isAbsentDialogOpen = true"
                    >
                      Báo Vắng
                    </VBtn>
                    <VBtn
                      size="small"
                      color="warning"
                      variant="outlined"
                      prepend-icon="tabler-arrow-autofit-right"
                      @click="() => { loadAvailableUsers(); isDelegateDialogOpen = true; }"
                    >
                      Ủy Quyền
                    </VBtn>
                  </template>
                  <template v-else>
                    <VChip
                      v-if="currentUserParticipant.attendance_status === 'present'"
                      color="success"
                      prepend-icon="tabler-check"
                    >
                      Đã báo có mặt
                    </VChip>
                    <VChip
                      v-else-if="currentUserParticipant.attendance_status === 'absent'"
                      color="error"
                      prepend-icon="tabler-user-x"
                    >
                      Đã báo vắng
                    </VChip>
                    <VChip
                      v-else-if="currentUserParticipant.attendance_status === 'delegated'"
                      color="warning"
                      prepend-icon="tabler-arrow-autofit-right"
                    >
                      Đã ủy quyền
                    </VChip>
                  </template>
                </div>
              </div>

              <!-- Time Block -->
              <div class="time-block">
                <div class="time-icon">
                  <VIcon
                    icon="tabler-clock"
                    size="18"
                  />
                </div>
                <div>
                  <div
                    class="text-overline text-uppercase mb-0"
                    style="font-size: 0.7rem; color: #7c3aed; font-weight: 700;"
                  >
                    THỜI GIAN CUỘC HỌP
                  </div>
                  <div class="time-text">
                    {{ meeting.start_at || 'Chưa xác định' }}
                  </div>
                </div>
              </div>

              <!-- Meeting Info in Tab -->
              <div class="d-flex gap-8 px-5 pb-2 flex-wrap">
                <div class="meeting-info-item">
                  <div>
                    <div class="info-label">
                      <VIcon
                        icon="tabler-map-pin"
                        size="12"
                        class="me-1"
                      /> Địa điểm
                    </div>
                    <div class="info-value">
                      {{ meeting.location || 'Phòng họp trực tuyến' }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="getChairperson()"
                  class="meeting-info-item"
                >
                  <div>
                    <div class="info-label">
                      <VIcon
                        icon="tabler-crown"
                        size="12"
                        class="me-1"
                      /> Chủ trì
                    </div>
                    <div class="info-value">
                      {{ getChairperson()?.user?.name || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>

              <VDivider class="mx-5 my-2" />

              <!-- Section: Nội dung chi tiết -->
              <div class="px-5 pt-3 pb-1">
                <div class="meeting-section-title mb-3">
                  <VIcon
                    icon="tabler-notes"
                    class="section-icon"
                  />
                  Nội dung chi tiết
                </div>
              </div>

              <!-- Agenda Items -->
              <div
                v-if="meeting.agendas?.length > 0"
                class="agenda-list"
              >
                <div
                  v-for="(agenda, i) in meeting.agendas"
                  :key="i"
                  class="agenda-item"
                >
                  <div
                    class="agenda-number"
                    :class="{ active: meetingStore.activeAgendaId === agenda.id }"
                  >
                    {{ i + 1 }}
                  </div>
                  <div class="agenda-content">
                    <div class="agenda-title-text">
                      {{ agenda.title }}
                    </div>
                    <div
                      v-if="agenda.presenter_id"
                      class="agenda-presenter"
                    >
                      <VIcon
                        icon="tabler-user"
                        size="12"
                        class="me-1"
                      />
                      {{ getPresenterName(agenda.presenter_id) || agenda.presenter_id }}
                    </div>
                  </div>
                  <div
                    v-if="agenda.duration"
                    class="agenda-duration"
                  >
                    {{ agenda.duration }} phút
                  </div>
                </div>
              </div>

              <div
                v-else
                class="pa-5"
              >
                <VAlert
                  type="info"
                  variant="tonal"
                >
                  Chưa có chương trình họp.
                </VAlert>
              </div>
            </div>
          </VCol>

          <!-- Right Sidebar -->
          <VCol
            cols="12"
            lg="5"
          >
            <!-- Attendance Stats -->
            <div class="stats-card mb-4">
              <div class="stats-header">
                <div class="stats-title">
                  <VIcon
                    icon="tabler-chart-pie"
                    size="18"
                    class="me-2"
                    color="primary"
                  />
                  Thống kê tham dự
                </div>
                <span class="stats-total">Tổng: {{ attendanceStats.total }} đại biểu</span>
              </div>
              <div class="py-2">
                <div class="stat-row">
                  <span class="stat-label">Có mặt</span>
                  <div class="stat-bar-wrapper">
                    <div
                      class="stat-bar present"
                      :style="{ width: attendanceStats.total ? (attendanceStats.present / attendanceStats.total * 100) + '%' : '0%' }"
                    />
                  </div>
                  <span class="stat-value">{{ attendanceStats.present }} ({{ attendanceStats.total ? Math.round(attendanceStats.present / attendanceStats.total * 100) : 0 }}%)</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Vắng mặt</span>
                  <div class="stat-bar-wrapper">
                    <div
                      class="stat-bar absent"
                      :style="{ width: attendanceStats.total ? (attendanceStats.absent / attendanceStats.total * 100) + '%' : '0%' }"
                    />
                  </div>
                  <span class="stat-value">{{ attendanceStats.absent }} ({{ attendanceStats.total ? Math.round(attendanceStats.absent / attendanceStats.total * 100) : 0 }}%)</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Khách mời</span>
                  <div class="stat-bar-wrapper">
                    <div
                      class="stat-bar guest"
                      :style="{ width: attendanceStats.total ? (attendanceStats.guest / attendanceStats.total * 100) + '%' : '0%' }"
                    />
                  </div>
                  <span class="stat-value">{{ attendanceStats.guest }} ({{ attendanceStats.total ? Math.round(attendanceStats.guest / attendanceStats.total * 100) : 0 }}%)</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="stats-card">
              <div class="quick-actions">
                <div class="quick-actions-title">
                  <VIcon
                    icon="tabler-bolt"
                    size="18"
                    color="primary"
                  />
                  Thao tác nhanh
                </div>

                <button class="quick-action-btn red">
                  <VIcon
                    icon="tabler-lock"
                    size="18"
                  />
                  Khoá Danh Sách Điểm Danh
                </button>

                <button class="quick-action-btn orange">
                  <VIcon
                    icon="tabler-external-link"
                    size="18"
                  />
                  Truy Cập Trang Quản Trị Điều Hành
                </button>

                <button class="quick-action-btn purple">
                  <VIcon
                    icon="tabler-file-export"
                    size="18"
                  />
                  Xuất Báo Cáo Nhanh
                </button>
              </div>
            </div>
          </VCol>
        </VRow>
      </VWindowItem>

      <!-- ========== TAB 2: TÀI LIỆU HỌP ========== -->
      <VWindowItem value="documents">
        <VRow>
          <VCol
            cols="12"
            lg="8"
          >
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-file-text"
                    class="section-icon"
                  />
                  Tài liệu cuộc họp
                  <span class="section-badge">{{ meeting.documents?.length || 0 }} tài liệu</span>
                </div>
              </div>

              <template v-if="meeting.documents?.length > 0">
                <table class="meeting-doc-table">
                  <thead>
                    <tr>
                      <th style="width: 50px">
                        STT
                      </th>
                      <th>Tên tài liệu</th>
                      <th style="width: 120px">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(doc, i) in meeting.documents"
                      :key="doc.id"
                    >
                      <td>{{ i + 1 }}</td>
                      <td>
                        <div class="d-flex align-center gap-2">
                          <VIcon
                            icon="tabler-file-description"
                            color="primary"
                            size="20"
                          />
                          <div>
                            <div class="font-weight-medium">
                              {{ doc.title }}
                            </div>
                            <div
                              v-if="doc.description"
                              class="text-caption text-disabled"
                            >
                              {{ doc.description }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <VBtn
                          v-if="doc.file_url"
                          icon
                          size="small"
                          variant="text"
                          color="primary"
                          :href="doc.file_url"
                          target="_blank"
                        >
                          <VIcon icon="tabler-download" />
                        </VBtn>
                        <VBtn
                          icon
                          size="small"
                          variant="text"
                        >
                          <VIcon icon="tabler-dots-vertical" />
                        </VBtn>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>

              <div
                v-else
                class="pa-6 text-center"
              >
                <VIcon
                  icon="tabler-file-off"
                  size="48"
                  class="mb-3 opacity-50"
                />
                <p class="text-medium-emphasis">
                  Không có tài liệu đính kèm.
                </p>
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            lg="4"
          >
            <!-- Personal Notes -->
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-title">
                  <VIcon
                    icon="tabler-notes"
                    size="18"
                    class="me-2"
                    color="primary"
                  />
                  Ghi chú cá nhân
                </div>
                <VFadeTransition leave-absolute>
                  <span
                    v-if="isSavingNote"
                    class="text-caption text-disabled d-flex align-center gap-1"
                  >
                    <VProgressCircular
                      indeterminate
                      size="12"
                      width="2"
                    /> Đang lưu...
                  </span>
                  <span
                    v-else-if="lastSaved"
                    class="text-caption text-success d-flex align-center gap-1"
                  >
                    <VIcon
                      icon="tabler-check"
                      size="14"
                    /> {{ lastSaved }}
                  </span>
                </VFadeTransition>
              </div>
              <div class="pa-0">
                <textarea
                  v-model="personalNotes"
                  class="w-100 pa-4 custom-textarea"
                  placeholder="Ghi chú cá nhân của bạn sẽ được tự động lưu lại..."
                />
              </div>
            </div>
          </VCol>
        </VRow>
      </VWindowItem>

      <!-- ========== TAB 3: THÔNG TIN ĐIỀU HÀNH ========== -->
      <VWindowItem value="management">
        <VRow>
          <VCol cols="12">
            <!-- Delegation Box -->
            <div class="meeting-section-card mb-4">
              <div class="delegation-box">
                <VIcon
                  icon="tabler-refresh"
                  class="delegation-icon"
                  size="20"
                />
                <span class="delegation-text">Chuyển quyền điều hành</span>
                <span class="text-body-2 text-disabled ms-2">Người được chuyển quyền:</span>
                <VChip
                  size="small"
                  variant="outlined"
                >
                  Chưa chọn
                </VChip>
                <VSpacer />
                <VBtn
                  size="small"
                  color="primary"
                  variant="outlined"
                >
                  Ủy Quyền
                </VBtn>
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            lg="6"
          >
            <!-- Speech Register -->
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-hand-stop"
                    class="section-icon"
                  />
                  Danh sách đăng ký phát biểu
                  <span class="section-badge">{{ meeting.participants?.filter(p => p.attendance_status === 'present').length || 0 }} đại biểu</span>
                </div>
                <VBtn
                  v-if="['active', 'in_progress'].includes(meeting.status) && !isSpeakRequested"
                  size="small"
                  color="primary"
                  prepend-icon="tabler-hand-stop"
                  :loading="isRequestingSpeak"
                  @click="requestSpeak"
                >
                  Đăng Ký Phát Biểu
                </VBtn>
                <VBtn
                  v-else-if="isSpeakRequested"
                  size="small"
                  color="secondary"
                  variant="tonal"
                  @click="cancelSpeakRequest"
                >
                  Hủy yêu cầu
                </VBtn>
              </div>

              <table class="speech-table">
                <thead>
                  <tr>
                    <th style="width: 50px">
                      STT
                    </th>
                    <th>Đại biểu</th>
                    <th>Chức vụ</th>
                    <th>Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(participant, i) in (meeting.participants || []).filter(p => p.attendance_status === 'present').slice(0, 10)"
                    :key="participant.id"
                  >
                    <td>{{ i + 1 }}</td>
                    <td>
                      <div class="d-flex align-center">
                        <span
                          class="avatar-circle"
                          :class="['purple', 'green', 'blue', 'orange'][i % 4]"
                        >{{ (participant.user?.name || 'U').charAt(0) }}</span>
                        {{ participant.user?.name || 'Đại biểu' }}
                      </div>
                    </td>
                    <td>{{ participant.position || (['chairperson', 'chair'].includes(participant.meeting_role) ? 'Chủ tọa' : (participant.meeting_role === 'secretary' ? 'Thư ký' : 'Đại biểu')) }}</td>
                    <td>{{ participant.created_at?.split(' ')[0]?.slice(0, 5) || '--:--' }}</td>
                  </tr>
                </tbody>
              </table>

              <div
                v-if="!meeting.participants?.length"
                class="pa-5 text-center text-disabled"
              >
                Chưa có đại biểu nào
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            lg="6"
          >
            <!-- Speech History -->
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-history"
                    class="section-icon"
                  />
                  Lịch sử phát biểu
                  <span class="section-badge">0 lượt phát biểu</span>
                </div>
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-download"
                >
                  Xuất Danh Sách
                </VBtn>
              </div>

              <div class="pa-6 text-center text-medium-emphasis">
                <VIcon
                  icon="tabler-microphone-off"
                  size="40"
                  class="mb-2 opacity-50"
                />
                <p>Chưa có lịch sử phát biểu</p>
              </div>
            </div>
          </VCol>
        </VRow>
      </VWindowItem>

      <!-- ========== TAB 4: BIỂU QUYẾT ========== -->
      <VWindowItem value="voting">
        <VRow>
          <VCol
            cols="12"
            lg="6"
          >
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-clipboard-text"
                    class="section-icon"
                  />
                  Nội dung biểu quyết
                </div>
                <span
                  v-if="['active', 'in_progress'].includes(meeting.status)"
                  class="section-badge"
                  style="background: #fef3c7; color: #d97706;"
                >
                  Thời gian biểu quyết đang diễn ra
                </span>
              </div>

              <div
                v-if="meeting.votes?.length > 0"
                class="pa-0"
              >
                <div
                  v-for="vote in meeting.votes"
                  :key="vote.id"
                  class="vote-item d-flex align-center justify-space-between"
                >
                  <div class="flex-grow-1">
                    {{ vote.title }}
                  </div>
                  <VBtn
                    v-if="vote.status === 'open'"
                    size="small"
                    color="primary"
                    variant="outlined"
                    @click="activeVote = vote; isVotingModalOpen = true"
                  >
                    Đang biểu quyết
                    <VIcon
                      icon="tabler-chevron-right"
                      size="16"
                      class="ms-1"
                    />
                  </VBtn>
                  <VChip
                    v-else
                    size="small"
                    variant="outlined"
                    :color="vote.status === 'closed' ? 'secondary' : 'warning'"
                  >
                    {{ vote.status === 'closed' ? 'Đã kết thúc' : 'Chờ biểu quyết' }}
                  </VChip>
                </div>
              </div>

              <div
                v-else
                class="pa-6 text-center text-medium-emphasis"
              >
                <VIcon
                  icon="tabler-chart-off"
                  size="40"
                  class="mb-2 opacity-50"
                />
                <p>Chưa có nội dung biểu quyết</p>
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            lg="6"
          >
            <!-- Vote Results Summary -->
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-chart-bar"
                    class="section-icon"
                  />
                  Tóm tắt kết quả biểu quyết
                </div>
              </div>

              <div
                v-if="meeting.votes?.length > 0"
                class="pa-0"
              >
                <div
                  v-for="vote in meeting.votes"
                  :key="vote.id"
                  class="vote-item"
                >
                  <div class="vote-title-text">
                    {{ vote.title }}
                  </div>
                  <div class="vote-status-indicator">
                    <span
                      class="dot"
                      :class="vote.status === 'open' ? 'active' : 'pending'"
                    />
                    Trạng thái: <strong class="ms-1">{{ vote.status === 'open' ? 'Đang biểu quyết' : (vote.status === 'closed' ? 'Đã kết thúc' : 'Chờ biểu quyết') }}</strong>
                  </div>
                  <div class="vote-counts">
                    <span class="count-agree">Đồng ý: {{ vote.agree_count || 0 }}</span>
                    <span class="count-disagree">Không đồng ý: {{ vote.disagree_count || 0 }}</span>
                    <span class="count-abstain">Không ý kiến: {{ vote.abstain_count || 0 }}</span>
                  </div>
                </div>
              </div>

              <div v-else>
                <div class="meeting-info-alert">
                  <VIcon
                    icon="tabler-info-circle"
                    class="alert-icon"
                    size="20"
                  />
                  <p>Các kết quả trên chỉ mang tính minh họa phía giao diện. Khi tích hợp hệ thống thực tế, dữ liệu sẽ được cập nhật theo thời gian thực từ máy chủ.</p>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VWindowItem>

      <!-- ========== TAB 5: KẾT LUẬN CUỘC HỌP ========== -->
      <VWindowItem value="conclusions">
        <VRow>
          <VCol
            cols="12"
            lg="7"
          >
            <!-- Conclusion Documents -->
            <div class="meeting-section-card mb-4">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-file-check"
                    class="section-icon"
                  />
                  Tài liệu kết luận
                  <span class="section-badge">{{ meeting.conclusions?.length || 0 }} tài liệu</span>
                </div>
              </div>

              <template v-if="meeting.conclusions?.length > 0">
                <table class="meeting-doc-table">
                  <thead>
                    <tr>
                      <th style="width: 50px">
                        STT
                      </th>
                      <th>Tên tài liệu</th>
                      <th style="width: 120px">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(conclusion, i) in meeting.conclusions"
                      :key="conclusion.id"
                    >
                      <td>{{ i + 1 }}</td>
                      <td>
                        <div>
                          <div class="font-weight-medium">
                            {{ conclusion.title }}
                          </div>
                          <div
                            v-if="conclusion.content"
                            class="text-caption text-disabled"
                          >
                            {{ conclusion.content?.substring(0, 80) }}...
                          </div>
                        </div>
                      </td>
                      <td>
                        <VBtn
                          icon
                          size="small"
                          variant="text"
                        >
                          <VIcon icon="tabler-dots-vertical" />
                        </VBtn>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>

              <div
                v-else
                class="pa-6 text-center text-medium-emphasis"
              >
                <VIcon
                  icon="tabler-file-off"
                  size="40"
                  class="mb-2 opacity-50"
                />
                <p>Chưa có kết luận nào</p>
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            lg="5"
          >
            <!-- Admin Notes / Guidance -->
            <div class="stats-card mb-4">
              <div class="stats-header">
                <div class="stats-title d-flex align-center gap-2">
                  <VIcon
                    icon="tabler-info-circle"
                    size="18"
                    color="primary"
                  />
                  Ghi chú hành chính
                </div>
                <span class="section-badge">Hướng dẫn nghiệp vụ</span>
              </div>
              <div class="admin-notes">
                <div class="admin-note-item">
                  <h4>Thời hạn phản hồi biên bản</h4>
                  <p>Thành viên tham dự cần xem lại biên bản và gửi phản hồi (nếu cần) trong...</p>
                </div>
                <div class="admin-note-item">
                  <h4>Hiệu lực của biên bản</h4>
                  <p>Sau thời hạn trên, biên bản được xem là chính thức và là căn cứ triển khai...</p>
                </div>
                <div class="admin-note-item">
                  <h4>Lưu trữ hồ sơ điện tử</h4>
                  <p>Tài liệu, tệp đính kèm và kết quả biểu quyết điện tử được lưu trữ theo quy...</p>
                </div>
              </div>
            </div>

            <!-- Confirmation Section -->
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-certificate"
                    class="section-icon"
                  />
                  Thông tin xác nhận
                </div>
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-printer"
                >
                  In Biên Bản Kết Luận
                </VBtn>
              </div>
              <div class="confirmation-section">
                <div class="confirmation-row">
                  <div class="confirmation-item">
                    <div class="confirm-label">
                      Người ký kết luận
                    </div>
                    <div class="confirm-name">
                      {{ getChairperson()?.user?.name || 'Chưa chỉ định' }}
                    </div>
                    <div class="confirm-role">
                      {{ getChairperson()?.position || 'Chủ tọa' }}
                    </div>
                  </div>
                  <div class="confirmation-item">
                    <div class="confirm-label">
                      Thư ký cuộc họp
                    </div>
                    <div class="confirm-name">
                      {{ getSecretary()?.user?.name || 'Chưa chỉ định' }}
                    </div>
                    <div class="confirm-role">
                      Phụ trách ghi biên bản và tổng hợp tài liệu.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VWindowItem>
    </VWindow>
  </div>

  <!-- ===== VOTING MODAL (Popup khi Admin mở biểu quyết) ===== -->
  <VDialog
    v-model="isVotingModalOpen"
    persistent
    max-width="500"
  >
    <VCard v-if="activeVote">
      <VCardTitle class="text-h5 pa-5">
        <VIcon
          icon="tabler-chart-bar"
          class="me-2"
        />
        Biểu quyết
      </VCardTitle>
      <VDivider />
      <VCardText>
        <h6 class="text-h6 mb-4">
          {{ activeVote.title }}
        </h6>
        <p
          v-if="activeVote.description"
          class="text-body-1 text-medium-emphasis mb-4"
        >
          {{ activeVote.description }}
        </p>

        <!-- Loại: Đồng ý / Không đồng ý -->
        <template v-if="activeVote.voting_type === 'agree_disagree'">
          <VRadioGroup v-model="selectedVoteAnswer">
            <VRadio
              label="Đồng ý"
              value="agree"
              color="success"
            />
            <VRadio
              label="Không đồng ý"
              value="disagree"
              color="error"
            />
            <VRadio
              label="Không ý kiến"
              value="abstain"
              color="secondary"
            />
          </VRadioGroup>
        </template>

        <!-- Loại: Bỏ phiếu kín -->
        <template v-else-if="activeVote.voting_type === 'secret_ballot'">
          <VRadioGroup v-model="selectedVoteAnswer">
            <VRadio
              label="Tán thành"
              value="yes"
              color="success"
            />
            <VRadio
              label="Không tán thành"
              value="no"
              color="error"
            />
          </VRadioGroup>
        </template>

        <!-- Loại: Trắc nghiệm -->
        <template v-else>
          <VRadioGroup v-model="selectedVoteAnswer">
            <VRadio
              v-for="(option, idx) in (activeVote.options || ['A', 'B', 'C', 'D'])"
              :key="idx"
              :label="option"
              :value="option"
            />
          </VRadioGroup>
        </template>
      </VCardText>
      <VDivider />
      <VCardActions class="pa-5">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isVotingModalOpen = false; activeVote = null; selectedVoteAnswer = null"
        >
          Đóng
        </VBtn>
        <VBtn
          color="primary"
          :loading="isSubmittingVote"
          :disabled="selectedVoteAnswer === null"
          @click="submitVote"
        >
          Gửi biểu quyết
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ===== ABSENT MODAL ===== -->
  <VDialog v-model="isAbsentDialogOpen" max-width="500">
    <VCard>
      <VCardTitle class="text-h5 pa-5">
        <VIcon icon="tabler-user-x" class="me-2 text-error" />
        Báo vắng mặt
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-5">
        <p class="mb-4">Vui lòng nhập lý do vắng mặt để thông báo cho ban tổ chức.</p>
        <VTextarea
          v-model="absenceReason"
          label="Lý do vắng mặt"
          variant="outlined"
          rows="3"
        />
      </VCardText>
      <VDivider />
      <VCardActions class="pa-5">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isAbsentDialogOpen = false"
        >
          Hủy
        </VBtn>
        <VBtn
          color="error"
          variant="elevated"
          :loading="isCheckinSubmitting"
          :disabled="!absenceReason.trim()"
          @click="handleSelfCheckin('absent')"
        >
          Xác nhận báo vắng
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ===== DELEGATE MODAL ===== -->
  <VDialog v-model="isDelegateDialogOpen" max-width="500">
    <VCard>
      <VCardTitle class="text-h5 pa-5">
        <VIcon icon="tabler-arrow-autofit-right" class="me-2 text-warning" />
        Ủy quyền tham dự
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-5">
        <p class="mb-4">Chọn người mà bạn muốn ủy quyền tham dự cuộc họp này thay cho bạn.</p>
        <VSelect
          v-model="delegatedToId"
          :items="availableUsers"
          item-title="name"
          item-value="id"
          label="Người được ủy quyền"
          variant="outlined"
          :loading="availableUsers.length === 0"
        />
      </VCardText>
      <VDivider />
      <VCardActions class="pa-5">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isDelegateDialogOpen = false"
        >
          Hủy
        </VBtn>
        <VBtn
          color="warning"
          variant="elevated"
          :loading="isCheckinSubmitting"
          :disabled="!delegatedToId"
          @click="handleSelfCheckin('delegated')"
        >
          Ủy quyền
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.custom-textarea {
  resize: none;
  border: none;
  background: transparent;
  color: inherit;
  outline: none;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  min-block-size: 250px;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.blink-animation {
  animation: blink 1.5s ease-in-out infinite;
}
</style>
