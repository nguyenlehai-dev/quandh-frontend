<script setup>
/* eslint-disable camelcase, padding-line-between-statements */
import { ability } from '@/plugins/casl/ability'
import { computed, ref } from 'vue'

import { useDocumentTypeListPage } from '@/modules/meetings/composables/useDocumentTypeListPage'
import DocumentTypeListToolbar from '@/modules/meetings/components/DocumentTypeListToolbar.vue'
import DocumentTypeDataTable from '@/modules/meetings/components/DocumentTypeDataTable.vue'

const {
  snackbar,
  searchQuery,
  statusFilter,
  meetingTypeFilter,
  itemsPerPage,
  page,
  selectedRows,
  itemsData,
  totalItems,
  loading,
  statusOptions,
  meetingTypeOptions,
  bulkStatusOptions,
  headers,
  isConfirmDialogVisible,
  isConfirming,
  confirmDialog,
  isExporting,
  isImporting,
  
  fetchItems,
  createDocumentType,
  updateDocumentType,
  updateOptions,
  handleSelectionChange,
  
  bulkDeleteItems,
  bulkChangeStatus,
  deleteItem,
  toggleItemStatus,
  executeConfirmedAction,
  handleExport,
  handleImport,
  showSuccess, 
  showError,
} = useDocumentTypeListPage()

// === Dialog CRUD Local ===
const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedItemId = ref(null)
const isBulkUpdateDialogVisible = ref(false)
const bulkUpdateStatusValue = ref('active')

const formData = ref({
  name: '',
  description: '',
  status: 'active',
  meeting_type_id: null,
})

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active', meeting_type_id: null }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = {
    name: item.name,
    description: item.description || '',
    status: item.status,
    meeting_type_id: item.meeting_type_id,
  }
  isEditDialogVisible.value = true
}

const submitForm = async () => {
  if (!formData.value.name) {
    showError(new Error('Validation'), 'Vui lòng nhập tên.')
    
    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateDocumentType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật thành công.')
    } else {
      await createDocumentType(formData.value) 
      isAddDialogVisible.value = false
      showSuccess('Tạo thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu.')
  } finally {
    isSubmitting.value = false
  }
}

const openBulkUpdateStatusDialog = () => {
  if (!selectedRows.value.length) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  await bulkChangeStatus(bulkUpdateStatusValue.value)
  isBulkUpdateDialogVisible.value = false
  isSubmitting.value = false
}
</script>

<template>
  <section>
    <!-- Header -->
    <div class="d-flex align-center gap-4 mb-6">
      <VAvatar
        color="primary"
        variant="tonal"
        rounded
        size="48"
      >
        <VIcon icon="tabler-category" />
      </VAvatar>
      <div>
        <h2 class="text-h4 mb-1">
          Loại tài liệu họp
        </h2>
        <div class="text-body-1 text-disabled">
          Quản lý danh mục loại tài liệu cuộc họp
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <VCard>
      <DocumentTypeListToolbar
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:meeting-type-filter="meetingTypeFilter"
        :status-options="statusOptions"
        :meeting-type-options="meetingTypeOptions"
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'MeetingDocumentType')"
        :can-export="$can('export', 'MeetingDocumentType')"
        :can-create="$can('store', 'MeetingDocumentType')"
        :can-bulk-update-status="$can('update', 'MeetingDocumentType')"
        :can-bulk-destroy="$can('destroy', 'MeetingDocumentType')"
        @bulk-change-status="openBulkUpdateStatusDialog"
        @bulk-delete="bulkDeleteItems"
        @import="handleImport"
        @export="handleExport"
        @add="openAddDialog"
      />

      <DocumentTypeDataTable
        :selected-rows="selectedRows"
        :items="itemsData"
        :total-items="totalItems"
        :headers="headers"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
        :can-read="$can('read', 'MeetingDocumentType')"
        :can-update="$can('update', 'MeetingDocumentType')"
        :can-delete="$can('destroy', 'MeetingDocumentType')"
        @update:selected-rows="handleSelectionChange"
        @update:options="updateOptions"
        @edit="openEditDialog"
        @detail="openEditDialog"
        @delete="deleteItem"
        @toggle-status="toggleItemStatus"
      />
    </VCard>

    <VNavigationDrawer
      v-model="isAddDialogVisible"
      temporary
      location="end"
      width="520"
    >
      <VCard
        title="Thêm mới"
        flat
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên *"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                rows="3"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="active"
                false-value="inactive"
                :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'"
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
            @click="submitForm"
          >
            Lưu
          </VBtn>
        </VCardText>
      </VCard>
    </VNavigationDrawer>

    <VNavigationDrawer
      v-model="isEditDialogVisible"
      temporary
      location="end"
      width="520"
    >
      <VCard
        title="Cập nhật"
        flat
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên *"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                rows="3"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="active"
                false-value="inactive"
                :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'"
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
            @click="submitForm"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VNavigationDrawer>

    <!-- Generic Dialogs -->
    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <VDialog
      v-model="isBulkUpdateDialogVisible"
      max-width="420"
    >
      <VCard title="Cập nhật trạng thái hàng loạt">
        <VCardText>
          <AppSelect
            v-model="bulkUpdateStatusValue"
            :items="statusOptions"
            label="Trạng thái mới"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isBulkUpdateDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            color="warning"
            @click="confirmBulkUpdateStatus"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </section>
</template>