<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import {
  changeMeetingStatus,
  fetchMeeting,
} from '@/modules/meetings/services/meetingService'
import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AgendaTab from '@/modules/meetings/components/admin/live-tabs/AgendaTab.vue'
import ConclusionsTab from '@/modules/meetings/components/admin/live-tabs/ConclusionsTab.vue'
import DocumentsTab from '@/modules/meetings/components/admin/live-tabs/DocumentsTab.vue'
import ExecutiveTab from '@/modules/meetings/components/admin/live-tabs/ExecutiveTab.vue'
import VotingTab from '@/modules/meetings/components/admin/live-tabs/VotingTab.vue'

const activeTab = ref('agenda')

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()

const snackbar = ref({ show: false, message: '', color: 'success' })

const showMessage = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

const loading = ref(true)
const meeting = ref(null)

// Current live state
const meetingStatus = ref('draft') 

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
    if (diff <= 0) clearInterval(countdownInterval)
  }, 1000)
}

const loadMeeting = async () => {
  try {
    loading.value = true

    const res = await fetchMeeting(route.params.id)
    if (res.success && res.data) {
      meeting.value = res.data
      meetingStore.setCurrentMeeting(res.data)
      meetingStatus.value = res.data.status || 'draft'
      if (meetingStatus.value === 'in_progress' || meetingStatus.value === 'active') {
        startCountdown()
      }
    } else {
      showMessage('Không thể tải thông tin cuộc họp', 'error')
    }
  } catch (error) {
    console.error(error)
    showMessage('Có lỗi xảy ra khi tải cuộc họp', 'error')
  } finally {
    loading.value = false
  }
}

const handleStartMeeting = async () => {
  try {
    const res = await changeMeetingStatus(meeting.value.id, 'active')
    if (res.success) {
      meetingStatus.value = 'active'
      meeting.value.status = 'active'
      showMessage('Đã bắt đầu cuộc họp', 'success')
      startCountdown()
    } else {
      showMessage(res.message || 'Lỗi khi bắt đầu cuộc họp', 'error')
    }
  } catch (err) {
    console.error(err)
    showMessage('Có lỗi xảy ra', 'error')
  }
}

const handleEndMeeting = async () => {
  try {
    const res = await changeMeetingStatus(meeting.value.id, 'completed')
    if (res.success) {
      meetingStatus.value = 'completed'
      meeting.value.status = 'completed'
      if (countdownInterval) clearInterval(countdownInterval)
      showMessage('Đã kết thúc cuộc họp', 'success')
    } else {
      showMessage(res.message || 'Lỗi khi kết thúc cuộc họp', 'error')
    }
  } catch (err) {
    console.error(err)
    showMessage('Có lỗi xảy ra', 'error')
  }
}

