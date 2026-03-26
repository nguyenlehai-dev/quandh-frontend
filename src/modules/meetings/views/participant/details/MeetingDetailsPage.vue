<script setup>
import { createPersonalNote, fetchMeeting, fetchPersonalNotes, updatePersonalNote } from '@/modules/meetings/services/meetingService'
import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import { watchDebounced } from '@vueuse/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'
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

// Voting Modal (nhận event qua WebSocket hoặc mở thủ công)
const isVotingModalOpen = ref(false)
const activeVote = ref(null)
const selectedVoteAnswer = ref(null)
const isSubmittingVote = ref(false)

// Speak request
const isSpeakRequested = ref(false)
const isRequestingSpeak = ref(false)
const speechRequestId = ref(null)

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

const resolveStatusColor = status => {
  if (status === 'active' || status === 'in_progress') return 'success'
  if (status === 'draft' || status === 'scheduled') return 'warning'

  return 'secondary'
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

  <VRow v-else-if="meeting">
    <VCol
      cols="12"
      lg="8"
    >
      <!-- Meeting Header -->
      <VCard class="mb-4">
        <VCardItem>
          <template #title>
            <h4 class="text-h4 mb-2">
              {{ meeting.title }}
            </h4>
          </template>
          <template #subtitle>
            <div class="d-flex flex-wrap gap-4 text-body-1">
              <span class="d-flex align-center gap-2">
                <VIcon icon="tabler-calendar-event" />
                {{ meeting.start_at || 'Chưa xác định' }}
              </span>
              <span class="d-flex align-center gap-2">
                <VIcon icon="tabler-map-pin" />
                {{ meeting.location || 'Họp trực tuyến' }}
              </span>
              <VChip
                size="small"
                :color="resolveStatusColor(meeting.status)"
              >
                {{ resolveStatusLabel(meeting.status) }}
              </VChip>
            </div>
          </template>
        </VCardItem>
        <VCardText
          v-if="meeting.description"
          class="pt-2 text-medium-emphasis"
        >
          {{ meeting.description }}
        </VCardText>

        <VDivider />
        <VTabs
          v-model="activeTab"
          class="v-tabs-pill"
        >
          <VTab value="agenda">
            Chương trình (Agenda)
          </VTab>
          <VTab value="documents">
            Tài liệu đính kèm
          </VTab>
        </VTabs>
      </VCard>

      <!-- Tabs Content -->
      <VWindow
        v-model="activeTab"
        class="disable-tab-transition"
      >
        <VWindowItem value="agenda">
          <VCard title="Chương trình cuộc họp">
            <VCardText v-if="meeting.agendas?.length > 0">
              <VTimeline
                density="compact"
                align="start"
              >
                <VTimelineItem
                  v-for="(agenda, i) in meeting.agendas"
                  :key="i"
                  :dot-color="meetingStore.activeAgendaId === agenda.id ? 'primary' : 'secondary'"
                  :size="meetingStore.activeAgendaId === agenda.id ? 'small' : 'x-small'"
                >
                  <div
                    v-if="meetingStore.activeAgendaId === agenda.id"
                    class="pa-3 bg-var-theme-background border rounded border-primary"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-h6 font-weight-bold text-primary">
                        <VIcon
                          icon="tabler-player-play-filled"
                          size="18"
                          class="me-1 blink-animation"
                        />
                        {{ agenda.title }}
                      </div>
                      <VChip
                        size="small"
                        color="primary"
                        variant="elevated"
                      >
                        Đang diễn ra
                      </VChip>
                    </div>
                    <div
                      v-if="agenda.presenter_id"
                      class="text-body-2 text-primary mt-1"
                    >
                      <VIcon
                        icon="tabler-user-microphone"
                        size="16"
                        class="me-1"
                      /> {{ agenda.presenter_id }}
                    </div>
                  </div>
                  <div v-else>
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-h6 font-weight-medium">
                        {{ agenda.title }}
                      </div>
                      <VChip
                        size="small"
                        variant="tonal"
                        class="text-primary"
                      >
                        {{ agenda.duration }} phút
                      </VChip>
                    </div>
                    <div
                      v-if="agenda.presenter_id"
                      class="text-body-2 text-disabled"
                    >
                      Người trình bày: {{ agenda.presenter_id }}
                    </div>
                  </div>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
            <VCardText v-else>
              <VAlert
                type="info"
                variant="tonal"
              >
                Chưa có chương trình họp.
              </VAlert>
            </VCardText>
          </VCard>
        </VWindowItem>

        <VWindowItem value="documents">
          <VCard title="Tài liệu cuộc họp">
            <VCardText v-if="meeting.documents?.length > 0">
              <VList
                lines="two"
                class="pa-0"
              >
                <template
                  v-for="(doc, i) in meeting.documents"
                  :key="doc.id"
                >
                  <VListItem>
                    <template #prepend>
                      <VAvatar
                        color="primary"
                        variant="tonal"
                      >
                        <VIcon icon="tabler-file-text" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-medium">
                      {{ doc.title }}
                    </VListItemTitle>
                    <VListItemSubtitle>{{ doc.description }}</VListItemSubtitle>
                    <template #append>
                      <IconBtn
                        color="primary"
                        variant="text"
                      >
                        <VIcon icon="tabler-download" />
                      </IconBtn>
                    </template>
                  </VListItem>
                  <VDivider v-if="i !== meeting.documents.length - 1" />
                </template>
              </VList>
            </VCardText>
            <VCardText v-else>
              <VAlert
                type="info"
                variant="tonal"
              >
                Không có tài liệu đính kèm.
              </VAlert>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </VCol>

    <!-- Sidebar: Personal Notes -->
    <VCol
      cols="12"
      lg="4"
    >
      <VCard class="d-flex flex-column sticky-sidebar mb-4">
        <VCardItem class="pb-2">
          <template #title>
            <div class="d-flex align-center gap-2">
              <VIcon icon="tabler-notes" />
              Ghi chú cá nhân
            </div>
          </template>
          <template #append>
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
                /> Đã lưu lúc {{ lastSaved }}
              </span>
            </VFadeTransition>
          </template>
        </VCardItem>
        <VDivider />
        <VCardText class="flex-grow-1 pa-0">
          <textarea
            v-model="personalNotes"
            class="w-100 h-100 pa-4 custom-textarea"
            placeholder="Ghi chú cá nhân của bạn sẽ được tự động lưu lại..."
          />
        </VCardText>
      </VCard>

      <!-- Speak Request Card -->
      <VCard
        v-if="['active', 'in_progress'].includes(meeting.status)"
        class="sticky-sidebar"
      >
        <VCardText class="text-center">
          <VBtn
            v-if="!isSpeakRequested"
            color="warning"
            size="large"
            block
            prepend-icon="tabler-hand-stop"
            :loading="isRequestingSpeak"
            @click="requestSpeak"
          >
            Đăng ký phát biểu
          </VBtn>
          <div v-else>
            <VAlert
              type="info"
              variant="tonal"
              class="mb-3"
            >
              <div class="d-flex align-center gap-2">
                <VProgressCircular
                  indeterminate
                  size="16"
                  width="2"
                />
                Đã gửi yêu cầu phát biểu. Vui lòng chờ Chủ tọa duyệt...
              </div>
            </VAlert>
            <VBtn
              color="secondary"
              variant="tonal"
              size="small"
              @click="cancelSpeakRequest"
            >
              Hủy yêu cầu
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

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
  min-block-size: 400px;
}

.sticky-sidebar {
  position: sticky;
  inset-block-start: 100px;
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
