<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  createMeetingDocument,
  deleteMeetingDocument,
  fetchDocumentFields,
  fetchDocumentSigners,
  fetchDocumentTypes,
  fetchIssuingAgencies,
  fetchMeetingDocuments,
} from '@/modules/meetings/services/meetingService'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
  meetingTypeId: { type: [String, Number], default: null },
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
  description: '',
  document_type_id: null,
  document_field_id: null,
  issuing_agency_id: null,
  document_signer_id: null,
  file: [],
})

const documentTypes = ref([])
const documentFields = ref([])
const issuingAgencies = ref([])
const documentSigners = ref([])

onMounted(async () => {
  try {
    const docTypeParams = { limit: 100 }

    if (props.meetingTypeId) {
      docTypeParams.meeting_type_id = props.meetingTypeId
    }

    const [tRes, fRes, aRes, sRes] = await Promise.all([
      fetchDocumentTypes(docTypeParams),
      fetchDocumentFields({ limit: 100 }),
      fetchIssuingAgencies({ limit: 100 }),
      fetchDocumentSigners({ limit: 100 }),
    ])

    documentTypes.value = (tRes.data?.data || tRes.data || []).map(i => ({ value: i.id, title: i.name }))
    documentFields.value = (fRes.data?.data || fRes.data || []).map(i => ({ value: i.id, title: i.name }))
    issuingAgencies.value = (aRes.data?.data || aRes.data || []).map(i => ({ value: i.id, title: i.name }))
    documentSigners.value = (sRes.data?.data || sRes.data || []).map(i => ({ value: i.id, title: i.name }))
  } catch (err) {
    console.error('Failed to load document categories', err)
    showError(err, 'Không thể tải dữ liệu danh mục tài liệu.')
  }
})

// Watch meetingTypeId changes to reload doc types
watch(() => props.meetingTypeId, async newVal => {
  try {
    const docTypeParams = { limit: 100 }

    if (newVal) {
      docTypeParams.meeting_type_id = newVal
    }

    const tRes = await fetchDocumentTypes(docTypeParams)

    documentTypes.value = (tRes.data?.data || tRes.data || []).map(i => ({ value: i.id, title: i.name }))
  } catch (err) {
    console.error('Failed to reload document types', err)
    showError(err, 'Không thể tải lại loại tài liệu.')
  }
})

const headers = [
  { title: 'Tên Tài liệu', key: 'title' },
  { title: 'Loại tài liệu', key: 'document_type_name' },
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

    items.value = (res.data || []).map(item => ({
      ...item,
      document_type_name: item.document_type ? item.document_type.name : '',
    }))
  } catch (error) {
    console.error(error)
    showError(error, 'Không thể tải danh sách tài liệu.')
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
    title: 'Xóa tài liệu',
    message: `Bạn có chắc chắn muốn xóa "${item.title}" khỏi cuộc họp không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingDocument(props.meetingId, item.id)
      showSuccess('Xóa tài liệu thành công.')
      loadData()
    },
  })
}

const submitAdd = async () => {
  if (!formData.value.title) {
    showSnackbar('Vui lòng nhập tên tài liệu.', 'warning')

    return
  }
  
  isSubmitting.value = true
  try {
    const payload = new FormData()

    payload.append('title', formData.value.title)
    if (formData.value.description) {
      payload.append('description', formData.value.description)
    }
    if (formData.value.document_type_id) payload.append('document_type_id', formData.value.document_type_id)
    if (formData.value.document_field_id) payload.append('document_field_id', formData.value.document_field_id)
    if (formData.value.issuing_agency_id) payload.append('issuing_agency_id', formData.value.issuing_agency_id)
    if (formData.value.document_signer_id) payload.append('document_signer_id', formData.value.document_signer_id)
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

      showSnackbar('Vui lòng chọn file tải lên.', 'warning')

      return
    }
    
    // We import createMeetingDocument below if we didn't already
    await createMeetingDocument(props.meetingId, payload)
    
    isAddDialogVisible.value = false
    formData.value = {
      title: '',
      description: '',
      document_type_id: null,
      document_field_id: null,
      issuing_agency_id: null,
      document_signer_id: null,
      file: [],
    }
    showSuccess('Thêm tài liệu thành công.')
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm file', err)
    showError(err, 'Có lỗi xảy ra khi thêm tài liệu.')
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
          <IconBtn @click="deleteItem(item)">
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

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.document_type_id"
                label="Loại tài liệu"
                :items="documentTypes"
                placeholder="Chọn loại tài liệu"
                clearable
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.document_field_id"
                label="Lĩnh vực"
                :items="documentFields"
                placeholder="Chọn lĩnh vực"
                clearable
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.issuing_agency_id"
                label="Cơ quan ban hành"
                :items="issuingAgencies"
                placeholder="Chọn cơ quan ban hành"
                clearable
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.document_signer_id"
                label="Người ký"
                :items="documentSigners"
                placeholder="Chọn người ký"
                clearable
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
