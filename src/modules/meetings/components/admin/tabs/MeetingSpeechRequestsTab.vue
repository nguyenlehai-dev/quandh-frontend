<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  approveSpeechRequest,
  deleteSpeechRequest,
  fetchSpeechRequests,
  rejectSpeechRequest,
} from '@/modules/meetings/services/meetingService'
import { ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })
const { snackbar, showSuccess, showError } = useActionFeedback()

const headers = [
  { title: 'Dai bieu', key: 'participant_name' },
  { title: 'Noi dung dang ky', key: 'content' },
  { title: 'Nghi su lien quan', key: 'agenda_title' },
  { title: 'Trang thai', key: 'status' },
  { title: 'Hanh dong', key: 'actions', sortable: false },
]

const speechRequestStatusOptions = {
  approved: { color: 'success', label: 'Da duyet' },
  pending: { color: 'warning', label: 'Cho duyet' },
  rejected: { color: 'error', label: 'Tu choi' },
}

const speechRequestStatusLabel = status => speechRequestStatusOptions[status]?.label || status
const speechRequestStatusColor = status => speechRequestStatusOptions[status]?.color || 'secondary'

const normalizeSpeechRequest = item => ({
  ...item,
  agenda_title: item.agenda?.title || 'Chua gan nghi su',
  participant_name: item.participant?.user?.full_name || item.participant?.user?.name || 'Dai bieu',
})

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []

    return
  }

  isLoading.value = true
  try {
    const res = await fetchSpeechRequests(props.meetingId)

    items.value = (res.data || []).map(normalizeSpeechRequest)
  }
  catch (error) {
    console.error(error)
    showError(error, 'Khong the tai danh sach dang ky phat bieu.')
  }
  finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, loadData, { immediate: true })

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

const approveItem = item => {
  openConfirmDialog({
    title: 'Duyet dang ky',
    message: `Ban co chac chan muon duyet luot dang ky phat bieu cua "${item.participant_name}" khong?`,
    confirmText: 'Duyet',
    confirmColor: 'success',
    action: async () => {
      await approveSpeechRequest(props.meetingId, item.id)
      showSuccess('Da duyet dang ky phat bieu.')
      await loadData()
    },
  })
}

const rejectItem = item => {
  openConfirmDialog({
    title: 'Tu choi dang ky',
    message: `Ban co chac chan muon tu choi luot dang ky phat bieu cua "${item.participant_name}" khong?`,
    confirmText: 'Tu choi',
    confirmColor: 'error',
    action: async () => {
      await rejectSpeechRequest(props.meetingId, item.id)
      showSuccess('Da tu choi dang ky phat bieu.')
      await loadData()
    },
  })
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xoa dang ky',
    message: `Ban co chac chan muon xoa luot dang ky phat bieu cua "${item.participant_name}" khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteSpeechRequest(props.meetingId, item.id)
      showSuccess('Da xoa dang ky phat bieu.')
      await loadData()
    },
  })
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sach Dang ky phat bieu
        </h5>
      </VCardText>
      <VDivider />

      <VDataTable
        :items="items"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.content="{ item }">
          <span>{{ item.content || 'Khong co noi dung bo sung' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="speechRequestStatusColor(item.status)"
            variant="tonal"
          >
            {{ speechRequestStatusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('approve', 'MeetingSpeechRequest') && item.status === 'pending'"
            color="success"
            @click="approveItem(item)"
          >
            <VIcon icon="tabler-check" />
          </IconBtn>
          <IconBtn
            v-if="$can('reject', 'MeetingSpeechRequest') && item.status === 'pending'"
            color="warning"
            @click="rejectItem(item)"
          >
            <VIcon icon="tabler-x" />
          </IconBtn>
          <IconBtn
            v-if="$can('delete', 'MeetingSpeechRequest')"
            color="error"
            @click="deleteItem(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="pa-5 text-center">
            Khong co luot dang ky phat bieu nao
          </div>
        </template>
      </VDataTable>
    </VCard>

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
