/* eslint-disable camelcase */
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
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
import { ability } from '@/plugins/casl/ability'
import { downloadBlob } from '@/utils/downloadHelper'

export function useDocumentTypeListPage() {
  const ITEMS_PER_PAGE_OPTIONS = [
    { title: '10', value: 10 },
    { title: '20', value: 20 },
    { title: '50', value: 50 },
    { title: '100', value: 100 },
  ]

  const searchQuery = ref('')
  const statusFilter = ref('')
  const meetingTypeFilter = ref('')
  
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
  const { data: requestData, execute: fetchItems, isFetching: loading } = useApi(createUrl('/meeting-document-types', {
    query: {
      search: computed(() => searchQuery.value || undefined),
      status: computed(() => statusFilter.value || undefined),
      meeting_type_id: computed(() => meetingTypeFilter.value || undefined),
      limit: itemsPerPage,
      page,
    },
  }))

  const itemsData = computed(() => requestData.value?.data ?? [])
  const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

  // Options Fetching
  const { data: meetingTypesData } = useApi('/meeting-types?limit=100')

  const meetingTypeOptions = computed(() => {
    const types = meetingTypesData.value?.data ?? []
    
    return types.map(t => ({ title: t.name, value: t.id }))
  })

  // === Watches for triggers ===
  watchDebounced(searchQuery, () => {
    page.value = 1
    fetchItems()
  }, { debounce: 500 })

  watch([statusFilter, meetingTypeFilter], () => {
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
      title: 'Xóa loại tài liệu họp',
      message: 'Bạn có chắc chắn muốn xóa không?',
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await deleteDocumentType(id)
        showSuccess('Xóa thành công.')
        fetchItems()
      },
    })
  }

  const toggleItemStatus = async item => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'
    const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

    openConfirmDialog({
      title: 'Đổi trạng thái',
      message: `Bạn có chắc chắn muốn chuyển trạng thái sang "${nextLabel}" không?`,
      confirmText: 'Đổi',
      confirmColor: 'warning',
      action: async () => {
        await changeDocumentTypeStatus(item.id, nextStatus)
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
      message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} bản ghi đã chọn?`,
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await bulkDeleteDocumentTypes({ ids: selectedRows.value })
        selectedRows.value = []
        showSuccess('Xóa hàng loạt thành công.')
        fetchItems()
      },
    })
  }

  const bulkChangeStatus = async status => {
    if (!selectedRows.value.length) return
    try {
      await bulkUpdateDocumentTypes({ ids: selectedRows.value, status })
      selectedRows.value = []
      showSuccess(`Cập nhật trạng thái thành công.`)
      fetchItems()
    } catch (err) {
      showError(err, 'Lỗi cập nhật trạng thái hàng loạt.')
    }
  }

  // Export / Import
  const handleExport = async () => {
    if (!ability.can('export', 'MeetingDocumentType')) return
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
          fileName: `export_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 22 }],
        })
      } else {
        const res = await exportDocumentTypes({
          search: searchQuery.value || undefined,
          status: statusFilter.value || undefined,
          meeting_type_id: meetingTypeFilter.value || undefined,
        })

        downloadBlob(res, 'export-data.xlsx')
      }
    } catch (error) {
      showError(error, 'Lỗi xuất dữ liệu.')
    } finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    if (!ability.can('import', 'MeetingDocumentType')) return
    isImporting.value = true
    try {
      const payload = new FormData()

      payload.append('file', file)
      await importDocumentTypes(payload)
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
  }
}