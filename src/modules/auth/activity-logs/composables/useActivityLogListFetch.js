import { fetchActivityLogStats, fetchActivityLogs } from '../services/activityLogService'

export function useActivityLogListFetch({
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
}) {
  const { t } = useI18n()
  const buildListParams = () => ({
    search: searchQuery.value || undefined,
    method_type: selectedMethod.value || undefined,
    status_code: selectedStatus.value || undefined,
    from_date: fromDate.value || undefined,
    to_date: toDate.value || undefined,
    limit: itemsPerPage.value,
    page: page.value,
    sort_by: sortBy.value,
    sort_order: orderBy.value,
  })

  const buildExportParams = () => ({
    search: searchQuery.value || undefined,
    method_type: selectedMethod.value || undefined,
    status_code: selectedStatus.value || undefined,
    from_date: fromDate.value || undefined,
    to_date: toDate.value || undefined,
    sort_by: sortBy.value,
    sort_order: orderBy.value,
    limit: itemsPerPage.value,
  })

  const fetchLogs = async showError => {
    if (!canViewLogList.value) {
      logs.value = []
      totalLogs.value = 0

      return
    }

    if (hasInvalidDateRange.value) {
      logs.value = []
      totalLogs.value = 0

      return
    }

    loading.value = true
    try {
      const response = await fetchActivityLogs(buildListParams())

      logs.value = response.data ?? []
      totalLogs.value = response.meta?.total ?? response.total ?? 0
    }
    catch (error) {
      logs.value = []
      totalLogs.value = 0
      showError(error, t('auth.auth.activity_logs.messages.list_error'))
    }
    finally {
      loading.value = false
    }
  }

  const fetchStats = async showError => {
    if (!canViewLogStats.value) {
      stats.value = { total: 0 }

      return
    }

    if (hasInvalidDateRange.value) {
      stats.value = { total: 0 }

      return
    }

    try {
      const response = await fetchActivityLogStats(buildExportParams())

      stats.value = response.data ?? { total: 0 }
    }
    catch (error) {
      stats.value = { total: 0 }
      showError(error, t('auth.auth.activity_logs.messages.stats_error'))
    }
  }

  const refreshList = async showError => {
    await Promise.all([
      fetchLogs(showError),
      fetchStats(showError),
    ])
  }

  return {
    buildExportParams,
    fetchLogs,
    fetchStats,
    refreshList,
  }
}
