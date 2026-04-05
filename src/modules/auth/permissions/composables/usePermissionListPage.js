import { onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { downloadPermissionTemplate } from '../services/permissionService'
import { usePermissionListActions } from './usePermissionListActions'
import { usePermissionListFetch } from './usePermissionListFetch'
import { usePermissionListState } from './usePermissionListState'

const INVALID_DATE_RANGE_MESSAGE = 'Den ngay phai lon hon hoac bang tu ngay.'

export function usePermissionListPage() {
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const {
    ITEMS_PER_PAGE_OPTIONS,
    emptyPermissionStats,
    searchQuery,
    fromDate,
    toDate,
    page,
    itemsPerPage,
    sortBy,
    orderBy,
    permissions,
    totalItems,
    loading,
    isExporting,
    isImporting,
    selectedRows,
    stats,
    permissionTree,
    permissionItem,
    isDialogVisible,
    detailPermissionItem,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    headers,
    widgetData,
    parentOptions,
    hasInvalidDateRange,
    updateOptions,
    isGroupRow,
    getGroupName,
    getDisplayName,
  } = usePermissionListState()

  const { buildExportParams, fetchStats, fetchPermissions, fetchTree, refreshList } = usePermissionListFetch({
    searchQuery,
    fromDate,
    toDate,
    page,
    itemsPerPage,
    sortBy,
    orderBy,
    permissions,
    totalItems,
    loading,
    stats,
    permissionTree,
    hasInvalidDateRange,
    emptyPermissionStats,
  })

  const {
    openCreateDialog,
    openEditDialog,
    openDetailDialog,
    onSaved,
    executeConfirmedAction,
    deletePermission,
    bulkDeletePermissions,
    handleExport,
    handleImport,
  } = usePermissionListActions({
    showSuccess,
    showError,
    selectedRows,
    permissions,
    isDialogVisible,
    permissionItem,
    isDetailDialogVisible,
    detailPermissionItem,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    isExporting,
    isImporting,
    refreshList,
    buildExportParams,
    getDisplayName,
  })

  const handleSelectionChange = nextSelectedIds => {
    selectedRows.value = (nextSelectedIds || []).map(id => Number(id))
  }

  watch([fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      showSnackbar(INVALID_DATE_RANGE_MESSAGE, 'warning')
  })

  watchDebounced([searchQuery, fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      return

    page.value = 1
    refreshList()
  }, { debounce: 500 })

  watch([page, itemsPerPage, sortBy, orderBy], () => {
    fetchPermissions()
  })

  onMounted(() => {
    refreshList()
  })

  return {
    ITEMS_PER_PAGE_OPTIONS,
    snackbar,
    searchQuery,
    fromDate,
    toDate,
    page,
    itemsPerPage,
    permissions,
    totalItems,
    loading,
    isExporting,
    isImporting,
    selectedRows,
    permissionItem,
    isDialogVisible,
    detailPermissionItem,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    headers,
    widgetData,
    parentOptions,
    hasInvalidDateRange,
    isGroupRow,
    getGroupName,
    getDisplayName,
    updateOptions,
    handleSelectionChange,
    openCreateDialog,
    openEditDialog,
    openDetailDialog,
    onSaved,
    executeConfirmedAction,
    deletePermission,
    bulkDeletePermissions,
    handleExport,
    handleImport,
    downloadPermissionTemplate,
  }
}
