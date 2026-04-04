<script setup>
/* eslint-disable camelcase, padding-line-between-statements */

import { useActionFeedback } from '@/composables/useActionFeedback'
import AuthDataActions from '@/modules/auth/shared/AuthDataActions.vue'
import { exportRowsToExcel } from '@/modules/auth/shared/excelExport'
import { ability } from '@/plugins/casl/ability'
import { deleteMeetingType, createMeetingType, updateMeetingType, bulkDeleteMeetingTypes, bulkUpdateMeetingTypes, exportMeetingTypes, changeMeetingTypeStatus, importMeetingTypes, downloadMeetingTypeImportTemplate } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref([])
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

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meeting-types', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => statusFilter.value || undefined),
    limit: itemsPerPage,
    page,
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

const selectedMeetingTypes = computed(() => items.value.filter(item => selectedRows.value.includes(item.id)))

const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedItemId = ref(null)

const formData = ref({
  name: '',
  description: '',
  status: 'active',
})

const isBulkUpdateDialogVisible = ref(false)
const bulkUpdateStatusValue = ref('active')

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active' }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = { name: item.name, description: item.description || '', status: item.status }
  isEditDialogVisible.value = true
}

const refFormAdd = ref()
const refFormEdit = ref()

const rules = {
  required: value => !!value || 'Trường này là bắt buộc',
}

const getRowNumber = index => ((page.value - 1) * itemsPerPage.value) + index + 1

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

const submitForm = async (type = 'add') => {
  const form = type === 'add' ? refFormAdd.value : refFormEdit.value
  const { valid } = await form.validate()

  if (!valid) {
    showSnackbar('Vui lòng kiểm tra lại thông tin bắt buộc.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateMeetingType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật loại cuộc họp thành công.')
    } else {
      await createMeetingType(formData.value)
      isAddDialogVisible.value = false
      showSuccess('Tạo loại cuộc họp thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu loại cuộc họp.')
    console.error('Action failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa loại cuộc họp',
    message: `Bạn có chắc chắn muốn xóa "${item.name}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingType(item.id)
      showSuccess('Xóa loại cuộc họp thành công.')
      fetchItems()
    },
  })
}

const bulkDelete = async () => {
  if (!selectedRows.value.length) return

  openConfirmDialog({
    title: 'Xóa hàng loạt',
    message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} loại cuộc họp đã chọn không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteMeetingTypes({ ids: selectedRows.value })
      selectedRows.value = []
      showSuccess('Xóa hàng loạt loại cuộc họp thành công.')
      fetchItems()
    },
  })
}

const bulkUpdateStatus = async () => {
  if (selectedRows.value.length === 0) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  try {
    await bulkUpdateMeetingTypes({ ids: selectedRows.value, status: bulkUpdateStatusValue.value })
    selectedRows.value = []
    isBulkUpdateDialogVisible.value = false
    showSuccess('Cập nhật trạng thái hàng loạt thành công.')
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể cập nhật trạng thái hàng loạt.')
    console.error('Có lỗi xảy ra khi cập nhật hàng loạt', err)
  } finally {
    isSubmitting.value = false
  }
}

const toggleItemStatus = item => {
  const nextStatus = item.status === 'active' ? 'inactive' : 'active'
  const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

  openConfirmDialog({
    title: 'Đổi trạng thái loại cuộc họp',
    message: `Bạn có chắc chắn muốn chuyển "${item.name}" sang trạng thái "${nextLabel}" không?`,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await changeMeetingTypeStatus(item.id, nextStatus)
      showSuccess('Đổi trạng thái loại cuộc họp thành công.')
      fetchItems()
    },
  })
}

const isExporting = ref(false)

const exportData = async () => {
  if (!ability.can('export', 'MeetingType')) return

  isExporting.value = true
  try {
    if (selectedMeetingTypes.value.length) {
      exportRowsToExcel({
        rows: selectedMeetingTypes.value.map(item => ({
          name: item.name || '',
          description: item.description || '',
          status: item.status || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
        })),
        headers: ['name', 'description', 'status', 'created_at', 'updated_at'],
        sheetName: 'MeetingTypes',
        fileName: `meeting_types_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 22 }, { wch: 22 }],
      })

      return
    }

    const res = await exportMeetingTypes({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'loai-cuoc-hop.xlsx')
  } catch (error) {
    showError(error, 'Không thể xuất dữ liệu loại cuộc họp.')
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}

