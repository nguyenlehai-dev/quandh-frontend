const fs = require('fs')
const path = require('path')

const configs = [
  {
    entityName: 'DocumentType',
    modelName: 'MeetingDocumentType',
    apiEndpoint: '/meeting-document-types',
    hasMeetingType: true,
    pageTitle: 'Loại tài liệu họp',
    pageDesc: 'Quản lý danh mục loại tài liệu cuộc họp',
    icon: 'tabler-category',
    listPagePath: 'src/modules/meetings/views/catalogs/documents/DocumentTypeListPage.vue',
  },
  {
    entityName: 'DocumentField',
    modelName: 'MeetingDocumentField',
    apiEndpoint: '/meeting-document-fields',
    hasMeetingType: false,
    pageTitle: 'Lĩnh vực tài liệu họp',
    pageDesc: 'Quản lý danh mục lĩnh vực tài liệu cuộc họp',
    icon: 'tabler-category',
    listPagePath: 'src/modules/meetings/views/catalogs/documents/DocumentFieldListPage.vue',
  },
  {
    entityName: 'MeetingType',
    modelName: 'MeetingType',
    apiEndpoint: '/meeting-types',
    hasMeetingType: false,
    pageTitle: 'Loại cuộc họp',
    pageDesc: 'Quản lý danh mục loại cuộc họp',
    icon: 'tabler-video',
    listPagePath: 'src/modules/meetings/views/catalogs/meetings/MeetingTypeListPage.vue',
  }
]

