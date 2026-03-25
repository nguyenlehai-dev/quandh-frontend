<script setup>
import { changeMeetingStatus, fetchMeeting, setActiveAgenda } from '@/modules/meetings/services/meetingService'
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

watch(() => meeting.value, (newMeeting) => {
  if (newMeeting?.participants?.length) {
    attendees.value = newMeeting.participants.map(p => {
      let roleLabel = 'Đại biểu'
      if (p.role === 'chairperson') roleLabel = 'Chủ tọa'
      else if (p.role === 'secretary') roleLabel = 'Thư ký'

      return {
        id: p.id,
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
  } catch (error) {
    console.error('Failed to load meeting', error)
  } finally {
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
watch(() => meetingStore.currentMeeting, (newVal) => {
  if (newVal) {
    meetingStatus.value = newVal.status || meetingStatus.value
  }
}, { deep: true })

watch(() => meetingStore.activeAgendaId, (newId) => {
  if (newId !== null && meeting.value?.agendas) {
    const idx = meeting.value.agendas.findIndex(a => a.id === newId)
    if (idx !== -1) {
      activeAgendaIndex.value = idx
    }
  }
}, { immediate: true })

const startMeeting = async () => {
  try {
    const res = await changeMeetingStatus(meeting.value.id, 'active')
    meetingStatus.value = 'active'
    meeting.value.status = 'active'
    
    // Automatically set the first agenda as active if exists
    if (meeting.value.agendas?.length > 0) {
      await setActiveAgenda(meeting.value.id, meeting.value.agendas[0].id)
      activeAgendaIndex.value = 0
    }
  } catch (error) {
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
    } catch (error) {
      console.error('Failed to switch agenda:', error)
    }
  }
}

const toggleSpeak = (attendee) => {
  attendee.isSpeaking = !attendee.isSpeaking
  if (attendee.isSpeaking) attendee.requestSpeak = false
}
</script>

<template>
  <VRow v-if="loading">
    <VCol cols="12" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" />
    </VCol>
  </VRow>

  <VRow v-else-if="meeting" class="match-height">
    <!-- TRUNG TÂM & BẢNG ĐIỀU KHIỂN CHÍNH -->
    <VCol cols="12" lg="8">
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
          <div v-if="['draft', 'scheduled'].includes(meetingStatus)" class="text-center pa-10">
            <VIcon icon="tabler-player-play" size="64" color="primary" class="mb-4 opacity-50" />
            <h5 class="text-h5 mb-2">Cuộc họp chưa bắt đầu</h5>
            <p class="text-body-1 text-medium-emphasis mb-6">Nhấn nút bên dưới để chính thức bắt đầu và đồng bộ màn hình đến tất cả đại biểu.</p>
            <VBtn size="large" color="success" prepend-icon="tabler-player-play-filled" @click="startMeeting">
              Bắt đầu Cuộc họp
            </VBtn>
          </div>

          <div v-else>
            <!-- Current Agenda Focus -->
            <VAlert border="start" border-color="primary" variant="tonal" class="mb-6">
              <div class="text-overline mb-1 text-primary">NỘI DUNG ĐANG BÀN LUẬN</div>
              <h5 class="text-h5 font-weight-medium">
                {{ meeting.agendas?.[activeAgendaIndex]?.title || 'Không có chương trình' }}
              </h5>
              <div class="d-flex align-center gap-4 mt-3">
                <span class="d-flex align-center gap-1 text-body-2">
                  <VIcon icon="tabler-clock" size="16" /> {{ meeting.agendas?.[activeAgendaIndex]?.duration || 0 }} phút
                </span>
                <span v-if="meeting.agendas?.[activeAgendaIndex]?.presenter_id" class="d-flex align-center gap-1 text-body-2">
                  <VIcon icon="tabler-user-microphone" size="16" /> {{ meeting.agendas[activeAgendaIndex].presenter_id }}
                </span>
              </div>
            </VAlert>

            <!-- Quick Actions Base -->
            <div class="d-flex gap-4 flex-wrap">
              <VBtn color="primary" variant="elevated" prepend-icon="tabler-presentation">
                Trình chiếu Tài liệu
              </VBtn>
              <VBtn color="info" variant="elevated" prepend-icon="tabler-chart-bar">
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
                Chuyển nội dung tiếp theo
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- TRÁI/PHẢI SIDEBAR: QUẢN LÝ ĐẠI BIỂU -->
    <VCol cols="12" lg="4">
      <VCard class="h-100">
        <VCardItem class="bg-var-theme-background">
          <template #title>
            <div class="d-flex align-center gap-2">
              <VIcon icon="tabler-users" />
              Đại biểu tham dự
              <VSpacer />
              <VChip size="small" color="primary">{{ attendees.filter(a => a.status === 'online').length }}/{{ attendees.length }}</VChip>
            </div>
          </template>
        </VCardItem>
        <VDivider />
        <VList lines="two" class="pa-0">
          <template v-for="(attendee, index) in attendees" :key="attendee.id">
            <VListItem>
              <template #prepend>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  :color="attendee.status === 'online' ? 'success' : 'error'"
                >
                  <VAvatar color="primary" variant="tonal">
                    {{ attendee.name.charAt(0) }}
                  </VAvatar>
                </VBadge>
              </template>
              
              <VListItemTitle class="font-weight-medium">
                {{ attendee.name }}
              </VListItemTitle>
              <VListItemSubtitle>
                {{ attendee.role }}
                <span v-if="attendee.requestSpeak" class="text-warning ms-2">
                  <VIcon icon="tabler-hand-raise" size="14" /> Xin phát biểu
                </span>
              </VListItemSubtitle>

              <template #append>
                <IconBtn 
                  :color="attendee.isSpeaking ? 'error' : 'default'" 
                  @click="toggleSpeak(attendee)"
                >
                  <VIcon :icon="attendee.isSpeaking ? 'tabler-microphone' : 'tabler-microphone-off'" />
                  <VTooltip activator="parent" location="top">
                    {{ attendee.isSpeaking ? 'Tắt Mic' : 'Cấp quyền nói' }}
                  </VTooltip>
                </IconBtn>
              </template>
            </VListItem>
            <VDivider v-if="index !== attendees.length - 1" />
          </template>
        </VList>
      </VCard>
    </VCol>
  </VRow>
</template>
