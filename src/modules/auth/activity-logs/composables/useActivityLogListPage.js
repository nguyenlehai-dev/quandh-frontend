import { computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { ability } from '@/plugins/casl/ability'
import { useActivityLogListActions } from './useActivityLogListActions'
import { useActivityLogListFetch } from './useActivityLogListFetch'
import { useActivityLogListState } from './useActivityLogListState'

export function useActivityLogListPage() {
  const { t } = useI18n()
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const {
    ITEMS_PER_PAGE_OPTIONS,
    searchQuery,
    selectedMethod,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    logs,
    totalLogs,
    loading,
    isExporting,
    stats,
    detailLoading,
    selectedLogDetail,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    isDeleteByDateDialogVisible,
    isDeleteByDateSubmitting,
    deleteByDateForm,
    confirmDialog,
    headers,
    widgetData,
    methodOptions,
    statusOptions,
    hasInvalidDateRange,
    updateOptions,
  } = useActivityLogListState()

  const canViewLogList = computed(() => ability.can('read', 'LogActivity'))
  const canViewLogStats = computed(() => ability.can('stats', 'LogActivity'))
  const canExportLogs = computed(() => ability.can('export', 'LogActivity'))
  const canViewLogDetail = computed(() => ability.can('show', 'LogActivity') || canViewLogList.value)
  const canDeleteLog = computed(() => ability.can('delete', 'LogActivity') || ability.can('bulkDestroy', 'LogActivity'))
  const canBulkDeleteLogs = computed(() => ability.can('bulkDestroy', 'LogActivity'))
  const canManageLogCleanup = computed(() => canBulkDeleteLogs.value || canDeleteLog.value)

  const { buildExportParams, fetchLogs, fetchStats, refreshList } = useActivityLogListFetch({
    canViewLogList,
    canViewLogStats,
    searchQuery,
    selectedMethod,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    logs,
    totalLogs,
    loading,
    stats,
    hasInvalidDateRange,
  })

  const {
    executeConfirmedAction,
    openDetailDialog,
    handleDeleteLog,
    handleBulkDelete,
    openDeleteByDateDialog,
    submitDeleteByDate,
    handleClearAll,
    handleExport,
  } = useActivityLogListActions({
    showSuccess,
    showError,
    logs,
    selectedRows,
    detailLoading,
    selectedLogDetail,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    isDeleteByDateDialogVisible,
    isDeleteByDateSubmitting,
    deleteByDateForm,
    isExporting,
    confirmDialog,
    refreshList,
    buildExportParams,
  })

  const resetFilters = () => {
    searchQuery.value = ''
    selectedMethod.value = null
    selectedStatus.value = null
    fromDate.value = ''
    toDate.value = ''
    page.value = 1
  }

  const handleSelectionChange = rows => {
    selectedRows.value = rows
  }

  watch([fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      showSnackbar(t('auth.auth.activity_logs.toolbar.invalid_date_range'), 'warning')
  })

  watchDebounced([searchQuery, selectedMethod, selectedStatus, fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      return

    page.value = 1
    refreshList(showError)
  }, { debounce: 500 })

  watch([itemsPerPage, page, sortBy, orderBy], () => {
    fetchLogs(showError)
  })

  onMounted(() => {
    if (canViewLogList.value || canViewLogStats.value)
      refreshList(showError)
  })

  return {
    ITEMS_PER_PAGE_OPTIONS,
    snackbar,
    searchQuery,
    selectedMethod,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    selectedRows,
    logs,
    totalLogs,
    loading,
    isExporting,
    widgetData,
    headers,
    methodOptions,
    statusOptions,
    hasInvalidDateRange,
    canExportLogs,
    canViewLogDetail,
    canDeleteLog,
    canBulkDeleteLogs,
    canManageLogCleanup,
    detailLoading,
    selectedLogDetail,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    isDeleteByDateDialogVisible,
    isDeleteByDateSubmitting,
    deleteByDateForm,
    confirmDialog,
    updateOptions,
    resetFilters,
    handleSelectionChange,
    openDetailDialog,
    handleDeleteLog,
    handleBulkDelete,
    openDeleteByDateDialog,
    submitDeleteByDate,
    handleClearAll,
    handleExport,
    executeConfirmedAction,
  }
}
