/* eslint-disable camelcase */
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  bulkDeleteDocumentFields,
  bulkUpdateDocumentFields,
  changeDocumentFieldStatus,
  createDocumentField,
  deleteDocumentField,
  exportDocumentFields,
  importDocumentFields,
  updateDocumentField,
} from '@/modules/meetings/services/meetingService'
import { ability } from '@/plugins/casl/ability'
import { downloadBlob } from '@/utils/downloadHelper'

export function useDocumentFieldListPage() {
  const ITEMS_PER_PAGE_OPTIONS = [
    { title: '10', value: 10 },
    { title: '20', value: 20 },
    { title: '50', value: 50 },
    { title: '100', value: 100 },
  ]

  const searchQuery = ref('')
  const statusFilter = ref('')
  
  
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
  const { data: requestData, execute: fetchItems, isFetching: loading } = useApi(createUrl('/meeting-document-fields', {
    query: {
      search: computed(() => searchQuery.value || undefined),
      status: computed(() => statusFilter.value || undefined),
      
      limit: itemsPerPage,
      page,
    },
  }))

  const itemsData = computed(() => requestData.value?.data ?? [])
  const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

  

  // === Watches for triggers ===
  watchDebounced(searchQuery, () => {
    page.value = 1
    fetchItems()
  }, { debounce: 500 })

  watch([statusFilter], () => {
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
      title: 'Xóa lĩnh vực tài liệu họp',
      message: 'Bạn có chắc chắn muốn xóa không?',
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await deleteDocumentField(id)
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
        await changeDocumentFieldStatus(item.id, nextStatus)
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
        await bulkDeleteDocumentFields({ ids: selectedRows.value })
        selectedRows.value = []
        showSuccess('Xóa hàng loạt thành công.')
        fetchItems()
      },
    })
  }

  const bulkChangeStatus = async status => {
    if (!selectedRows.value.length) return
    try {
      await bulkUpdateDocumentFields({ ids: selectedRows.value, status })
      selectedRows.value = []
      showSuccess(`Cập nhật trạng thái thành công.`)
      fetchItems()
    } catch (err) {
      showError(err, 'Lỗi cập nhật trạng thái hàng loạt.')
    }
  }

  // Export / Import
  const handleExport = async () => {
    if (!ability.can('export', 'MeetingDocumentField')) return
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
        const res = await exportDocumentFields({
          search: searchQuery.value || undefined,
          status: statusFilter.value || undefined,
          
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
    if (!ability.can('import', 'MeetingDocumentField')) return
    isImporting.value = true
    try {
      const payload = new FormData()

      payload.append('file', file)
      await importDocumentFields(payload)
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
    createDocumentField,
    updateDocumentField,
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