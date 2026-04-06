/* eslint-disable camelcase */
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  bulkDeleteAttendeeGroups,
  bulkUpdateAttendeeGroups,
  changeAttendeeGroupStatus,
  createAttendeeGroup,
  deleteAttendeeGroup,
  exportAttendeeGroups,
  fetchAttendeeGroup,
  importAttendeeGroups,
  updateAttendeeGroup,
} from '@/modules/meetings/services/meetingService'
import { ability } from '@/plugins/casl/ability'
import { downloadBlob } from '@/utils/downloadHelper'

export function useAttendeeGroupListPage() {
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
  const { data: requestData, execute: fetchItems, isFetching: loading } = useApi(createUrl('/attendee-groups', {
    query: {
      search: computed(() => searchQuery.value || undefined),
      status: computed(() => statusFilter.value || undefined),
      meeting_type_id: computed(() => meetingTypeFilter.value || undefined),
      limit: itemsPerPage,
      page,
    },
  }))

  const attendeeGroups = computed(() => requestData.value?.data ?? [])
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
      title: 'Xóa nhóm người dự họp',
      message: 'Bạn có chắc chắn muốn xóa nhóm này không?',
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await deleteAttendeeGroup(id)
        showSuccess('Xóa nhóm người dự họp thành công.')
        fetchItems()
      },
    })
  }

  const toggleItemStatus = async item => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'
    const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

    openConfirmDialog({
      title: 'Đổi trạng thái nhóm người dự họp',
      message: `Bạn có chắc chắn muốn chuyển trạng thái nhóm sang "${nextLabel}" không?`,
      confirmText: 'Đổi',
      confirmColor: 'warning',
      action: async () => {
        await changeAttendeeGroupStatus(item.id, nextStatus)
        showSuccess('Đổi trạng thái thành công.')
        fetchItems()
      },
    })
  }

  const handleStatusUpdate = async (item, newStatus) => {
    try {
      await changeAttendeeGroupStatus(item.id, newStatus)
      showSuccess('Cập nhật trạng thái thành công.')
      fetchItems()
    } catch (err) {
      showError(err, 'Lỗi cập nhật trạng thái.')
    }
  }

  // Bulk Actions
  const bulkDeleteGroups = () => {
    if (!selectedRows.value.length) return
    openConfirmDialog({
      title: 'Xóa hàng loạt nhóm',
      message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} nhóm đã chọn?`,
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await bulkDeleteAttendeeGroups({ ids: selectedRows.value })
        selectedRows.value = []
        showSuccess('Xóa hàng loạt thành công.')
        fetchItems()
      },
    })
  }

  const bulkChangeStatus = async status => {
    if (!selectedRows.value.length) return
    try {
      await bulkUpdateAttendeeGroups({ ids: selectedRows.value, status })
      selectedRows.value = []
      showSuccess(`Cập nhật trạng thái thành công.`)
      fetchItems()
    } catch (err) {
      showError(err, 'Lỗi cập nhật trạng thái hàng loạt.')
    }
  }

  // Export / Import
  const handleExport = async () => {
    if (!ability.can('export', 'AttendeeGroup')) return
    isExporting.value = true
    try {
      if (selectedRows.value.length) {
        // Quick local export for selected rows
        const selectedItems = attendeeGroups.value.filter(item => selectedRows.value.includes(item.id))
        const { exportRowsToExcel } = await import('@/modules/auth/shared/excelExport')
        
        exportRowsToExcel({
          rows: selectedItems.map(item => ({
            name: item.name || '',
            description: item.description || '',
            meeting_type_name: item.meeting_type_name || '',
            members_count: item.members_count || 0,
            status: item.status || '',
            created_at: item.created_at || '',
          })),
          headers: ['name', 'description', 'meeting_type_name', 'members_count', 'status', 'created_at'],
          sheetName: 'AttendeeGroups',
          fileName: `attendee_groups_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [{ wch: 28 }, { wch: 36 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 22 }],
        })
      } else {
        // Server side export for all queried data
        const res = await exportAttendeeGroups({
          search: searchQuery.value || undefined,
          status: statusFilter.value || undefined,
          meeting_type_id: meetingTypeFilter.value || undefined,
        })

        downloadBlob(res, 'nhom-thanh-phan-tham-du.xlsx')
      }
    } catch (error) {
      showError(error, 'Lỗi xuất dữ liệu.')
    } finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    if (!ability.can('import', 'AttendeeGroup')) return
    isImporting.value = true
    try {
      const payload = new FormData()

      payload.append('file', file)
      await importAttendeeGroups(payload)
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
    
    // Filters
    searchQuery,
    statusFilter,
    meetingTypeFilter,
    
    // Pagination
    itemsPerPage,
    page,
    selectedRows,
    
    // Table states
    attendeeGroups,
    totalItems,
    loading,
    
    // Options
    statusOptions,
    meetingTypeOptions,
    bulkStatusOptions,
    headers,
    
    // Dialogs
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    isExporting,
    isImporting,
    
    // Methods
    fetchItems,
    fetchAttendeeGroup,
    createAttendeeGroup,
    updateAttendeeGroup,
    updateOptions,
    handleSelectionChange,
    
    // Actions
    bulkDeleteGroups,
    bulkChangeStatus,
    deleteItem,
    toggleItemStatus,
    handleStatusUpdate,
    executeConfirmedAction,
    handleExport,
    handleImport,
  }
}
