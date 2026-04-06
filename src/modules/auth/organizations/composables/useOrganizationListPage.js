import { onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { useOrganizationListActions } from './useOrganizationListActions'
import { useOrganizationListFetch } from './useOrganizationListFetch'
import { useOrganizationSelection } from './useOrganizationSelection'
import { useOrganizationListState } from './useOrganizationListState'

const INVALID_DATE_RANGE_MESSAGE = 'Den ngay phai lon hon hoac bang tu ngay.'

export function useOrganizationListPage() {
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const {
    ITEMS_PER_PAGE_OPTIONS,
    ORGANIZATIONS_LIST_FORBIDDEN_KEY,
    ORGANIZATIONS_STATS_FORBIDDEN_KEY,
    emptyOrganizationStats,
    searchQuery,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectionSeeds,
    selectedRows,
    organizations,
    totalOrganizations,
    loading,
    stats,
    organizationsListForbidden,
    organizationsStatsForbidden,
    isDialogVisible,
    editingOrganization,
    isReadonlyDrawer,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    statusUpdatingIds,
    confirmDialog,
    canFetchOrganizations,
    canFetchOrganizationStats,
    headers,
    statusOptions,
    widgetData,
    hasInvalidDateRange,
    updateOptions,
    isCurrentOrganization,
    hasInactiveParent,
    isStatusUpdating,
    getTreeIndentStyle,
    getStatusToggleState,
  } = useOrganizationListState()

  const {
    selectedOrganizations,
    bulkStatusOptions,
    syncSelectedRows,
    handleSelectionChange,
  } = useOrganizationSelection({
    organizations,
    selectionSeeds,
    selectedRows,
    statusOptions,
    isCurrentOrganization,
    hasInactiveParent,
  })

  const { buildExportParams, fetchOrganizations, fetchStats, refreshList } = useOrganizationListFetch({
    searchQuery,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    organizations,
    totalOrganizations,
    loading,
    stats,
    organizationsListForbidden,
    organizationsStatsForbidden,
    canFetchOrganizations,
    canFetchOrganizationStats,
    hasInvalidDateRange,
    syncSelectedRows,
    emptyOrganizationStats,
    ORGANIZATIONS_LIST_FORBIDDEN_KEY,
    ORGANIZATIONS_STATS_FORBIDDEN_KEY,
  })

  const {
    openAddDialog,
    openEditDialog,
    openDetailDialog,
    executeConfirmedAction,
    deleteOrganization,
    onSaved,
    bulkDeleteOrgs,
    bulkChangeStatus,
    changeOrganizationStatus,
    handleImport,
    handleExport,
  } = useOrganizationListActions({
    showSnackbar,
    showSuccess,
    showError,
    selectedRows,
    selectionSeeds,
    selectedOrganizations,
    statusOptions,
    isDialogVisible,
    editingOrganization,
    isReadonlyDrawer,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    statusUpdatingIds,
    confirmDialog,
    isCurrentOrganization,
    hasInactiveParent,
    refreshList,
    buildExportParams,
  })

  watch([fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      showSnackbar(INVALID_DATE_RANGE_MESSAGE, 'warning')
  })

  watchDebounced([searchQuery, selectedStatus, fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      return

    page.value = 1
    fetchOrganizations()
    fetchStats()
  }, { debounce: 500 })

  watch([itemsPerPage, page, sortBy, orderBy], () => {
    fetchOrganizations()
  })

  watch(organizations, () => {
    syncSelectedRows()
  })

  onMounted(() => {
    fetchOrganizations()
    fetchStats()
  })

  return {
    ITEMS_PER_PAGE_OPTIONS,
    snackbar,
    searchQuery,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    selectedRows,
    organizations,
    totalOrganizations,
    loading,
    widgetData,
    statusOptions,
    bulkStatusOptions,
    headers,
    hasInvalidDateRange,
    isDialogVisible,
    editingOrganization,
    isReadonlyDrawer,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    getTreeIndentStyle,
    getStatusToggleState,
    isStatusUpdating,
    updateOptions,
    handleSelectionChange,
    bulkChangeStatus,
    bulkDeleteOrgs,
    handleImport,
    handleExport,
    openAddDialog,
    openEditDialog,
    openDetailDialog,
    deleteOrganization,
    changeOrganizationStatus,
    onSaved,
    executeConfirmedAction,
  }
}