onMounted(() => {
  loadMeeting()
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div class="h-100 d-flex flex-column surface-ground">
    <VOverlay
      :model-value="loading"
      class="align-center justify-center"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </VOverlay>

    <template v-if="!loading && meeting">
      <!-- Top navbar/header -->
      <!-- Top navbar/header -->
      <div class="px-4 pt-4 mb-4">
        <VCard
          elevation="0"
          style="border-radius: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);"
        >
          <div
            class="d-flex align-center justify-space-between w-100"
            style="padding: 24px 32px;"
          >
            <!-- Left side -->
            <div
              class="d-flex flex-column gap-2"
              style="max-width: 60%"
            >
              <div class="d-flex align-center mb-1">
                <VChip
                  size="small"
                  variant="flat"
                  color="white"
                  style="color: #6366f1; border: 1px solid #c7d2fe; font-weight: 600;"
                >
                  <VIcon
                    start
                    size="16"
                    color="#6366f1"
                  >
                    tabler-calendar-event
                  </VIcon> {{ meeting.location || 'Cuộc họp' }}
                </VChip>
              </div>
              <h2
                class="text-h4 font-weight-black mb-0 text-uppercase"
                style="color: #334155; line-height: 1.2;"
              >
                {{ meeting.title || 'Đang tải...' }}
              </h2>
              <div
                class="text-body-1 mt-1"
                style="color: #475569; font-weight: 500;"
              >
                {{ meeting.description || 'Trung tâm điều hành cuộc họp, quản lý nội dung và ghi nhận ý kiến, biểu quyết theo thời gian thực.' }}
              </div>
            </div>
            
            <!-- Right side -->
            <div class="d-flex flex-column align-end gap-3">
              <!-- Timer Box -->
              <VCard
                elevation="0"
                class="px-5 py-3"
                style="border-radius: 16px; min-width: 320px; box-shadow: 0 4px 15px rgba(0,0,0,0.02) !important;"
              >
                <div class="d-flex justify-space-between align-start mb-1">
                  <span
                    class="text-caption font-weight-bold text-uppercase"
                    style="color: #94a3b8; letter-spacing: 0.5px;"
                  >Thời gian còn lại</span>
                  <VChip
                    size="small"
                    :color="meetingStatus === 'active' ? '#fee2e2' : meetingStatus === 'completed' ? '#f1f5f9' : '#fef3c7'"
                    :text-color="meetingStatus === 'active' ? '#ef4444' : meetingStatus === 'completed' ? '#64748b' : '#d97706'"
                    style="font-weight: 700;"
                    variant="flat"
                  >
                    <span :style="{ color: meetingStatus === 'active' ? '#ef4444' : meetingStatus === 'completed' ? '#64748b' : '#d97706' }">
                      {{ meetingStatus === 'active' ? 'Đang diễn ra' : meetingStatus === 'completed' ? 'Đã kết thúc' : 'Chưa bắt đầu' }}
                    </span>
                  </VChip>
                </div>
                <div class="d-flex align-center gap-2">
                  <VAvatar
                    color="#fee2e2"
                    size="36"
                    variant="flat"
                    class="mr-1"
                  >
                    <VIcon
                      size="20"
                      color="#ef4444"
                    >
                      tabler-hourglass-high
                    </VIcon>
                  </VAvatar>
                  <span
                    class="font-weight-bold"
                    style="font-size: 2.25rem; color: #475569; font-variant-numeric: tabular-nums; line-height: 1;"
                  >
                    {{ countdownDisplay }}
                  </span>
                </div>
              </VCard>

              <!-- Actions -->
              <div class="d-flex gap-3">
                <VBtn
                  v-if="meetingStatus === 'draft'"
                  color="success"
                  variant="flat"
                  prepend-icon="tabler-player-play"
                  style="border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;"
                  @click="handleStartMeeting"
                >
                  Bắt đầu họp
                </VBtn>

                <VBtn
                  v-if="meetingStatus === 'active'"
                  color="#fee2e2"
                  variant="flat"
                  prepend-icon="tabler-hand-stop"
                  style="color: #ef4444; border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem;"
                  @click="handleEndMeeting"
                >
                  Tạm Dừng Cuộc Họp
                </VBtn>
                
                <VBtn
                  color="#6366f1"
                  variant="flat"
                  prepend-icon="tabler-share"
                  style="color: white; border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem;"
                >
                  Uỷ Quyền Điều Hành
                </VBtn>
              </div>
            </div>
          </div>
        </VCard>
      </div>

      <!-- Main Layout -->
      <VContainer
        fluid
        class="flex-grow-1 px-4 py-0"
        style="min-height: calc(100vh - 230px);"
      >
        <!-- Tabs Setup -->
        <VCard
          class="mb-4"
          elevation="0"
          style="border-radius: 12px; border: 1px solid #f1f1f4; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
        >
          <VTabs
            v-model="activeTab"
            color="primary"
            bg-color="white"
            height="56"
            show-arrows
          >
            <VTab
              value="agenda"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                tabler-list-details
              </VIcon> Chương trình họp
            </VTab>
            <VTab
              value="documents"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                tabler-file-text
              </VIcon> Tài liệu họp
            </VTab>
            <VTab
              value="executive"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                tabler-adjustments-alt
              </VIcon> Thông tin điều hành
            </VTab>
            <VTab
              value="voting"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                tabler-checkbox
              </VIcon> Biểu quyết
            </VTab>
            <VTab
              value="conclusions"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                tabler-file-check
              </VIcon> Kết luận cuộc họp
            </VTab>
          </VTabs>
        </VCard>

        <VWindow 
          v-model="activeTab" 
          class="pb-10" 
          style="overflow: visible;"
          transition="none"
          reverse-transition="none"
        >
          <VWindowItem
            value="agenda"
            transition="none"
            reverse-transition="none"
          >
            <AgendaTab :meeting="meeting" />
          </VWindowItem>
          
          <VWindowItem
            value="documents"
            transition="none"
            reverse-transition="none"
          >
            <DocumentsTab :meeting="meeting" />
          </VWindowItem>
          
          <VWindowItem
            value="executive"
            transition="none"
            reverse-transition="none"
          >
            <ExecutiveTab :meeting="meeting" />
          </VWindowItem>
          
          <VWindowItem
            value="voting"
            transition="none"
            reverse-transition="none"
          >
            <VotingTab :meeting="meeting" />
          </VWindowItem>

          <VWindowItem
            value="conclusions"
            transition="none"
            reverse-transition="none"
          >
            <ConclusionsTab :meeting="meeting" />
          </VWindowItem>
        </VWindow>
      </VContainer>
    </template>

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <VBtn
          variant="text"
          icon="tabler-x"
          @click="snackbar.show = false"
        />
      </template>
    </VSnackbar>
  </div>
</template>

<style scoped>
.surface-ground {
  background-color: rgb(var(--v-theme-background));
}

.bg-error {
  background-color: rgb(var(--v-theme-error)) !important;
}
</style>
