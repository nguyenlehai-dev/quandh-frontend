import { onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { downloadUserImportTemplate } from '../services/userService'
import { useUserListActions } from './useUserListActions'
import { useUserListFetch } from './useUserListFetch'
import { useUserListState } from './useUserListState'
import { useUserSelection } from './useUserSelection'

export function useUserListPage() {
  const { t } = useI18n()
  const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

  const {
    ITEMS_PER_PAGE_OPTIONS,
    emptyUserStats,
    searchQuery,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    users,
    totalUsers,
    loading,
    stats,
    roles,
    organizations,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    headers,
    statusOptions,
    statusActionOptions,
    widgetData,
    hasInvalidDateRange,
    updateOptions,
    normalizeUserStatus,
    resolveUserStatusVariant,
    resolveStatusText,
    getRoleName,
    getOrgName,
  } = useUserListState()

  const {
    selectedUsers,
    bulkStatusOptions,
    handleSelectionChange,
  } = useUserSelection({
    users,
    selectedRows,
    statusActionOptions,
    normalizeUserStatus,
  })

  const { buildExportParams, fetchUsers, fetchStats, fetchDependencies, refreshList } = useUserListFetch({
    searchQuery,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    users,
    totalUsers,
    loading,
    stats,
    roles,
    organizations,
    hasInvalidDateRange,
    emptyUserStats,
  })

  const {
    openCreateUserPage,
    openEditUserPage,
    openDetailUserPage,
    executeConfirmedAction,
    deleteUser,
    bulkDeleteUsers,
    bulkChangeStatus,
    changeUserStatus,
    handleExport,
    handleImport,
  } = useUserListActions({
    showSuccess,
    showError,
    selectedRows,
    selectedUsers,
    statusActionOptions,
    getRoleName,
    getOrgName,
    normalizeUserStatus,
    resolveStatusText,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    refreshList,
    buildExportParams,
  })

  watch([fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      showSnackbar(t('user.user.list.messages.invalid_date_range'), 'warning')
  })

  watchDebounced([searchQuery, selectedStatus, fromDate, toDate], () => {
    if (hasInvalidDateRange.value)
      return

    page.value = 1
    fetchUsers()
    fetchStats()
  }, { debounce: 500 })

  watch([itemsPerPage, page, sortBy, orderBy], () => {
    fetchUsers()
  })

  onMounted(() => {
    fetchUsers()
    fetchStats()
    fetchDependencies()
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
    users,
    totalUsers,
    loading,
    widgetData,
    statusOptions,
    statusActionOptions,
    bulkStatusOptions,
    headers,
    hasInvalidDateRange,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    normalizeUserStatus,
    resolveUserStatusVariant,
    resolveStatusText,
    getRoleName,
    getOrgName,
    updateOptions,
    handleSelectionChange,
    bulkChangeStatus,
    bulkDeleteUsers,
    handleImport,
    handleExport,
    openCreateUserPage,
    openEditUserPage,
    openDetailUserPage,
    deleteUser,
    changeUserStatus,
    executeConfirmedAction,
    downloadUserImportTemplate,
  }
}
