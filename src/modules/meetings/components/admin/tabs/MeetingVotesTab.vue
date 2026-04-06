<script setup>
/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */

import { useActionFeedback } from '@/composables/useActionFeedback'
import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import {
  closeVoting,
  createMeetingVote,
  deleteMeetingVote,
  fetchMeeting,
  fetchMeetingVotes,
  fetchVotingResults,
  openVoting,
  updateMeetingVote,
} from '@/modules/meetings/services/meetingService'
import { ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const agendas = ref([])
const votingResults = ref(null)
const selectedVoteId = ref(null)
const editingVoteId = ref(null)

const isLoading = ref(false)
const isLoadingResults = ref(false)
const isSubmitting = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const isEditDialogVisible = ref(false)
const isResultDialogVisible = ref(false)

const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()
const meetingStore = useMeetingStore()

const defaultFormData = () => ({
  title: '',
  type: 'public',
  description: '',
  meeting_agenda_id: null,
})

const formData = ref(defaultFormData())

const headers = [
  { title: 'Tieu de', key: 'title' },
  { title: 'Nghi su', key: 'agenda_title' },
  { title: 'Loai', key: 'type' },
  { title: 'Trang thai', key: 'status' },
  { title: 'Ket qua', key: 'results_summary' },
  { title: 'Hanh dong', key: 'actions', sortable: false },
]

const votingTypeOptions = [
  { title: 'Cong khai', value: 'public' },
  { title: 'An danh', value: 'anonymous' },
]

const votingStatusOptions = {
  closed: { color: 'error', label: 'Da dong' },
  open: { color: 'success', label: 'Dang mo' },
  pending: { color: 'secondary', label: 'Cho mo' },
}

const votingChoiceOptions = {
  abstain: { color: 'warning', label: 'Bo phieu trang' },
  agree: { color: 'success', label: 'Dong y' },
  disagree: { color: 'error', label: 'Khong dong y' },
}

const votingTypeLabel = type => votingTypeOptions.find(option => option.value === type)?.title || type
const votingStatusLabel = status => votingStatusOptions[status]?.label || status
const votingStatusColor = status => votingStatusOptions[status]?.color || 'secondary'
const votingChoiceLabel = choice => votingChoiceOptions[choice]?.label || choice
const votingChoiceColor = choice => votingChoiceOptions[choice]?.color || 'secondary'
const unwrapPayload = response => response?.data?.data ?? response?.data ?? response

const agendaOptions = () => agendas.value.map(agenda => ({
  title: agenda.title,
  value: agenda.id,
}))

const normalizeVoting = item => ({
  ...item,
  agenda_title: item.agenda_title || item.agenda?.title || 'Chua gan nghi su',
  results_summary: item.results_summary || { total: 0, agree: 0, disagree: 0, abstain: 0 },
})

const resetForm = () => {
  formData.value = defaultFormData()
  editingVoteId.value = null
}

const loadMeetingAgendas = async () => {
  if (!props.meetingId) {
    agendas.value = []

    return
  }

  try {
    const res = await fetchMeeting(props.meetingId)
    const meeting = unwrapPayload(res) || {}

    agendas.value = meeting.agendas || []
  }
  catch (error) {
    console.error(error)
    showError(error, 'Khong the tai danh sach nghi su.')
  }
}

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []

    return
  }

  isLoading.value = true
  try {
    const res = await fetchMeetingVotes(props.meetingId)

    items.value = (unwrapPayload(res) || []).map(normalizeVoting)
  }
  catch (error) {
    console.error(error)
    showError(error, 'Khong the tai danh sach bieu quyet.')
  }
  finally {
    isLoading.value = false
  }
}

const loadInitialData = async () => {
  await Promise.all([
    loadMeetingAgendas(),
    loadData(),
  ])
}

watch(() => props.meetingId, loadInitialData, { immediate: true })

watch(() => meetingStore.lastEvent, event => {
  if (!event || Number(event.meeting_id) !== Number(props.meetingId)) return
  if (!['voting.status.changed', 'voting.results.changed'].includes(event.type)) return

  loadData()
}, { deep: true })

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return

  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  }
  catch (err) {
    showError(err, 'Khong the thuc hien thao tac nay.')
  }
  finally {
    isConfirming.value = false
  }
}

const openAddDialog = () => {
  resetForm()
  isEditDialogVisible.value = true
}

const openEditDialog = item => {
  editingVoteId.value = item.id
  formData.value = {
    title: item.title || '',
    type: item.type || 'public',
    description: item.description || '',
    meeting_agenda_id: item.meeting_agenda_id || null,
  }
  isEditDialogVisible.value = true
}