const handleImport = async file => {
  if (!ability.can('import', 'MeetingType')) return

  isSubmitting.value = true
  try {
    const payload = new FormData()
    payload.append('file', file)
    await importMeetingTypes(payload)
    showSuccess('Import loại cuộc họp thành công.')
    fetchItems()
  } catch (error) {
    showError(error, 'Không thể import loại cuộc họp.')
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
            icon="tabler-video"
            class="section-icon"
          />
          Loại cuộc họp
        </div>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Tìm kiếm
            </div>
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm kiếm loại cuộc họp..."
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
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
        <!-- Bulk Actions -->
        <VBtn
          v-if="selectedRows.length > 0"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="bulkDelete"
        >
          Xóa ({{ selectedRows.length }})
        </VBtn>
        <VBtn
          v-if="selectedRows.length > 0"
          color="warning"
          variant="tonal"
          prepend-icon="tabler-exchange"
          @click="bulkUpdateStatus"
        >
          Đổi trạng thái
        </VBtn>
      </div>
      <div class="d-flex gap-3">
        <AuthDataActions
          :show-import="$can('import', 'MeetingType')"
          :show-template="$can('import', 'MeetingType')"
          :show-export="$can('export', 'MeetingType')"
          :show-create="$can('store', 'MeetingType')"
          create-label="Thêm mới"
          import-label="Nhập dữ liệu"
          import-subtitle="Nạp file Excel loại cuộc họp"
          template-label="Tải file mẫu import"
          template-subtitle="Lấy mẫu Excel đúng cột backend đang nhận"
          export-label="Xuất dữ liệu"
          export-subtitle="Xuất danh sách loại cuộc họp"
          import-dialog-title="Nhập dữ liệu loại cuộc họp"
          import-hint="Import hỗ trợ file `.xlsx`, `.xls`, `.csv` theo contract backend hiện tại."
          select-file-label="Chọn file Excel"
          cancel-text="Hủy"
          import-text="Nhập dữ liệu"
          :export-loading="isExporting"
          :import-handler="handleImport"
          :template-handler="downloadMeetingTypeImportTemplate"
          :export-handler="exportData"
          :create-handler="openAddDialog"
        />
      </div>
    </div>

    <div class="meeting-section-card mb-6">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model="selectedRows"
        show-select
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        item-value="id"
        class="text-no-wrap"
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
              v-if="$can('update', 'MeetingType')"
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
              v-if="$can('update', 'MeetingType')"
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
              v-if="$can('destroy', 'MeetingType')"
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

    <VNavigationDrawer
      v-model="isAddDialogVisible"
      temporary
      location="end"
      width="460"
    >
      <VCard
        title="Thêm Loại cuộc họp"
        flat
      >
        <VForm
          ref="refFormAdd"
          @submit.prevent="() => submitForm('add')"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  label="Tên loại cuộc họp"
                  :rules="[rules.required]"
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
              type="submit"
              :loading="isSubmitting"
            >
              Lưu
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VNavigationDrawer>

    <VNavigationDrawer
      v-model="isEditDialogVisible"
      temporary
      location="end"
      width="460"
    >
      <VCard
        title="Cập nhật Loại cuộc họp"
        flat
      >
        <VForm
          ref="refFormEdit"
          @submit.prevent="() => submitForm('edit')"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  label="Tên loại cuộc họp"
                  :rules="[rules.required]"
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
              type="submit"
              :loading="isSubmitting"
            >
              Cập nhật
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VNavigationDrawer>

    <!-- Dialog Đổi Trạng Thái Hàng Loạt -->
    <VDialog
      v-model="isBulkUpdateDialogVisible"
      max-width="400"
    >
      <VCard title="Cập nhật trạng thái hàng loạt">
        <VCardText>
          <p class="mb-4">
            Bạn đang thay đổi trạng thái cho <strong class="text-primary">{{ selectedRows.length }}</strong> loại cuộc họp đã chọn.
          </p>
          <AppSelect
            v-model="bulkUpdateStatusValue"
            label="Trạng thái áp dụng"
            :items="[
              { title: 'Hoạt động', value: 'active' },
              { title: 'Tạm khóa', value: 'inactive' },
            ]"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="isSubmitting"
            @click="isBulkUpdateDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="warning"
            prepend-icon="tabler-check"
            :loading="isSubmitting"
            @click="confirmBulkUpdateStatus"
          >
            Áp dụng thay đổi
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
  </section>
</template>
