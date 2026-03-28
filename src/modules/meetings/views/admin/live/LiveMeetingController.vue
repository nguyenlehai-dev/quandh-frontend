<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import {
  approveSpeechRequest,
  changeMeetingStatus,
  closeVoting,
  fetchMeeting,
  fetchMeetingDocuments,
  fetchMeetingVotes,
  fetchSpeechRequests,
  openVoting,
  rejectSpeechRequest,
  setActiveAgenda,
} from '@/modules/meetings/services/meetingService'
import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()

const loading = ref(true)
const meeting = ref(null)

// Current live state
const meetingStatus = ref('draft') // draft, scheduled, active, in_progress, completed, cancelled
const activeAgendaIndex = ref(0)
const attendees = ref([])

// Documents drawer
const isDocDrawerOpen = ref(false)
const documents = ref([])
const isLoadingDocs = ref(false)

// Voting dialog
const isVoteDialogOpen = ref(false)
const votes = ref([])
const isLoadingVotes = ref(false)
const isActivatingVote = ref(false)

// Speech requests
const speechRequests = ref([])

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
  const total = attendees.value.length
  const present = attendees.value.filter(a => a.status === 'online').length
  const absent = attendees.value.filter(a => a.status === 'offline').length

  return { total, present, absent }
})

watch(() => meeting.value, newMeeting => {
  if (newMeeting?.participants?.length) {
    attendees.value = newMeeting.participants.map(p => {
      let roleLabel = 'Đại biểu'
      if (p.role === 'chairperson') roleLabel = 'Chủ tọa'
      else if (p.role === 'secretary') roleLabel = 'Thư ký'

      return {
        id: p.id,
        // eslint-disable-next-line camelcase
        user_id: p.user_id,
        name: p.user?.name || 'Đại biểu vô danh',
        role: roleLabel,

        // Dùng attendance_status tạm làm online/offline (chưa có presence channel)
        status: p.attendance_status === 'present' ? 'online' : 'offline',
        isSpeaking: false,
        requestSpeak: false,
      }
    })
  }
}, { immediate: true, deep: true })

