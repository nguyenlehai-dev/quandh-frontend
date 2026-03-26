<script setup>
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
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
</script>

<template>
  <VRow v-if="loading">
    <VCol
      cols="12"
      class="text-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </VCol>
  </VRow>

  <VRow
    v-else-if="meeting"
    class="match-height"
  >
    <!-- TRUNG TÂM & BẢNG ĐIỀU KHIỂN CHÍNH -->
    <VCol
      cols="12"
      lg="8"
    >
      <VCard class="mb-4">
        <VCardItem>
          <template #title>
            <div class="d-flex align-center gap-4">
              <span class="text-h4 font-weight-bold blur-text">{{ meeting.title }}</span>
              <VChip
                :color="['active', 'in_progress'].includes(meetingStatus) ? 'success' : (['draft', 'scheduled'].includes(meetingStatus) ? 'warning' : 'secondary')"
                variant="elevated"
              >
                {{ ['active', 'in_progress'].includes(meetingStatus) ? 'Đang diễn ra' : (['draft', 'scheduled'].includes(meetingStatus) ? 'Chưa bắt đầu' : 'Đã kết thúc') }}
              </VChip>
              <VSpacer />
              <!-- Status Sync Indicator -->
              <VTooltip location="bottom">
                <template #activator="{ props }">
                  <VIcon
                    v-bind="props"
                    icon="tabler-wifi"
                    :color="meetingStatus === 'active' ? 'success' : 'disabled'"
                    class="me-2"
                  />
                </template>
                Trạng thái đồng bộ hiển thị
              </VTooltip>
            </div>
          </template>
        </VCardItem>
        <VDivider />

        <VCardText class="pa-6">
          <div
            v-if="['draft', 'scheduled'].includes(meetingStatus)"
            class="text-center pa-10"
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

          <div v-else>
            <!-- Current Agenda Focus -->
            <VAlert
              border="start"
              border-color="primary"
              variant="tonal"
              class="mb-6"
            >
              <div class="text-overline mb-1 text-primary">
                NỘI DUNG ĐANG BÀN LUẬN
              </div>
              <h5 class="text-h5 font-weight-medium">
                {{ meeting.agendas?.[activeAgendaIndex]?.title || 'Không có chương trình' }}
              </h5>
              <div class="d-flex align-center gap-4 mt-3">
                <span class="d-flex align-center gap-1 text-body-2">
                  <VIcon
                    icon="tabler-clock"
                    size="16"
                  /> {{ meeting.agendas?.[activeAgendaIndex]?.duration || 0 }} phút
                </span>
                <span
                  v-if="meeting.agendas?.[activeAgendaIndex]?.presenter_id"
                  class="d-flex align-center gap-1 text-body-2"
                >
                  <VIcon
                    icon="tabler-user-microphone"
                    size="16"
                  /> {{ meeting.agendas[activeAgendaIndex].presenter_id }}
                </span>
              </div>
            </VAlert>

            <!-- Quick Actions -->
            <div class="d-flex gap-4 flex-wrap">
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
                color="error"
                variant="elevated"
                prepend-icon="tabler-player-stop-filled"
                @click="endMeeting"
              >
                Kết thúc cuộc họp
              </VBtn>
              <VBtn
                color="secondary"
                variant="tonal"
                append-icon="tabler-arrow-right"
                :disabled="!meeting.agendas || activeAgendaIndex >= meeting.agendas.length - 1"
                @click="nextAgenda"
              >
                Chuyển nội dung tiếp theo
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- TRÁI/PHẢI SIDEBAR: QUẢN LÝ ĐẠI BIỂU -->
    <VCol
      cols="12"
      lg="4"
    >
      <VCard class="h-100">
        <VCardItem class="bg-var-theme-background">
          <template #title>
            <div class="d-flex align-center gap-2">
              <VIcon icon="tabler-users" />
              Đại biểu tham dự
              <VSpacer />
              <VChip
                size="small"
                color="primary"
              >
                {{ attendees.filter(a => a.status === 'online').length }}/{{ attendees.length }}
              </VChip>
            </div>
          </template>
        </VCardItem>
        <VDivider />
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
                  >
                    {{ attendee.name.charAt(0) }}
                  </VAvatar>
                </VBadge>
              </template>

              <VListItemTitle class="font-weight-medium">
                {{ attendee.name }}
              </VListItemTitle>
              <VListItemSubtitle>
                {{ attendee.role }}
                <span
                  v-if="attendee.requestSpeak"
                  class="text-warning ms-2"
                >
                  <VIcon
                    icon="tabler-hand-raise"
                    size="14"
                  /> Xin phát biểu
                </span>
              </VListItemSubtitle>

              <template #append>
                <IconBtn
                  :color="attendee.isSpeaking ? 'error' : 'default'"
                  @click="toggleSpeak(attendee)"
                >
                  <VIcon :icon="attendee.isSpeaking ? 'tabler-microphone' : 'tabler-microphone-off'" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    {{ attendee.isSpeaking ? 'Tắt Mic' : 'Cấp quyền nói' }}
                  </VTooltip>
                </IconBtn>
              </template>
            </VListItem>
            <VDivider v-if="index !== attendees.length - 1" />
          </template>
        </VList>
      </VCard>

      <!-- Speech Request Queue -->
      <VCard
        v-if="speechRequests.length"
        class="mt-4"
      >
        <VCardItem class="bg-var-theme-background">
          <template #title>
            <div class="d-flex align-center gap-2">
              <VIcon icon="tabler-hand-stop" />
              Yêu cầu phát biểu
              <VSpacer />
              <VChip
                size="small"
                color="warning"
              >
                {{ speechRequests.length }}
              </VChip>
            </div>
          </template>
        </VCardItem>
        <VDivider />
        <VList class="pa-0">
          <VListItem
            v-for="req in speechRequests"
            :key="req.id"
          >
            <VListItemTitle class="font-weight-medium">
              {{ req.user?.name || 'Đại biểu' }}
            </VListItemTitle>
            <template #append>
              <div class="d-flex gap-1">
                <IconBtn
                  color="success"
                  @click="handleApproveSpeech(req.id)"
                >
                  <VIcon icon="tabler-check" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Duyệt
                  </VTooltip>
                </IconBtn>
                <IconBtn
                  color="error"
                  @click="handleRejectSpeech(req.id)"
                >
                  <VIcon icon="tabler-x" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Từ chối
                  </VTooltip>
                </IconBtn>
              </div>
            </template>
          </VListItem>
        </VList>
      </VCard>
    </VCol>
  </VRow>

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
