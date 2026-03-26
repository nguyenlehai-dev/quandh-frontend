<script setup>
import { createMeetingDocument, deleteMeetingDocument, fetchMeetingDocuments } from '@/modules/meetings/services/meetingService'
import { ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)

// Dialog Add
const isAddDialogVisible = ref(false)
const isSubmitting = ref(false)

const formData = ref({
  title: '',
  description: '',
  file: [],
})

const headers = [
  { title: 'Tên Tài liệu', key: 'title' },
  { title: 'Người upload', key: 'created_by' },
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
    const res = await fetchMeetingDocuments(props.meetingId)

    items.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

const deleteItem = async id => {
  if (confirm('Xóa tài liệu này khỏi cuộc họp?')) {
    await deleteMeetingDocument(props.meetingId, id)
    loadData()
  }
}

const submitAdd = async () => {
  if (!formData.value.title) return alert('Vui lòng nhập tên tài liệu')
  
  isSubmitting.value = true
  try {
    const payload = new FormData()

    payload.append('title', formData.value.title)
    if (formData.value.description) {
      payload.append('description', formData.value.description)
    }
    let filesToUpload = []
    if (Array.isArray(formData.value.file)) {
      filesToUpload = formData.value.file
    } else if (formData.value.file) {
      filesToUpload = [formData.value.file]
    }

    if (filesToUpload.length > 0) {
      filesToUpload.forEach(f => payload.append('files[]', f))
    } else {
      isSubmitting.value = false
      
      return alert('Vui lòng chọn file tải lên')
    }
    
    // We import createMeetingDocument below if we didn't already
    await createMeetingDocument(props.meetingId, payload)
    
    isAddDialogVisible.value = false
    formData.value = { title: '', description: '', file: [] }
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm file', err)
    let errorMsg = 'Có lỗi xảy ra'
    if (err.response?._data?.errors) {
      errorMsg = Object.values(err.response._data.errors).flat().join('\n')
    } else if (err.data?.errors) {
      errorMsg = Object.values(err.data.errors).flat().join('\n')
    } else if (err.message) {
      errorMsg = err.message
    }
    alert(errorMsg)
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
          Danh sách Tài liệu
        </h5>
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
        <template #item.actions="{ item }">
          <IconBtn @click="deleteItem(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Không có tài liệu nào trong cuộc họp này
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Tài liệu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tên tài liệu *"
                placeholder="Nhập tên tài liệu"
              />
            </VCol>

            <VCol cols="12">
              <VFileInput
                v-model="formData.file"
                label="Chọn tài liệu (PDF, Word, Excel...) *"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                prepend-icon="tabler-upload"
                show-size
                variant="outlined"
              />
            </VCol>
            
            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                placeholder="Nhập mô tả tài liệu"
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
  </div>
</template>
