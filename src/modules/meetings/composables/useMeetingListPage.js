/* eslint-disable camelcase */
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { ability } from '@/plugins/casl/ability'
import { 
  changeMeetingStatus, 
  deleteMeeting, 
  exportMeetings, 
  fetchMeetingTypes, 
  importMeetings, 
} from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { exportRowsToExcel } from '@/modules/auth/shared/excelExport'

export function useMeetingListPage() {
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const ITEMS_PER_PAGE_OPTIONS = [
    { title: '10', value: 10 },
    { title: '20', value: 20 },
    { title: '50', value: 50 },
  ]

  // State
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const meetingTypeFilter = ref(null)
  const fromDate = ref('')
  const toDate = ref('')
  const endFromDate = ref('')
  const endToDate = ref('')
  
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  
  const meetingTypeOptions = ref([])
  
  // Dialog state
  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const isExporting = ref(false)
  const isImporting = ref(false)
  const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })

  const headers = [
    { title: '', key: 'data-table-select', sortable: false, width: 40 },
    { title: 'Tên cuộc họp', key: 'title' },
    { title: 'Thời gian & Địa điểm', key: 'start_at' },
    { title: 'Loại cuộc họp', key: 'meeting_type_name', sortable: false },
    { title: 'Người tạo', key: 'created_by' },
    { title: 'Trạng thái', key: 'status' },
    { title: 'Thao tác', key: 'actions', sortable: false },
  ]

  const statusOptions = [
    { title: 'Tất cả trạng thái', value: '' },
    { title: 'Đang hoạt động', value: 'active' },
    { title: 'Chưa bắt đầu', value: 'draft' },
    { title: 'Đã kết thúc', value: 'completed' },
  ]

  const bulkStatusOptions = [
    { title: 'Kích hoạt', value: 'active' },
    { title: 'Bản nháp', value: 'draft' },
    { title: 'Đã kết thúc', value: 'completed' },
  ]

  const meetingStatusOptions = [
    { title: 'Nháp', value: 'draft' },
    { title: 'Kích hoạt', value: 'active' },
    { title: 'Đang họp', value: 'in_progress' },
    { title: 'Đã kết thúc', value: 'completed' },
  ]

  const hasInvalidDateRange = computed(() => {
    return (fromDate.value && toDate.value && fromDate.value > toDate.value) ||
           (endFromDate.value && endToDate.value && endFromDate.value > endToDate.value)
  })

  const commonQuery = {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => selectedStatus.value || undefined),
    meeting_type_id: computed(() => meetingTypeFilter.value || undefined),
    start_from: computed(() => fromDate.value || undefined),
    start_to: computed(() => toDate.value || undefined),
    end_from: computed(() => endFromDate.value || undefined),
    end_to: computed(() => endToDate.value || undefined),
    sort_by: computed(() => sortBy.value || undefined),
    sort_order: computed(() => orderBy.value || undefined),
  }

  const { data: requestData, execute: fetchItems, isFetching: loading } = useApi(createUrl('/meetings', {
    query: {
      ...commonQuery,
      limit: itemsPerPage,
      page,
    },
  }))

  const { data: statsData, execute: fetchStats, isFetching: isStatsLoading } = useApi(createUrl('/meetings/stats', {
    query: commonQuery,
  }))

  const meetings = computed(() => requestData.value?.data ?? [])
  const totalMeetings = computed(() => requestData.value?.meta?.total ?? 0)
  
  const widgetData = computed(() => [
    {
      title: 'Tổng cuộc họp',
      value: totalMeetings.value,
      desc: 'Tổng số cuộc họp trong hệ thống',
      icon: 'tabler-calendar-event',
      color: 'success', // mapped to match green
    },
    {
      title: 'Đang diễn ra / Sắp tới',
      value: isStatsLoading.value ? '...' : (statsData.value?.active ?? 0),
      desc: 'Cuộc họp đang hoặc sắp diễn ra',
      icon: 'tabler-player-play',
      color: 'info', // mapped to match blue
    },
    {
      title: 'Đã kết thúc',
      value: isStatsLoading.value ? '...' : (statsData.value?.completed ?? 0),
      desc: 'Cuộc họp đã kết thúc',
      icon: 'tabler-circle-check',
      color: 'secondary', // mapped to match gray
    },
  ])

  const selectedMeetingObjects = computed(() => meetings.value.filter(item => selectedRows.value.includes(item.id)))

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  const handleSelectionChange = rows => {
    selectedRows.value = rows
  }

  const openConfirmDialog = options => {
    confirmDialog.value = { ...confirmDialog.value, ...options }
    isConfirmDialogVisible.value = true
  }

  const refreshList = () => {
    fetchItems()
    fetchStats()
  }

  const deleteMeetingItem = id => {
    openConfirmDialog({
      title: 'Xóa cuộc họp',
      message: 'Bạn có chắc chắn muốn xóa cuộc họp này không?',
      confirmText: 'Xóa',
      confirmColor: 'error',
      action: async () => {
        await deleteMeeting(id)
        showSuccess('Xóa cuộc họp thành công.')
        refreshList()
      },
    })
  }

  const bulkDeleteMeetings = () => {
    if (!selectedRows.value.length) return
    openConfirmDialog({
      title: 'Xóa danh sách cuộc họp',
      message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} cuộc họp đã chọn không?`,
      confirmText: 'Xóa hết',
      confirmColor: 'error',
      action: async () => {
        // NOTE: backend API bulk destroy not yet available for meetings, stubbing UI.
        showSuccess('Tác vụ xóa nhiều đang cập nhật.')
        selectedRows.value = []
        refreshList()
      },
    })
  }

  const changeMeetingStatusItem = (item, nextStatus) => {
    const statusLabel = meetingStatusOptions.find(o => o.value === nextStatus)?.title || nextStatus

    openConfirmDialog({
      title: 'Đổi trạng thái cuộc họp',
      message: `Bạn có chắc chắn muốn chuyển "${item.title}" sang trạng thái "${statusLabel}" không?`,
      confirmText: 'Đổi trạng thái',
      confirmColor: 'warning',
      action: async () => {
        await changeMeetingStatus(item.id, nextStatus)
        showSuccess('Đổi trạng thái cuộc họp thành công.')
        refreshList()
      },
    })
  }

  const bulkChangeStatus = status => {
    if (!selectedRows.value.length) return
    const statusLabel = statusOptions.find(o => o.value === status)?.title || status

    openConfirmDialog({
      title: 'Cập nhật trạng thái cuộc họp',
      message: `Bạn có chắc chắn muốn chuyển ${selectedRows.value.length} cuộc họp sang trạng thái "${statusLabel}" không?`,
      confirmText: 'Cập nhật',
      confirmColor: 'warning',
      action: async () => {
        // NOTE: backend API bulk status not yet available for meetings, stubbing UI.
        showSuccess('Tác vụ cập nhật trạng thái nhiều đang cập nhật.')
        selectedRows.value = []
        refreshList()
      },
    })
  }

  const executeConfirmedAction = async () => {
    if (!confirmDialog.value.action) return

    isConfirming.value = true
    try {
      await confirmDialog.value.action()
      isConfirmDialogVisible.value = false
    }
    catch (error) {
      showError(error, 'Không thể thực hiện thao tác.')
    }
    finally {
      isConfirming.value = false
    }
  }

  const buildExportParams = () => ({
    search: searchQuery.value || undefined,
    status: selectedStatus.value || undefined,
    meeting_type_id: meetingTypeFilter.value || undefined,
    start_from: fromDate.value || undefined,
    start_to: toDate.value || undefined,
    end_from: endFromDate.value || undefined,
    end_to: endToDate.value || undefined,
    sort_by: sortBy.value || undefined,
    sort_order: orderBy.value || undefined,
    limit: itemsPerPage.value,
    page: page.value,
  })

  const handleExport = async () => {
    if (!ability.can('export', 'Meeting')) return

    isExporting.value = true
    try {
      if (selectedMeetingObjects.value.length) {
        exportRowsToExcel({
          rows: selectedMeetingObjects.value.map(item => ({
            title: item.title || '',
            code: item.code || '',
            meeting_type_name: item.meeting_type_name || item.meeting_type?.name || '',
            start_at: item.start_at || '',
            end_at: item.end_at || '',
            location: item.location || '',
            status: item.status || '',
          })),
          headers: ['title', 'code', 'meeting_type_name', 'start_at', 'end_at', 'location', 'status'],
          sheetName: 'Meetings',
          fileName: `meetings_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [
            { wch: 32 },
            { wch: 18 },
            { wch: 24 },
            { wch: 22 },
            { wch: 22 },
            { wch: 24 },
            { wch: 14 },
          ],
        })

        return
      }

      const response = await exportMeetings(buildExportParams())

      downloadBlob(response, 'danh-sach-cuoc-hop.xlsx')
    }
    catch (error) {
      showError(error, 'Không thể xuất dữ liệu cuộc họp.')
    }
    finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    if (!ability.can('import', 'Meeting')) return

    isImporting.value = true
    try {
      await importMeetings(file)
      showSuccess('Nhập dữ liệu cuộc họp thành công.')
      refreshList()
    }
    catch (error) {
      showError(error, 'Không thể nhập dữ liệu cuộc họp.')
      console.error('Import meetings error:', error)
    }
    finally {
      isImporting.value = false
    }
  }

  const resolveStatusLabel = status => {
    if (status === 'active') return 'Kích hoạt'
    if (status === 'in_progress') return 'Đang họp'
    if (status === 'draft') return 'Nháp'
    if (status === 'completed') return 'Đã kết thúc'
    
    return 'Khác'
  }

  const resolveStatusColor = status => {
    if (status === 'active') return 'info'
    if (status === 'in_progress') return 'warning'
    if (status === 'completed') return 'success'
    
    return 'secondary'
  }

  onMounted(async () => {
    fetchItems()
    fetchStats()
    
    try {
      const response = await fetchMeetingTypes({ limit: 100 })
      const data = response.data?.data || response.data || []

      meetingTypeOptions.value = data.map(item => ({ title: item.name, value: item.id }))
    } catch (error) {
      console.error('Failed to load meeting types', error)
    }
  })

  watch([fromDate, toDate, endFromDate, endToDate], () => {
    if (hasInvalidDateRange.value)
      showSnackbar('Đến ngày phải lớn hơn hoặc bằng Từ ngày.', 'warning')
  })

  watchDebounced([searchQuery, selectedStatus, meetingTypeFilter, fromDate, toDate, endFromDate, endToDate], () => {
    if (hasInvalidDateRange.value) return
    page.value = 1
    fetchItems()
    fetchStats()
  }, { debounce: 500 })

  watch([itemsPerPage, page, sortBy, orderBy], () => {
    fetchItems()
  })

  return {
    ITEMS_PER_PAGE_OPTIONS,
    snackbar,
    searchQuery,
    selectedStatus,
    meetingTypeFilter,
    fromDate,
    toDate,
    endFromDate,
    endToDate,
    itemsPerPage,
    page,
    selectedRows,
    meetings,
    totalMeetings,
    loading,
    widgetData,
    statusOptions,
    meetingStatusOptions,
    bulkStatusOptions,
    meetingTypeOptions,
    headers,
    hasInvalidDateRange,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    updateOptions,
    handleSelectionChange,
    bulkChangeStatus,
    bulkDeleteMeetings,
    handleImport,
    handleExport,
    deleteMeeting: deleteMeetingItem,
    changeMeetingStatus: changeMeetingStatusItem,
    executeConfirmedAction,
    resolveStatusLabel,
    resolveStatusColor,
  }
}
