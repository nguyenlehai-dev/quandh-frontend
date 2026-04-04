<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  bulkDeleteDocumentTypes,
  bulkUpdateDocumentTypes,
  changeDocumentTypeStatus,
  createDocumentType,
  deleteDocumentType,
  exportDocumentTypes,
  importDocumentTypes,
  updateDocumentType,
} from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref([])
const meetingTypeFilter = ref('')
const sortBy = ref()
const orderBy = ref()
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)

const confirmDialog = ref({
  title: '',
  message: '',
  confirmText: 'Xác nhận',
  confirmColor: 'primary',
  action: null,
})

const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const statusOptions = [
  { title: 'Hoạt động', value: 'active' },
  { title: 'Tạm khóa', value: 'inactive' },
]

const headers = [
  { title: 'STT', key: 'stt', sortable: false },
  { title: 'Tên', key: 'name' },
  { title: 'Mô tả', key: 'description', sortable: false },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Tạo', key: 'created_info', sortable: false },
  { title: 'Cập nhật', key: 'updated_info', sortable: false },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meeting-document-types', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => statusFilter.value || undefined),
    meeting_type_id: computed(() => meetingTypeFilter.value || undefined),
    limit: itemsPerPage,
    page,
    sort_by: computed(() => sortBy.value || undefined),
    sort_order: computed(() => orderBy.value || undefined),
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

// Fetch danh sách Loại cuộc họp (cho dropdown)
const { data: meetingTypesData } = useApi('/meeting-types?limit=100')

const meetingTypeOptions = computed(() => {
  const types = meetingTypesData.value?.data ?? []

  return [{ title: '-- Không gắn --', value: null }, ...types.map(t => ({ title: t.name, value: t.id }))]
})

const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedItemId = ref(null)
const isBulkUpdateDialogVisible = ref(false)
const bulkUpdateStatusValue = ref('active')
const isImportDialogVisible = ref(false)
const importFile = ref([])

const formData = ref({
  name: '',
  description: '',
  status: 'active',
  meeting_type_id: null,
})

const getRowNumber = index => ((page.value - 1) * itemsPerPage.value) + index + 1

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

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

const openConfirmDialog = options => {
  confirmDialog.value = {
    title: options.title,
    message: options.message,
    confirmText: options.confirmText ?? 'Xác nhận',
    confirmColor: options.confirmColor ?? 'primary',
    action: options.action ?? null,
  }
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

const submitForm = async () => {
  if (!formData.value.name) {
    showSnackbar('Vui lòng nhập tên loại tài liệu.', 'warning')

    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateDocumentType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật loại tài liệu thành công.')
    } else {
      await createDocumentType(formData.value)
      isAddDialogVisible.value = false
      showSuccess('Tạo loại tài liệu thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu loại tài liệu.')
    console.error('Action failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa loại tài liệu',
    message: `Bạn có chắc chắn muốn xóa "${item.name}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteDocumentType(item.id)
      showSuccess('Xóa loại tài liệu thành công.')
      fetchItems()
    },
  })
}

const bulkDelete = () => {
  if (!selectedRows.value.length) return

  openConfirmDialog({
    title: 'Xóa hàng loạt loại tài liệu',
    message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} loại tài liệu đã chọn không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteDocumentTypes({ ids: selectedRows.value })
      selectedRows.value = []
      showSuccess('Xóa hàng loạt loại tài liệu thành công.')
      fetchItems()
    },
  })
}

const bulkUpdateStatus = () => {
  if (!selectedRows.value.length) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  try {
    await bulkUpdateDocumentTypes({ ids: selectedRows.value, status: bulkUpdateStatusValue.value })
    selectedRows.value = []
    isBulkUpdateDialogVisible.value = false
    showSuccess('Cập nhật trạng thái hàng loạt loại tài liệu thành công.')
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể cập nhật trạng thái hàng loạt.')
    console.error('Bulk update document types failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const toggleItemStatus = item => {
  const nextStatus = item.status === 'active' ? 'inactive' : 'active'
  const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

  openConfirmDialog({
    title: 'Đổi trạng thái loại tài liệu',
    message: `Bạn có chắc chắn muốn chuyển "${item.name}" sang trạng thái "${nextLabel}" không?`,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await changeDocumentTypeStatus(item.id, nextStatus)
      showSuccess('Đổi trạng thái loại tài liệu thành công.')
      fetchItems()
    },
  })
}

const isExporting = ref(false)

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportDocumentTypes({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      meeting_type_id: meetingTypeFilter.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
      sort_by: sortBy.value || undefined,
      sort_order: orderBy.value || undefined,
    })

    downloadBlob(res, 'loai-tai-lieu-cuoc-hop.xlsx')
  } catch (error) {
    showError(error, 'Không thể xuất dữ liệu loại tài liệu.')
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}

const importData = async () => {
  if (!importFile.value || (Array.isArray(importFile.value) && importFile.value.length === 0)) {
    showSnackbar('Vui lòng chọn file import.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    const payload = new FormData()
    const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

    payload.append('file', file)
    await importDocumentTypes(payload)
    isImportDialogVisible.value = false
    importFile.value = []
    showSuccess('Import loại tài liệu thành công.')
    fetchItems()
  } catch (error) {
    showError(error, 'Không thể import loại tài liệu.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <!-- Filter Section -->
    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-category"
            class="section-icon"
          />
          Loại tài liệu
        </div>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Tìm kiếm
            </div>
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm kiếm loại tài liệu..."
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Loại cuộc họp
            </div>
            <AppSelect
              v-model="meetingTypeFilter"
              :items="[{ title: 'Tất cả loại cuộc họp', value: '' }, ...meetingTypeOptions]"
              placeholder="Lọc theo loại cuộc họp"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Trạng thái
            </div>
            <AppSelect
              v-model="statusFilter"
              :items="[{ title: 'Tất cả trạng thái', value: '' }, ...statusOptions]"
              placeholder="Lọc theo trạng thái"
              density="compact"
            />
          </VCol>
        </VRow>
      </div>
    </div>

    <!-- Table Actions Bar -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-4">
      <div class="d-flex align-center gap-3">
        <AppSelect
          v-model="itemsPerPage"
          :items="[
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 },
          ]"
          density="compact"
          style="max-inline-size: 80px;"
        />
        <VBtn
          v-if="selectedRows.length > 0"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="bulkDelete"
        >
          Xoa ({{ selectedRows.length }})
        </VBtn>
        <VBtn
          v-if="selectedRows.length > 0"
          color="warning"
          variant="tonal"
          prepend-icon="tabler-exchange"
          @click="bulkUpdateStatus"
        >
          Doi trang thai
        </VBtn>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          prepend-icon="tabler-upload"
          @click="isImportDialogVisible = true"
        >
          Nhập dữ liệu
        </VBtn>
        <VBtn
          variant="outlined"
          prepend-icon="tabler-download"
          :loading="isExporting"
          @click="exportData"
        >
          Xuất dữ liệu
        </VBtn>
        <VBtn
          v-if="$can('store', 'MeetingDocumentType')"
          color="primary"
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Thêm mới
        </VBtn>
      </div>
    </div>

    <!-- Data Table -->
    <div class="meeting-section-card mb-6">
      <VDataTableServer
        v-model="selectedRows"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <template #item.stt="{ index }">
          <span class="text-body-2 text-disabled">{{ getRowNumber(index) }}</span>
        </template>

        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <template #item.description="{ item }">
          <span>{{ item.description || '---' }}</span>
        </template>

        <template #item.created_info="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.created_by || 'N/A' }}</span>
            <span class="text-body-2 text-disabled">{{ item.created_at || '---' }}</span>
          </div>
        </template>

        <template #item.updated_info="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.updated_by || 'N/A' }}</span>
            <span class="text-body-2 text-disabled">{{ item.updated_at || '---' }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.status === 'active' ? 'success' : 'secondary'"
          >
            {{ item.status === 'active' ? 'Hoạt động' : 'Tạm khóa' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="$can('update', 'MeetingDocumentType')"
              @click="openEditDialog(item)"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Sửa
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('update', 'MeetingDocumentType')"
              @click="toggleItemStatus(item)"
            >
              <VIcon
                :icon="item.status === 'active' ? 'tabler-toggle-right' : 'tabler-toggle-left'"
                :color="item.status === 'active' ? 'success' : 'warning'"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Đổi trạng thái
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('destroy', 'MeetingDocumentType')"
              @click="deleteItem(item)"
            >
              <VIcon
                icon="tabler-trash"
                color="error"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Xóa
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} đến {{ Math.min(page * itemsPerPage, totalItems) }} trên tổng {{ totalItems }} bản ghi
            </span>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalItems"
            />
          </div>
        </template>
      </VDataTableServer>
    </div>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="500"
    >
      <VCard title="Thêm Loại tài liệu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên loại tài liệu *"
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
    </VDialog>

    <!-- Dialog Cập nhật -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="500"
    >
      <VCard title="Cập nhật Loại tài liệu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên loại tài liệu *"
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

    <VDialog
      v-model="isImportDialogVisible"
      max-width="480"
    >
      <VCard title="Nhập loại tài liệu">
        <VCardText>
          <VFileInput
            v-model="importFile"
            label="Chọn file Excel / CSV"
            accept=".xlsx,.xls,.csv"
            prepend-icon="tabler-upload"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isImportDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="importData"
          >
            Import
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