const submitForm = async () => {
  if (!formData.value.title) {
    showSnackbar('Vui long nhap tieu de bieu quyet.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    if (editingVoteId.value) {
      await updateMeetingVote(props.meetingId, editingVoteId.value, formData.value)
      showSuccess('Cap nhat bieu quyet thanh cong.')
    }
    else {
      await createMeetingVote(props.meetingId, formData.value)
      showSuccess('Them bieu quyet thanh cong.')
    }

    isEditDialogVisible.value = false
    resetForm()
    await loadData()
  }
  catch (err) {
    console.error(err)
    showError(err, editingVoteId.value ? 'Khong the cap nhat bieu quyet.' : 'Khong the them bieu quyet.')
  }
  finally {
    isSubmitting.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xoa bieu quyet',
    message: `Ban co chac chan muon xoa bieu quyet "${item.title}" khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingVote(props.meetingId, item.id)
      showSuccess('Xoa bieu quyet thanh cong.')
      await loadData()
    },
  })
}

const openVotingItem = item => {
  openConfirmDialog({
    title: 'Mo bieu quyet',
    message: `Ban co chac chan muon mo phien bieu quyet "${item.title}" khong?`,
    confirmText: 'Mo',
    confirmColor: 'success',
    action: async () => {
      await openVoting(props.meetingId, item.id)
      showSuccess('Da mo phien bieu quyet.')
      await loadData()
    },
  })
}

const closeVotingItem = item => {
  openConfirmDialog({
    title: 'Dong bieu quyet',
    message: `Ban co chac chan muon dong phien bieu quyet "${item.title}" khong?`,
    confirmText: 'Dong',
    confirmColor: 'warning',
    action: async () => {
      await closeVoting(props.meetingId, item.id)
      showSuccess('Da dong phien bieu quyet.')
      await loadData()
    },
  })
}

const openResultsDialog = async item => {
  selectedVoteId.value = item.id
  isResultDialogVisible.value = true
  isLoadingResults.value = true
  votingResults.value = null

  try {
    const res = await fetchVotingResults(props.meetingId, item.id)
    votingResults.value = unwrapPayload(res) || null
  }
  catch (error) {
    console.error(error)
    showError(error, 'Khong the tai ket qua bieu quyet.')
  }
  finally {
    isLoadingResults.value = false
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sach Bieu quyet
        </h5>
        <VSpacer />
        <VBtn
          v-if="$can('store', 'MeetingVoting')"
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Them moi
        </VBtn>
      </VCardText>
      <VDivider />

      <VDataTable
        :items="items"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.type="{ item }">
          <VChip
            size="small"
            variant="tonal"
          >
            {{ votingTypeLabel(item.type) }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="votingStatusColor(item.status)"
            variant="tonal"
          >
            {{ votingStatusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.results_summary="{ item }">
          <div class="d-flex flex-wrap gap-2">
            <VChip
              size="x-small"
              color="success"
              variant="tonal"
            >
              Dong y: {{ item.results_summary?.agree || 0 }}
            </VChip>
            <VChip
              size="x-small"
              color="error"
              variant="tonal"
            >
              Khong dong y: {{ item.results_summary?.disagree || 0 }}
            </VChip>
            <VChip
              size="x-small"
              color="warning"
              variant="tonal"
            >
              Trang: {{ item.results_summary?.abstain || 0 }}
            </VChip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('results', 'MeetingVoting')"
            color="info"
            @click="openResultsDialog(item)"
          >
            <VIcon icon="tabler-chart-donut-3" />
          </IconBtn>
          <IconBtn
            v-if="$can('update', 'MeetingVoting') && item.status === 'pending'"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn
            v-if="$can('open', 'MeetingVoting') && item.status === 'pending'"
            color="success"
            @click="openVotingItem(item)"
          >
            <VIcon icon="tabler-player-play" />
          </IconBtn>
          <IconBtn
            v-if="$can('close', 'MeetingVoting') && item.status === 'open'"
            color="warning"
            @click="closeVotingItem(item)"
          >
            <VIcon icon="tabler-player-stop" />
          </IconBtn>
          <IconBtn
            v-if="$can('destroy', 'MeetingVoting') && item.status === 'pending'"
            color="error"
            @click="deleteItem(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="pa-5 text-center">
            Khong co du lieu bieu quyet
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VDialog
      v-model="isEditDialogVisible"
      max-width="600"
    >
      <VCard :title="editingVoteId ? 'Cap nhat Bieu quyet' : 'Them Bieu quyet'">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tieu de *"
                placeholder="Vi du: Bieu quyet thong qua du thao"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meeting_agenda_id"
                label="Nghi su lien quan"
                :items="agendaOptions()"
                placeholder="Chon nghi su"
                clearable
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.type"
                label="Loai bieu quyet"
                :items="votingTypeOptions"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mo ta"
                placeholder="Nhap mo ta chi tiet ve noi dung bieu quyet..."
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isEditDialogVisible = false"
          >
            Huy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitForm"
          >
            {{ editingVoteId ? 'Cap nhat' : 'Luu' }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog
      v-model="isResultDialogVisible"
      max-width="760"
    >
      <VCard title="Ket qua bieu quyet">
        <VCardText>
          <template v-if="isLoadingResults">
            <div class="d-flex justify-center align-center pa-8">
              <VProgressCircular
                indeterminate
                color="primary"
              />
            </div>
          </template>

          <template v-else-if="votingResults">
            <div class="mb-4">
              <div class="text-h6 mb-1">
                {{ votingResults.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Tong phieu: {{ votingResults.summary?.total || 0 }}
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-6">
              <VChip
                color="success"
                variant="tonal"
              >
                Dong y: {{ votingResults.summary?.agree || 0 }}
              </VChip>
              <VChip
                color="error"
                variant="tonal"
              >
                Khong dong y: {{ votingResults.summary?.disagree || 0 }}
              </VChip>
              <VChip
                color="warning"
                variant="tonal"
              >
                Bo phieu trang: {{ votingResults.summary?.abstain || 0 }}
              </VChip>
            </div>

            <VTable
              v-if="Array.isArray(votingResults.details) && votingResults.details.length > 0"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th>Nguoi bo phieu</th>
                  <th>Lua chon</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="detail in votingResults.details"
                  :key="`${selectedVoteId}-${detail.user_id || detail.user_name}`"
                >
                  <td>{{ detail.user_name || 'An danh' }}</td>
                  <td>
                    <VChip
                      size="small"
                      :color="votingChoiceColor(detail.choice)"
                      variant="tonal"
                    >
                      {{ votingChoiceLabel(detail.choice) }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VAlert
              v-else
              type="info"
              variant="tonal"
            >
              Bieu quyet an danh hoac chua co chi tiet tung phieu.
            </VAlert>
          </template>
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isResultDialogVisible = false"
          >
            Dong
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>
