<script setup>
/* eslint-disable camelcase, padding-line-between-statements */
import { ability } from '@/plugins/casl/ability'
import { computed, ref } from 'vue'

import { useMeetingTypeListPage } from '@/modules/meetings/composables/useMeetingTypeListPage'
import MeetingTypeListToolbar from '@/modules/meetings/components/MeetingTypeListToolbar.vue'
import MeetingTypeDataTable from '@/modules/meetings/components/MeetingTypeDataTable.vue'

const {
  snackbar,
  searchQuery,
  statusFilter,
  
  itemsPerPage,
  page,
  selectedRows,
  itemsData,
  totalItems,
  loading,
  statusOptions,
  
  bulkStatusOptions,
  headers,
  isConfirmDialogVisible,
  isConfirming,
  confirmDialog,
  isExporting,
  isImporting,
  
  fetchItems,
  createMeetingType,
  updateMeetingType,
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
} = useMeetingTypeListPage()

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
  
})

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active' }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = {
    name: item.name,
    description: item.description || '',
    status: item.status,
    
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
      await updateMeetingType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật thành công.')
    } else {
      await createMeetingType(formData.value) 
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
        <VIcon icon="tabler-video" />
      </VAvatar>
      <div>
        <h2 class="text-h4 mb-1">
          Loại cuộc họp
        </h2>
        <div class="text-body-1 text-disabled">
          Quản lý danh mục loại cuộc họp
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <VCard>
      <MeetingTypeListToolbar
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        
        :status-options="statusOptions"
        
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'MeetingType')"
        :can-export="$can('export', 'MeetingType')"
        :can-create="$can('store', 'MeetingType')"
        :can-bulk-update-status="$can('update', 'MeetingType')"
        :can-bulk-destroy="$can('destroy', 'MeetingType')"
        @bulk-change-status="openBulkUpdateStatusDialog"
        @bulk-delete="bulkDeleteItems"
        @import="handleImport"
        @export="handleExport"
        @add="openAddDialog"
      />

      <MeetingTypeDataTable
        :selected-rows="selectedRows"
        :items="itemsData"
        :total-items="totalItems"
        :headers="headers"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
        :can-read="$can('read', 'MeetingType')"
        :can-update="$can('update', 'MeetingType')"
        :can-delete="$can('destroy', 'MeetingType')"
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