for (const config of configs) {
  const composablePath = path.join(__dirname, `src/modules/meetings/composables/use${config.entityName}ListPage.js`)
  const toolbarPath = path.join(__dirname, `src/modules/meetings/components/${config.entityName}ListToolbar.vue`)
  const tablePath = path.join(__dirname, `src/modules/meetings/components/${config.entityName}DataTable.vue`)
  const parentPath = path.join(__dirname, config.listPagePath)

  // 1. Generate Composable
  const composableCode = `/* eslint-disable camelcase */
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  bulkDelete${config.entityName}s,
  bulkUpdate${config.entityName}s,
  change${config.entityName}Status,
  create${config.entityName},
  delete${config.entityName},
  export${config.entityName}s,
  import${config.entityName}s,
  update${config.entityName},
} from '@/modules/meetings/services/meetingService'
import { ability } from '@/plugins/casl/ability'
import { downloadBlob } from '@/utils/downloadHelper'

export function use${config.entityName}ListPage() {
  const ITEMS_PER_PAGE_OPTIONS = [
    { title: '10', value: 10 },
    { title: '20', value: 20 },
    { title: '50', value: 50 },
    { title: '100', value: 100 },
  ]

  const searchQuery = ref('')
  const statusFilter = ref('')
  ${config.hasMeetingType ? `const meetingTypeFilter = ref('')` : ''}
  
  const itemsPerPage = ref(10)
  const page = ref(1)
  const selectedRows = ref([])
  
  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const isExporting = ref(false)
  const isImporting = ref(false)
  
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const confirmDialog = ref({
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    confirmColor: 'primary',
    action: null,
  })

  const statusOptions = [
    { title: 'Hoạt động', value: 'active' },
    { title: 'Tạm khóa', value: 'inactive' },
  ]

  const bulkStatusOptions = [
    { title: 'Kích hoạt', value: 'active' },
    { title: 'Tạm khóa', value: 'inactive' },
  ]

  const headers = [
    { title: 'STT', key: 'stt', sortable: false },
    { title: 'Tên', key: 'name' },
    { title: 'Mô tả', key: 'description', sortable: false },
    { title: 'Trạng thái', key: 'status' },
    { title: 'Tạo bởi', key: 'created_info', sortable: false },
    { title: 'Cập nhật bởi', key: 'updated_info', sortable: false },
    { title: 'Hành động', key: 'actions', sortable: false },
  ]

  // Data fetching
  const { data: requestData, execute: fetchItems, isFetching: loading } = useApi(createUrl('${config.apiEndpoint}', {
    query: {
      search: computed(() => searchQuery.value || undefined),
      status: computed(() => statusFilter.value || undefined),
      ${config.hasMeetingType ? `meeting_type_id: computed(() => meetingTypeFilter.value || undefined),` : ''}
      limit: itemsPerPage,
      page,
    },
  }))

  const itemsData = computed(() => requestData.value?.data ?? [])
  const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

  ${config.hasMeetingType ? `// Options Fetching
  const { data: meetingTypesData } = useApi('/meeting-types?limit=100')
  const meetingTypeOptions = computed(() => {
    const types = meetingTypesData.value?.data ?? []
    return types.map(t => ({ title: t.name, value: t.id }))
  })` : ''}

  // === Watches for triggers ===
  watchDebounced(searchQuery, () => {
    page.value = 1
    fetchItems()
  }, { debounce: 500 })

  watch([statusFilter${config.hasMeetingType ? ', meetingTypeFilter' : ''}], () => {
    page.value = 1
    fetchItems()
  })

  const handleSelectionChange = newSelection => {
    selectedRows.value = newSelection
  }

  const updateOptions = options => {
    if (options.page !== page.value) page.value = options.page
    if (options.itemsPerPage !== itemsPerPage.value) itemsPerPage.value = options.itemsPerPage
  }

  // Common Dialog Helpers
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
      showError(err, 'Không thể thực hiện thao tác.')
    } finally {
      isConfirming.value = false
    }
  }

  // Item Actions
  const deleteItem = id => {
    openConfirmDialog({
      title: 'Xóa ${config.pageTitle.toLowerCase()}',
      message: 'Bạn có chắc chắn muốn xóa không?',
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await delete${config.entityName}(id)
        showSuccess('Xóa thành công.')
        fetchItems()
      },
    })
  }

  const toggleItemStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'
    const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

    openConfirmDialog({
      title: 'Đổi trạng thái',
      message: \`Bạn có chắc chắn muốn chuyển trạng thái sang "\${nextLabel}" không?\`,
      confirmText: 'Đổi',
      confirmColor: 'warning',
      action: async () => {
        await change${config.entityName}Status(item.id, nextStatus)
        showSuccess('Đổi trạng thái thành công.')
        fetchItems()
      },
    })
  }

  // Bulk Actions
  const bulkDeleteItems = () => {
    if (!selectedRows.value.length) return
    openConfirmDialog({
      title: 'Xóa hàng loạt',
      message: \`Bạn có chắc chắn muốn xóa \${selectedRows.value.length} bản ghi đã chọn?\`,
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await bulkDelete${config.entityName}s({ ids: selectedRows.value })
        selectedRows.value = []
        showSuccess('Xóa hàng loạt thành công.')
        fetchItems()
      },
    })
  }

  const bulkChangeStatus = async (status) => {
    if (!selectedRows.value.length) return
    try {
      await bulkUpdate${config.entityName}s({ ids: selectedRows.value, status })
      selectedRows.value = []
      showSuccess(\`Cập nhật trạng thái thành công.\`)
      fetchItems()
    } catch (err) {
      showError(err, 'Lỗi cập nhật trạng thái hàng loạt.')
    }
  }

  // Export / Import
  const handleExport = async () => {
    if (!ability.can('export', '${config.modelName}')) return
    isExporting.value = true
    try {
      if (selectedRows.value.length) {
        const selectedItems = itemsData.value.filter(item => selectedRows.value.includes(item.id))
        const { exportRowsToExcel } = await import('@/modules/auth/shared/excelExport')
        
        exportRowsToExcel({
          rows: selectedItems.map(item => ({
            name: item.name || '',
            description: item.description || '',
            status: item.status || '',
            created_at: item.created_at || '',
          })),
          headers: ['name', 'description', 'status', 'created_at'],
          sheetName: 'Items',
          fileName: \`export_\${new Date().toISOString().slice(0, 10)}.xlsx\`,
          columns: [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 22 }],
        })
      } else {
        const res = await export${config.entityName}s({
          search: searchQuery.value || undefined,
          status: statusFilter.value || undefined,
          ${config.hasMeetingType ? `meeting_type_id: meetingTypeFilter.value || undefined,` : ''}
        })
        downloadBlob(res, 'export-data.xlsx')
      }
    } catch (error) {
      showError(error, 'Lỗi xuất dữ liệu.')
    } finally {
      isExporting.value = false
    }
  }

  const handleImport = async (file) => {
    if (!ability.can('import', '${config.modelName}')) return
    isImporting.value = true
    try {
      const payload = new FormData()
      payload.append('file', file)
      await import${config.entityName}s(payload)
      showSuccess('Nhập dữ liệu thành công.')
      fetchItems()
    } catch (error) {
      showError(error, 'Lỗi nhập dữ liệu.')
    } finally {
      isImporting.value = false
    }
  }

  return {
    ITEMS_PER_PAGE_OPTIONS,
    snackbar,
    showSuccess,
    showError,
    searchQuery,
    statusFilter,
    ${config.hasMeetingType ? 'meetingTypeFilter,' : ''}
    itemsPerPage,
    page,
    selectedRows,
    itemsData,
    totalItems,
    loading,
    statusOptions,
    ${config.hasMeetingType ? 'meetingTypeOptions,' : ''}
    bulkStatusOptions,
    headers,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    isExporting,
    isImporting,
    fetchItems,
    create${config.entityName},
    update${config.entityName},
    updateOptions,
    handleSelectionChange,
    bulkDeleteItems,
    bulkChangeStatus,
    deleteItem,
    toggleItemStatus,
    executeConfirmedAction,
    handleExport,
    handleImport,
  }
}`

  // 2. Generate Toolbar
  const toolbarCode = `<script setup>
import { ref } from 'vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  ${config.hasMeetingType ? `meetingTypeFilter: { type: [String, Number], default: null },` : ''}
  statusOptions: { type: Array, required: true },
  ${config.hasMeetingType ? `meetingTypeOptions: { type: Array, required: true },` : ''}
  selectedRowsCount: { type: Number, default: 0 },
  isImporting: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  canImport: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canBulkUpdateStatus: { type: Boolean, default: false },
  canBulkDestroy: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  ${config.hasMeetingType ? `'update:meetingTypeFilter',` : ''}
  'bulkChangeStatus',
  'bulkDelete',
  'import',
  'export',
  'add',
])

const isImportDialogVisible = ref(false)
const importFile = ref(null)

const closeImportDialog = () => {
  isImportDialogVisible.value = false
  importFile.value = null
}

const handleImport = () => {
  if (importFile.value) {
    emit('import', importFile.value)
    closeImportDialog()
  }
}
</script>

<template>
  <div>
    <VCardItem title="Bộ lọc và Tìm kiếm" />

    <VCardText>
      <VRow class="align-center">
        <VCol cols="12" md="4">
          <AppTextField
            :model-value="searchQuery"
            label="Tìm kiếm"
            placeholder="Tìm kiếm..."
            @update:model-value="emit('update:searchQuery', $event)"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppSelect
            :model-value="statusFilter"
            label="Trạng thái"
            :items="[{ title: 'Tất cả trạng thái', value: '' }, ...statusOptions]"
            item-title="title"
            item-value="value"
            placeholder="Lọc theo trạng thái"
            @update:model-value="emit('update:statusFilter', $event)"
          />
        </VCol>
        ${config.hasMeetingType ? `<VCol cols="12" md="4">
          <AppSelect
            :model-value="meetingTypeFilter"
            label="Loại cuộc họp"
            :items="[{ title: 'Tất cả loại cuộc họp', value: '' }, ...meetingTypeOptions]"
            item-title="title"
            item-value="value"
            placeholder="Lọc theo loại cuộc họp"
            clearable
            @update:model-value="emit('update:meetingTypeFilter', $event)"
          />
        </VCol>` : ''}
      </VRow>
    </VCardText>

    <VDivider />

    <VCardText>
      <div class="d-flex justify-sm-space-between justify-start flex-wrap gap-4">
        <div class="d-flex gap-x-4 align-center flex-wrap">
          <template v-if="selectedRowsCount > 0">
            <VMenu>
              <template #activator="{ props: menuProps }">
                <VBtn
                  v-bind="menuProps"
                  variant="tonal"
                  prepend-icon="tabler-chevron-down"
                >
                  Thao tác
                </VBtn>
              </template>

              <VList>
                <VListItem
                  v-if="canBulkUpdateStatus"
                  @click="emit('bulkChangeStatus', 'active')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-check" />
                  </template>
                  <VListItemTitle>Kích hoạt</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkUpdateStatus"
                  @click="emit('bulkChangeStatus', 'inactive')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-x" />
                  </template>
                  <VListItemTitle>Tạm khóa</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkDestroy"
                  @click="emit('bulkDelete')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Xóa nhiều</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>
        </div>

        <div class="d-flex gap-x-4 align-center flex-wrap">
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
            text="Nhập dữ liệu"
            :loading="isImporting"
            :disabled="!canImport"
            @click="isImportDialogVisible = true"
          />
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-file-download"
            text="Xuất dữ liệu"
            :loading="isExporting"
            :disabled="!canExport"
            @click="emit('export')"
          />
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            :disabled="!canCreate"
            @click="emit('add')"
          >
            Thêm mới
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VDivider />

    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập dữ liệu">
        <VCardText>
          <div class="text-caption mb-5 text-disabled">
            Import hỗ trợ file \`.xlsx\`, \`.xls\`, \`.csv\` theo mẫu quy định.
          </div>

          <VFileInput
            v-model="importFile"
            label="Chọn file Excel"
            accept=".xlsx,.xls,.csv"
            prepend-icon="tabler-file-spreadsheet"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            @click="closeImportDialog"
          >
            Hủy
          </VBtn>
          <VBtn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            @click="handleImport"
          >
            Nhập dữ liệu
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>`

  // 3. Generate DataTable
  const tableCode = `<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  totalItems: { type: Number, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:selectedRows',
  'update:options',
  'edit',
  'delete',
  'toggleStatus',
])

const getRowNumber = index => ((props.page - 1) * props.itemsPerPage) + index + 1
</script>

<template>
  <VDataTableServer
    :model-value="selectedRows"
    :items-per-page="itemsPerPage"
    :page="page"
    :items="items"
    :items-length="totalItems"
    :headers="headers"
    :loading="loading"
    class="text-no-wrap"
    show-select
    @update:model-value="emit('update:selectedRows', $event)"
    @update:options="emit('update:options', $event)"
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
          v-if="canUpdate"
          @click="emit('edit', item)"
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
          v-if="canUpdate"
          @click="emit('toggleStatus', item)"
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
          v-if="canDelete"
          @click="emit('delete', item)"
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
      <VDivider />
      <div class="d-flex align-center justify-space-between pa-4">
        <span class="text-body-2 text-disabled">
          Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} 
          đến {{ Math.min(page * itemsPerPage, totalItems) }} 
          trên tổng {{ totalItems }} bản ghi
        </span>
        <TablePagination
          :page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          @update:page="$emit('update:options', { page: $event, itemsPerPage })"
        />
      </div>
    </template>
  </VDataTableServer>
</template>`

  // 4. Generate ListPage
  const parentCode = `<script setup>
/* eslint-disable camelcase, padding-line-between-statements */
import { ability } from '@/plugins/casl/ability'
import { computed, ref } from 'vue'

import { use${config.entityName}ListPage } from '@/modules/meetings/composables/use${config.entityName}ListPage'
import ${config.entityName}ListToolbar from '@/modules/meetings/components/${config.entityName}ListToolbar.vue'
import ${config.entityName}DataTable from '@/modules/meetings/components/${config.entityName}DataTable.vue'

const {
  snackbar,
  searchQuery,
  statusFilter,
  ${config.hasMeetingType ? 'meetingTypeFilter,' : ''}
  itemsPerPage,
  page,
  selectedRows,
  itemsData,
  totalItems,
  loading,
  statusOptions,
  ${config.hasMeetingType ? 'meetingTypeOptions,' : ''}
  bulkStatusOptions,
  headers,
  isConfirmDialogVisible,
  isConfirming,
  confirmDialog,
  isExporting,
  isImporting,
  
  fetchItems,
  create${config.entityName},
  update${config.entityName},
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
} = use${config.entityName}ListPage()

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
  ${config.hasMeetingType ? 'meeting_type_id: null,' : ''}
})

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active'${config.hasMeetingType ? ', meeting_type_id: null' : ''} }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = {
    name: item.name,
    description: item.description || '',
    status: item.status,
    ${config.hasMeetingType ? 'meeting_type_id: item.meeting_type_id,' : ''}
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
      await update${config.entityName}(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật thành công.')
    } else {
      await create${config.entityName}(formData.value) 
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
        <VIcon icon="${config.icon}" />
      </VAvatar>
      <div>
        <h2 class="text-h4 mb-1">
          ${config.pageTitle}
        </h2>
        <div class="text-body-1 text-disabled">
          ${config.pageDesc}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <VCard>
      <${config.entityName}ListToolbar
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        ${config.hasMeetingType ? `v-model:meeting-type-filter="meetingTypeFilter"` : ''}
        :status-options="statusOptions"
        ${config.hasMeetingType ? `:meeting-type-options="meetingTypeOptions"` : ''}
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', '${config.modelName}')"
        :can-export="$can('export', '${config.modelName}')"
        :can-create="$can('store', '${config.modelName}')"
        :can-bulk-update-status="$can('update', '${config.modelName}')"
        :can-bulk-destroy="$can('destroy', '${config.modelName}')"
        @bulk-change-status="openBulkUpdateStatusDialog"
        @bulk-delete="bulkDeleteItems"
        @import="handleImport"
        @export="handleExport"
        @add="openAddDialog"
      />

      <${config.entityName}DataTable
        :selected-rows="selectedRows"
        :items="itemsData"
        :total-items="totalItems"
        :headers="headers"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
        :can-update="$can('update', '${config.modelName}')"
        :can-delete="$can('destroy', '${config.modelName}')"
        @update:selected-rows="handleSelectionChange"
        @update:options="updateOptions"
        @edit="openEditDialog"
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
            ${config.hasMeetingType ? `<VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>` : ''}
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
            ${config.hasMeetingType ? `<VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>` : ''}
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
</template>`

  fs.writeFileSync(composablePath, composableCode, 'utf8')
  fs.writeFileSync(toolbarPath, toolbarCode, 'utf8')
  fs.writeFileSync(tablePath, tableCode, 'utf8')
  fs.writeFileSync(parentPath, parentCode, 'utf8')
  console.log('Generated ' + config.entityName)
}
