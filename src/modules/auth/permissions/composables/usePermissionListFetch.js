import {
  fetchPermissionStats,
  fetchPermissionTree,
  fetchPermissions as fetchPermissionsRequest,
} from '../services/permissionService'

export function usePermissionListFetch(options) {
  const {
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
  } = options

  const buildSharedQueryParams = () => ({
    search: searchQuery.value || undefined,
    from_date: fromDate.value || undefined,
    to_date: toDate.value || undefined,
    sort_by: sortBy.value || 'sort_order',
    sort_order: orderBy.value || 'asc',
  })

  const buildListParams = () => ({
    ...buildSharedQueryParams(),
    limit: itemsPerPage.value,
    page: page.value,
  })

  const buildExportParams = () => ({ ...buildListParams() })

  const fetchStats = async () => {
    if (hasInvalidDateRange.value) {
      stats.value = emptyPermissionStats()

      return
    }

    try {
      const response = await fetchPermissionStats(buildSharedQueryParams())

      stats.value = response.data ?? emptyPermissionStats()
    }
    catch (error) {
      console.error('Fetch permission stats error:', error)
      stats.value = emptyPermissionStats()
    }
  }

  const fetchPermissions = async () => {
    if (hasInvalidDateRange.value) {
      permissions.value = []
      totalItems.value = 0

      return
    }

    loading.value = true
    try {
      const response = await fetchPermissionsRequest(buildListParams())

      permissions.value = response.data ?? []
      totalItems.value = response.meta?.total ?? response.total ?? 0
    }
    catch (error) {
      console.error('Fetch permissions error:', error)
      permissions.value = []
      totalItems.value = 0
    }
    finally {
      loading.value = false
    }
  }

  const fetchTree = async () => {
    try {
      const response = await fetchPermissionTree()

      permissionTree.value = response.data ?? []
    }
    catch (error) {
      console.error('Fetch permission tree error:', error)
      permissionTree.value = []
    }
  }

  const refreshList = async () => {
    await Promise.all([
      fetchPermissions(),
      fetchStats(),
      fetchTree(),
    ])
  }

  return {
    buildSharedQueryParams,
    buildListParams,
    buildExportParams,
    fetchStats,
    fetchPermissions,
    fetchTree,
    refreshList,
  }
}