const loadMeeting = async () => {
  loading.value = true
  try {
    const res = await fetchMeeting(route.params.id)

    meeting.value = res.data
    meetingStore.setCurrentMeeting(meeting.value)
    if (meeting.value.status) {
      meetingStatus.value = meeting.value.status
    }

    // Subscribe to WebSockets
    meetingStore.subscribeToMeeting(meeting.value.id)

    // Load speech requests if meeting is active
    if (['active', 'in_progress'].includes(meeting.value.status)) {
      loadSpeechRequests()
    }

    startCountdown()
  }
  catch (error) {
    console.error('Failed to load meeting', error)
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

// Watch store for WS sync updates
watch(() => meetingStore.currentMeeting, newVal => {
  if (newVal) {
    meetingStatus.value = newVal.status || meetingStatus.value
  }
}, { deep: true })

watch(() => meetingStore.activeAgendaId, newId => {
  if (newId !== null && meeting.value?.agendas) {
    const idx = meeting.value.agendas.findIndex(a => a.id === newId)
    if (idx !== -1) {
      activeAgendaIndex.value = idx
    }
  }
}, { immediate: true })

const startMeeting = async () => {
  try {
    await changeMeetingStatus(meeting.value.id, 'active')
    meetingStatus.value = 'active'
    meeting.value.status = 'active'

    // Automatically set the first agenda as active if exists
    if (meeting.value.agendas?.length > 0) {
      await setActiveAgenda(meeting.value.id, meeting.value.agendas[0].id)
      activeAgendaIndex.value = 0
    }
  }
  catch (error) {
    console.error('Failed to start meeting:', error)
  }
}

const nextAgenda = async () => {
  if (meeting.value?.agendas && activeAgendaIndex.value < meeting.value.agendas.length - 1) {
    try {
      const nextIndex = activeAgendaIndex.value + 1
      const nextId = meeting.value.agendas[nextIndex].id

      await setActiveAgenda(meeting.value.id, nextId)
      activeAgendaIndex.value = nextIndex
    }
    catch (error) {
      console.error('Failed to switch agenda:', error)
    }
  }
}

const endMeeting = async () => {
  if (!confirm('Bạn có chắc chắn muốn kết thúc cuộc họp?')) return
  try {
    await changeMeetingStatus(meeting.value.id, 'completed')
    meetingStatus.value = 'completed'
    meeting.value.status = 'completed'
  }
  catch (error) {
    console.error('Failed to end meeting:', error)
  }
}

// ===== TRÌNH CHIẾU TÀI LIỆU =====
const openDocumentDrawer = async () => {
  isDocDrawerOpen.value = true
  isLoadingDocs.value = true
  try {
    const res = await fetchMeetingDocuments(meeting.value.id)

    documents.value = res.data || []
  }
  catch (error) {
    console.error('Failed to load documents:', error)
  }
  finally {
    isLoadingDocs.value = false
  }
}

// ===== MỞ BIỂU QUYẾT =====
const openVoteDialog = async () => {
  isVoteDialogOpen.value = true
  isLoadingVotes.value = true
  try {
    const res = await fetchMeetingVotes(meeting.value.id)

    votes.value = res.data || []
  }
  catch (error) {
    console.error('Failed to load votes:', error)
  }
  finally {
    isLoadingVotes.value = false
  }
}

const activateVote = async voteId => {
  isActivatingVote.value = true
  try {
    await openVoting(meeting.value.id, voteId)

    // Cập nhật UI ngay lập tức
    const vote = votes.value.find(v => v.id === voteId)
    if (vote) vote.status = 'open'
  }
  catch (error) {
    console.error('Failed to activate vote:', error)
  }
  finally {
    isActivatingVote.value = false
  }
}

const closeVoteSession = async voteId => {
  try {
    await closeVoting(meeting.value.id, voteId)

    const vote = votes.value.find(v => v.id === voteId)
    if (vote) vote.status = 'closed'
  }
  catch (error) {
    console.error('Failed to close vote:', error)
  }
}

const resolveVoteStatusColor = status => {
  if (status === 'open') return 'success'
  if (status === 'closed') return 'error'

  return 'warning'
}

const resolveVoteStatusLabel = status => {
  if (status === 'open') return 'Đang mở'
  if (status === 'closed') return 'Đã đóng'

  return 'Chờ mở'
}

const toggleSpeak = attendee => {
  attendee.isSpeaking = !attendee.isSpeaking
  if (attendee.isSpeaking) attendee.requestSpeak = false
}

// ===== ĐĂNG KÝ PHÁT BIỂU (Admin quản lý) =====
const loadSpeechRequests = async () => {
  if (!meeting.value?.id) return
  try {
    const res = await fetchSpeechRequests(meeting.value.id)

    speechRequests.value = res.data || []
  }
  catch (error) {
    console.error('Failed to load speech requests:', error)
  }
}

const handleApproveSpeech = async requestId => {
  try {
    await approveSpeechRequest(meeting.value.id, requestId)
    speechRequests.value = speechRequests.value.filter(r => r.id !== requestId)
  }
  catch (error) {
    console.error('Failed to approve speech request:', error)
  }
}

const handleRejectSpeech = async requestId => {
  try {
    await rejectSpeechRequest(meeting.value.id, requestId)
    speechRequests.value = speechRequests.value.filter(r => r.id !== requestId)
  }
  catch (error) {
    console.error('Failed to reject speech request:', error)
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
            <span :class="resolveStatusBadgeClass(meetingStatus)">
              {{ resolveStatusLabel(meetingStatus) }}
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
              /> Thời gian
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
        <div class="meeting-info-item">
          <div>
            <div class="info-label">
              <VIcon
                icon="tabler-wifi"
                size="12"
                class="me-1"
              /> Trạng thái đồng bộ
            </div>
            <div class="info-value d-flex align-center gap-1">
              <VIcon
                :icon="meetingStatus === 'active' ? 'tabler-circle-filled' : 'tabler-circle'"
                :color="meetingStatus === 'active' ? 'success' : 'disabled'"
                size="10"
              />
              {{ meetingStatus === 'active' ? 'Đang phát sóng' : 'Chưa phát sóng' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== ADMIN CONTROL PANEL ==================== -->
    <VRow class="match-height">
      <!-- Main Content Area -->
      <VCol
        cols="12"
        lg="8"
      >
        <div class="meeting-section-card">
          <div class="meeting-section-header">
            <div class="meeting-section-title">
              <VIcon
                icon="tabler-dashboard"
                class="section-icon"
              />
              Bảng điều khiển cuộc họp
            </div>
          </div>

          <!-- ===== NOT STARTED ===== -->
          <div
            v-if="['draft', 'scheduled'].includes(meetingStatus)"
            class="text-center pa-12"
          >
            <VIcon
              icon="tabler-player-play"
              size="64"
              color="primary"
              class="mb-4 opacity-50"
            />
            <h5 class="text-h5 mb-2">
              Cuộc họp chưa bắt đầu
            </h5>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Nhấn nút bên dưới để chính thức bắt đầu và đồng bộ màn hình đến tất cả đại biểu.
            </p>
            <VBtn
              size="large"
              color="success"
              prepend-icon="tabler-player-play-filled"
              @click="startMeeting"
            >
              Bắt đầu Cuộc họp
            </VBtn>
          </div>

          <!-- ===== MEETING ACTIVE ===== -->
          <div v-else>
            <!-- Current Agenda Focus -->
            <div class="time-block">
              <div class="time-icon">
                <VIcon
                  icon="tabler-player-play-filled"
                  size="16"
                />
              </div>
              <div class="flex-grow-1">
                <div
                  class="text-overline mb-0"
                  style="font-size: 0.7rem; color: #7c3aed; font-weight: 700;"
                >
                  NỘI DUNG ĐANG BÀN LUẬN
                </div>
                <div class="time-text">
                  {{ meeting.agendas?.[activeAgendaIndex]?.title || 'Không có chương trình' }}
                </div>
                <div class="d-flex align-center gap-4 mt-1">
                  <span class="text-body-2 text-disabled d-flex align-center gap-1">
                    <VIcon
                      icon="tabler-clock"
                      size="14"
                    />
                    {{ meeting.agendas?.[activeAgendaIndex]?.duration || 0 }} phút
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="d-flex gap-3 flex-wrap pa-5">
              <VBtn
                color="primary"
                variant="elevated"
                prepend-icon="tabler-presentation"
                @click="openDocumentDrawer"
              >
                Trình chiếu Tài liệu
              </VBtn>
              <VBtn
                color="info"
                variant="elevated"
                prepend-icon="tabler-chart-bar"
                @click="openVoteDialog"
              >
                Mở Biểu quyết
              </VBtn>
              <VSpacer />
              <VBtn
                color="secondary"
                variant="tonal"
                append-icon="tabler-arrow-right"
                :disabled="!meeting.agendas || activeAgendaIndex >= meeting.agendas.length - 1"
                @click="nextAgenda"
              >
                Chuyển nội dung tiếp
              </VBtn>
              <VBtn
                color="error"
                variant="elevated"
                prepend-icon="tabler-player-stop-filled"
                @click="endMeeting"
              >
                Kết thúc cuộc họp
              </VBtn>
            </div>

            <!-- Agenda List -->
            <VDivider />
            <div class="px-5 pt-4 pb-2">
              <div class="meeting-section-title mb-3">
                <VIcon
                  icon="tabler-list-details"
                  class="section-icon"
                />
                Chương trình họp
              </div>
            </div>
            <div
              v-if="meeting.agendas?.length"
              class="agenda-list"
            >
              <div
                v-for="(agenda, i) in meeting.agendas"
                :key="i"
                class="agenda-item cursor-pointer"
                
                @click="setActiveAgenda(meeting.id, agenda.id).then(() => { activeAgendaIndex = i }).catch(() => {})"
              >
                <div
                  class="agenda-number"
                  :class="{ active: i === activeAgendaIndex }"
                >
                  {{ i + 1 }}
                </div>
                <div class="agenda-content">
                  <div class="agenda-title-text">
                    {{ agenda.title }}
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
          </div>
        </div>
      </VCol>

      <!-- Attendee Sidebar -->
      <VCol
        cols="12"
        lg="4"
      >
        <!-- Attendance Stats -->
        <div class="stats-card mb-4">
          <div class="stats-header">
            <div class="stats-title d-flex align-center gap-2">
              <VIcon
                icon="tabler-users"
                size="18"
                color="primary"
              />
              Đại biểu tham dự
            </div>
            <VChip
              size="small"
              color="primary"
            >
              {{ attendanceStats.present }}/{{ attendanceStats.total }}
            </VChip>
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
              <span class="stat-value">{{ attendanceStats.present }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Vắng mặt</span>
              <div class="stat-bar-wrapper">
                <div
                  class="stat-bar absent"
                  :style="{ width: attendanceStats.total ? (attendanceStats.absent / attendanceStats.total * 100) + '%' : '0%' }"
                />
              </div>
              <span class="stat-value">{{ attendanceStats.absent }}</span>
            </div>
          </div>
        </div>

        <!-- Attendee List -->
        <div class="meeting-section-card mb-4">
          <div class="meeting-section-header">
            <div class="meeting-section-title">
              <VIcon
                icon="tabler-users-group"
                class="section-icon"
              />
              Danh sách đại biểu
            </div>
          </div>
          <VList
            lines="two"
            class="pa-0"
          >
            <template
              v-for="(attendee, index) in attendees"
              :key="attendee.id"
            >
              <VListItem>
                <template #prepend>
                  <VBadge
                    dot
                    location="bottom right"
                    offset-x="3"
                    offset-y="3"
                    :color="attendee.status === 'online' ? 'success' : 'error'"
                  >
                    <VAvatar
                      color="primary"
                      variant="tonal"
                      size="36"
                    >
                      <span class="text-body-2 font-weight-bold">{{ attendee.name.charAt(0) }}</span>
                    </VAvatar>
                  </VBadge>
                </template>

                <VListItemTitle class="font-weight-medium text-body-2">
                  {{ attendee.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-caption">
                  {{ attendee.role }}
                  <span
                    v-if="attendee.requestSpeak"
                    class="text-warning ms-2"
                  >
                    <VIcon
                      icon="tabler-hand-raise"
                      size="12"
                    /> Xin phát biểu
                  </span>
                </VListItemSubtitle>

                <template #append>
                  <IconBtn
                    size="small"
                    :color="attendee.isSpeaking ? 'error' : 'default'"
                    @click="toggleSpeak(attendee)"
                  >
                    <VIcon
                      :icon="attendee.isSpeaking ? 'tabler-microphone' : 'tabler-microphone-off'"
                      size="18"
                    />
                  </IconBtn>
                </template>
              </VListItem>
              <VDivider v-if="index !== attendees.length - 1" />
            </template>
          </VList>
          <div
            v-if="!attendees.length"
            class="pa-5 text-center text-disabled"
          >
            Chưa có đại biểu
          </div>
        </div>

        <!-- Speech Request Queue -->
        <div
          v-if="speechRequests.length"
          class="meeting-section-card"
        >
          <div class="meeting-section-header">
            <div class="meeting-section-title">
              <VIcon
                icon="tabler-hand-stop"
                class="section-icon"
              />
              Yêu cầu phát biểu
            </div>
            <VChip
              size="small"
              color="warning"
            >
              {{ speechRequests.length }}
            </VChip>
          </div>
          <VList class="pa-0">
            <VListItem
              v-for="req in speechRequests"
              :key="req.id"
            >
              <VListItemTitle class="font-weight-medium text-body-2">
                {{ req.user?.name || 'Đại biểu' }}
              </VListItemTitle>
              <template #append>
                <div class="d-flex gap-1">
                  <IconBtn
                    size="small"
                    color="success"
                    @click="handleApproveSpeech(req.id)"
                  >
                    <VIcon
                      icon="tabler-check"
                      size="16"
                    />
                  </IconBtn>
                  <IconBtn
                    size="small"
                    color="error"
                    @click="handleRejectSpeech(req.id)"
                  >
                    <VIcon
                      icon="tabler-x"
                      size="16"
                    />
                  </IconBtn>
                </div>
              </template>
            </VListItem>
          </VList>
        </div>
      </VCol>
    </VRow>
  </div>

  <!-- ===== DRAWER: Danh sách Tài liệu ===== -->
  <VNavigationDrawer
    v-model="isDocDrawerOpen"
    temporary
    location="end"
    width="420"
  >
    <VCardTitle class="d-flex align-center pa-4">
      <VIcon
        icon="tabler-file-text"
        class="me-2"
      />
      Tài liệu cuộc họp
      <VSpacer />
      <IconBtn @click="isDocDrawerOpen = false">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </VCardTitle>
    <VDivider />

    <div
      v-if="isLoadingDocs"
      class="text-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <VList
      v-else-if="documents.length"
      lines="two"
    >
      <VListItem
        v-for="doc in documents"
        :key="doc.id"
      >
        <template #prepend>
          <VIcon
            icon="tabler-file-description"
            color="primary"
          />
        </template>
        <VListItemTitle>{{ doc.title || doc.file_name }}</VListItemTitle>
        <VListItemSubtitle>{{ doc.document_type || 'Tài liệu' }}</VListItemSubtitle>
        <template #append>
          <VBtn
            v-if="doc.file_url"
            icon
            size="small"
            variant="text"
            :href="doc.file_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <VIcon icon="tabler-external-link" />
          </VBtn>
        </template>
      </VListItem>
    </VList>

    <div
      v-else
      class="text-center pa-10 text-medium-emphasis"
    >
      <VIcon
        icon="tabler-file-off"
        size="48"
        class="mb-4 opacity-50"
      />
      <p>Chưa có tài liệu nào</p>
    </div>
  </VNavigationDrawer>

  <!-- ===== DIALOG: Quản lý Biểu quyết ===== -->
  <VDialog
    v-model="isVoteDialogOpen"
    max-width="600"
  >
    <VCard>
      <VCardTitle class="d-flex align-center pa-5">
        <VIcon
          icon="tabler-chart-bar"
          class="me-2"
        />
        Quản lý Biểu quyết
        <VSpacer />
        <IconBtn @click="isVoteDialogOpen = false">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </VCardTitle>
      <VDivider />

      <VCardText v-if="isLoadingVotes">
        <div class="text-center pa-6">
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>
      </VCardText>

      <VCardText v-else-if="votes.length">
        <VList lines="two">
          <VListItem
            v-for="vote in votes"
            :key="vote.id"
          >
            <VListItemTitle class="font-weight-medium">
              {{ vote.title }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ vote.voting_type === 'agree_disagree' ? 'Đồng ý/Không đồng ý' : (vote.voting_type === 'multiple_choice' ? 'Trắc nghiệm' : 'Bỏ phiếu kín') }}
            </VListItemSubtitle>

            <template #append>
              <div class="d-flex align-center gap-2">
                <VChip
                  :color="resolveVoteStatusColor(vote.status)"
                  size="small"
                  label
                >
                  {{ resolveVoteStatusLabel(vote.status) }}
                </VChip>

                <VBtn
                  v-if="vote.status === 'pending'"
                  size="small"
                  color="success"
                  variant="tonal"
                  :loading="isActivatingVote"
                  @click="activateVote(vote.id)"
                >
                  Mở
                </VBtn>
                <VBtn
                  v-else-if="vote.status === 'open'"
                  size="small"
                  color="error"
                  variant="tonal"
                  @click="closeVoteSession(vote.id)"
                >
                  Đóng
                </VBtn>
              </div>
            </template>
          </VListItem>
        </VList>
      </VCardText>

      <VCardText
        v-else
        class="text-center pa-10 text-medium-emphasis"
      >
        <VIcon
          icon="tabler-chart-off"
          size="48"
          class="mb-4 opacity-50"
        />
        <p>Chưa có phiên biểu quyết nào. Vui lòng tạo trong mục "Tạo/Sửa Cuộc họp".</p>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background: #f9fafb;
}
</style>
