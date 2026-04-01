<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import { createMeetingVote, deleteMeetingVote, fetchMeetingVotes } from '@/modules/meetings/services/meetingService'
import { ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

// Dialog Add
const isAddDialogVisible = ref(false)
const isSubmitting = ref(false)

const formData = ref({
  title: '',
  type: 'public',
  description: '',
})

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Loại', key: 'type' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const votingTypeOptions = [
  { title: 'Công khai', value: 'public' },
  { title: 'Ẩn danh', value: 'anonymous' },
]

const votingTypeLabel = type => {
  const found = votingTypeOptions.find(o => o.value === type)

  return found ? found.title : type
}

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []

    return
  }
  isLoading.value = true
  try {
    const res = await fetchMeetingVotes(props.meetingId)

    items.value = res.data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

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
    showError(err, 'Không thể thực hiện thao tác này.')
  }
  finally {
    isConfirming.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa biểu quyết',
    message: `Bạn có chắc chắn muốn xóa biểu quyết "${item.title}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingVote(props.meetingId, item.id)
      showSuccess('Xóa biểu quyết thành công.')
      loadData()
    },
  })
}

const submitAdd = async () => {
  if (!formData.value.title) {
    showSnackbar('Vui lòng nhập tiêu đề biểu quyết.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    await createMeetingVote(props.meetingId, formData.value)

    isAddDialogVisible.value = false
    formData.value = { title: '', type: 'public', description: '' }
    showSuccess('Thêm biểu quyết thành công.')
    loadData()
  }
  catch (err) {
    console.error('Lỗi khi thêm biểu quyết', err)
    showError(err, 'Có lỗi xảy ra khi thêm biểu quyết.')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Biểu quyết
        </h5>
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="isAddDialogVisible = true"
        >
          Thêm mới
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
            :color="item.status === 'open' ? 'success' : (item.status === 'closed' ? 'error' : 'secondary')"
          >
            {{ item.status === 'open' ? 'Đang mở' : (item.status === 'closed' ? 'Đã đóng' : item.status) }}
          </VChip>
        </template>
        <template #item.actions="{ item }">
          <IconBtn @click="deleteItem(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Không có dữ liệu biểu quyết
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Biểu quyết">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề *"
                placeholder="Ví dụ: Biểu quyết thông qua dự thảo"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="formData.type"
                label="Loại biểu quyết"
                :items="votingTypeOptions"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                placeholder="Nhập mô tả chi tiết về nội dung biểu quyết..."
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isAddDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitAdd"
          >
            Lưu
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
