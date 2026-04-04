<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import { deleteMeetingConclusion, fetchMeetingConclusions } from '@/modules/meetings/services/meetingService'
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

// Dialog Add & Edit
const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const selectedItemId = ref(null)
const isSubmitting = ref(false)

const formData = ref({
  title: '',
  content: '',
})

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Nội dung', key: 'content' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// Removed loadMeetings

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []
    
    return
  }
  isLoading.value = true
  try {
    const res = await fetchMeetingConclusions(props.meetingId)

    items.value = res.data || []
  } catch (error) {
    console.error(error)
    showError(error, 'Không thể tải danh sách kết luận.')
  } finally {
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
  } catch (err) {
    showError(err, 'Không thể thực hiện thao tác này.')
  } finally {
    isConfirming.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa kết luận',
    message: `Bạn có chắc chắn muốn xóa kết luận "${item.title}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingConclusion(props.meetingId, item.id)
      showSuccess('Xóa kết luận thành công.')
      loadData()
    },
  })
}

const submitAdd = async () => {
  if (!formData.value.title || !formData.value.content) {
    showSnackbar('Vui lòng nhập đầy đủ tiêu đề và nội dung.', 'warning')

    return
  }
  
  isSubmitting.value = true
  try {
    const { createMeetingConclusion } = await import('@/modules/meetings/services/meetingService')

    await createMeetingConclusion(props.meetingId, formData.value)

    isAddDialogVisible.value = false
    formData.value = { title: '', content: '' }
    showSuccess('Thêm kết luận thành công.')
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm kết luận', err)
    showError(err, 'Không thể thêm kết luận.')
  } finally {
    isSubmitting.value = false
  }
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = { title: item.title, content: item.content }
  isEditDialogVisible.value = true
}

const submitEdit = async () => {
  if (!formData.value.title || !formData.value.content) {
    showSnackbar('Vui lòng nhập đầy đủ tiêu đề và nội dung.', 'warning')

    return
  }
  
  isSubmitting.value = true
  try {
    const { updateMeetingConclusion } = await import('@/modules/meetings/services/meetingService')

    await updateMeetingConclusion(props.meetingId, selectedItemId.value, formData.value)

    isEditDialogVisible.value = false
    formData.value = { title: '', content: '' }
    showSuccess('Cập nhật kết luận thành công.')
    loadData()
  } catch (err) {
    console.error('Lỗi khi cập nhật kết luận', err)
    showError(err, 'Không thể cập nhật kết luận.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Kết luận
        </h5>
        <VBtn
          v-if="$can('store', 'MeetingConclusion')"
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
        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('update', 'MeetingConclusion')"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn
            v-if="$can('destroy', 'MeetingConclusion')"
            @click="deleteItem(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Không có kết luận nào trong cuộc họp này
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Kết luận">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề *"
                placeholder="Ví dụ: Thống nhất phương án A"
              />
            </VCol>
            
            <VCol cols="12">
              <AppTextarea
                v-model="formData.content"
                label="Nội dung kết luận *"
                placeholder="Nhập chi tiết nội dung kết luận..."
                rows="5"
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

    <!-- Dialog Cập nhật -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="600"
    >
      <VCard title="Cập nhật Kết luận">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề *"
                placeholder="Ví dụ: Thống nhất phương án A"
              />
            </VCol>
            
            <VCol cols="12">
              <AppTextarea
                v-model="formData.content"
                label="Nội dung kết luận *"
                placeholder="Nhập chi tiết nội dung kết luận..."
                rows="5"
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
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitEdit"
          >
            Cập nhật
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
