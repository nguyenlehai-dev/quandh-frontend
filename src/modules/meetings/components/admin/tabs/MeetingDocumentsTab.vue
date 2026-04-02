<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  createMeetingDocument,
  deleteMeetingDocument,
  fetchDocumentFields,
  fetchDocumentTypes,
  fetchMeetingDocuments,
  updateMeetingDocument,
} from '@/modules/meetings/services/meetingService'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
  meetingTypeId: { type: [String, Number], default: null },
})

const items = ref([])
const isLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const isFormDialogVisible = ref(false)
const isSubmitting = ref(false)
const editingItem = ref(null)

const createDefaultFormData = () => ({
  title: '',
  description: '',
  meeting_document_type_id: null,
  meeting_document_field_id: null,
  files: [],
  remove_file_ids: [],
  existingFiles: [],
})

const formData = ref(createDefaultFormData())

const documentTypes = ref([])
const documentFields = ref([])

const isEditing = computed(() => !!editingItem.value)
const dialogTitle = computed(() => isEditing.value ? 'Cap nhat Tai lieu' : 'Them Tai lieu')

const loadDocumentCatalogs = async meetingTypeId => {
  try {
    const docTypeParams = { limit: 100 }

    if (meetingTypeId) {
      docTypeParams.meeting_type_id = meetingTypeId
    }

    const [tRes, fRes] = await Promise.all([
      fetchDocumentTypes(docTypeParams),
      fetchDocumentFields({ limit: 100 }),
    ])

    documentTypes.value = (tRes.data?.data || tRes.data || []).map(i => ({ value: i.id, title: i.name }))
    documentFields.value = (fRes.data?.data || fRes.data || []).map(i => ({ value: i.id, title: i.name }))
  } catch (err) {
    console.error('Failed to load document categories', err)
    showError(err, 'Khong the tai du lieu danh muc tai lieu.')
  }
}

onMounted(async () => {
  await loadDocumentCatalogs(props.meetingTypeId)
})

watch(() => props.meetingTypeId, async newVal => {
  await loadDocumentCatalogs(newVal)
})

const headers = [
  { title: 'Ten Tai lieu', key: 'title' },
  { title: 'Loai tai lieu', key: 'document_type_name' },
  { title: 'Linh vuc', key: 'document_field_name' },
  { title: 'Nguoi upload', key: 'created_by' },
  { title: 'Hanh dong', key: 'actions', sortable: false },
]

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
      document_type_name: item.document_type?.name || '',
      document_field_name: item.document_field?.name || '',
    }))
  } catch (error) {
    console.error(error)
    showError(error, 'Khong the tai danh sach tai lieu.')
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
    showError(err, 'Khong the thuc hien thao tac nay.')
  } finally {
    isConfirming.value = false
  }
}

const resetForm = () => {
  editingItem.value = null
  formData.value = createDefaultFormData()
}

const openCreateDialog = () => {
  resetForm()
  isFormDialogVisible.value = true
}

const openEditDialog = item => {
  editingItem.value = item
  formData.value = {
    title: item.title || '',
    description: item.description || '',
    meeting_document_type_id: item.meeting_document_type_id || item.document_type_id || null,
    meeting_document_field_id: item.meeting_document_field_id || item.document_field_id || null,
    files: [],
    remove_file_ids: [],
    existingFiles: [...(item.files || [])],
  }
  isFormDialogVisible.value = true
}

const toggleFileRemoval = fileId => {
  if (formData.value.remove_file_ids.includes(fileId)) {
    formData.value.remove_file_ids = formData.value.remove_file_ids.filter(id => id !== fileId)

    return
  }

  formData.value.remove_file_ids = [...formData.value.remove_file_ids, fileId]
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xoa tai lieu',
    message: `Ban co chac chan muon xoa "${item.title}" khoi cuoc hop khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingDocument(props.meetingId, item.id)
      showSuccess('Xoa tai lieu thanh cong.')
      loadData()
    },
  })
}

const submitForm = async () => {
  if (!formData.value.title.trim()) {
    showSnackbar('Vui long nhap ten tai lieu.', 'warning')

    return
  }

  const filesToUpload = Array.isArray(formData.value.files)
    ? formData.value.files
    : (formData.value.files ? [formData.value.files] : [])

  if (!isEditing.value && filesToUpload.length === 0) {
    showSnackbar('Vui long chon file tai len.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    const payload = new FormData()

    payload.append('title', formData.value.title.trim())
    if (formData.value.description) payload.append('description', formData.value.description)
    if (formData.value.meeting_document_type_id) payload.append('meeting_document_type_id', formData.value.meeting_document_type_id)
    if (formData.value.meeting_document_field_id) payload.append('meeting_document_field_id', formData.value.meeting_document_field_id)

    filesToUpload.forEach(file => payload.append('files[]', file))
    formData.value.remove_file_ids.forEach(id => payload.append('remove_file_ids[]', id))

    if (isEditing.value) {
      await updateMeetingDocument(props.meetingId, editingItem.value.id, payload)
      showSuccess('Cap nhat tai lieu thanh cong.')
    } else {
      await createMeetingDocument(props.meetingId, payload)
      showSuccess('Them tai lieu thanh cong.')
    }

    isFormDialogVisible.value = false
    resetForm()
    loadData()
  } catch (err) {
    console.error('Loi khi luu tai lieu', err)
    showError(err, isEditing.value ? 'Co loi xay ra khi cap nhat tai lieu.' : 'Co loi xay ra khi them tai lieu.')
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
          Danh sach Tai lieu
        </h5>
        <VBtn
          v-if="$can('create', 'MeetingDocument')"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
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
        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('update', 'MeetingDocument')"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn
            v-if="$can('delete', 'MeetingDocument')"
            @click="deleteItem(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Khong co tai lieu nao trong cuoc hop nay
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VDialog
      v-model="isFormDialogVisible"
      max-width="760"
    >
      <VCard :title="dialogTitle">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Ten tai lieu *"
                placeholder="Nhap ten tai lieu"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meeting_document_type_id"
                label="Loai tai lieu"
                :items="documentTypes"
                placeholder="Chon loai tai lieu"
                clearable
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meeting_document_field_id"
                label="Linh vuc"
                :items="documentFields"
                placeholder="Chon linh vuc"
                clearable
              />
            </VCol>

            <VCol cols="12">
              <VFileInput
                v-model="formData.files"
                :label="isEditing ? 'Them file dinh kem moi' : 'Chon tai lieu (PDF, Word, Excel...) *'"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                prepend-icon="tabler-upload"
                show-size
                variant="outlined"
                multiple
              />
            </VCol>

            <VCol
              v-if="isEditing && formData.existingFiles.length"
              cols="12"
            >
              <div class="text-body-2 font-weight-medium mb-2">
                File hien co
              </div>
              <div class="d-flex flex-column gap-2">
                <div
                  v-for="file in formData.existingFiles"
                  :key="file.id"
                  class="d-flex align-center justify-space-between border rounded px-3 py-2"
                >
                  <div class="d-flex align-center gap-2">
                    <VIcon icon="tabler-file" />
                    <a
                      :href="file.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary text-decoration-none"
                    >
                      {{ file.original_name }}
                    </a>
                  </div>
                  <VCheckbox
                    :model-value="formData.remove_file_ids.includes(file.id)"
                    label="Xoa file"
                    hide-details
                    @update:model-value="toggleFileRemoval(file.id)"
                  />
                </div>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mo ta"
                placeholder="Nhap mo ta tai lieu"
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isFormDialogVisible = false; resetForm()"
          >
            Huy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitForm"
          >
            Luu
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
