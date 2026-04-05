import { fetchUserStats, fetchUsers as fetchUsersRequest } from '../services/userService'

export function useUserListFetch(options) {
  const {
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
  } = options

  const resetUsersState = () => {
    users.value = []
    totalUsers.value = 0
  }

  const resetStatsState = () => {
    stats.value = emptyUserStats()
  }

  const buildSharedQueryParams = () => ({
    search: searchQuery.value || undefined,
    status: selectedStatus.value,
    from_date: fromDate.value || undefined,
    to_date: toDate.value || undefined,
    sort_by: sortBy.value || 'created_at',
    sort_order: orderBy.value || 'desc',
  })

  const buildListParams = () => ({
    ...buildSharedQueryParams(),
    limit: itemsPerPage.value,
    page: page.value,
  })

  const buildExportParams = () => ({ ...buildListParams() })

  const fetchUsers = async () => {
    if (hasInvalidDateRange.value) {
      resetUsersState()

      return
    }

    loading.value = true
    try {
      const response = await fetchUsersRequest(buildListParams())

      users.value = response.data ?? []
      totalUsers.value = response.meta?.total ?? response.total ?? 0
    }
    catch (error) {
      console.error('Fetch users error:', error)
      resetUsersState()
    }
    finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    if (hasInvalidDateRange.value) {
      resetStatsState()

      return
    }

    try {
      const response = await fetchUserStats({
        ...buildSharedQueryParams(),
        limit: itemsPerPage.value,
      })

      stats.value = response.data ?? emptyUserStats()
    }
    catch (error) {
      console.error('Fetch user stats error:', error)
      resetStatsState()
    }
  }

  const fetchDependencies = async () => {
    try {
      const [roleResponse, organizationResponse] = await Promise.allSettled([
        $api('/roles?limit=100'),
        $api('/organizations?limit=100'),
      ])

      roles.value = roleResponse.status === 'fulfilled' && roleResponse.value
        ? (roleResponse.value.data?.data || roleResponse.value.data || [])
        : []

      organizations.value = organizationResponse.status === 'fulfilled' && organizationResponse.value
        ? (organizationResponse.value.data?.data || organizationResponse.value.data || [])
        : []
    }
    catch (error) {
      console.error('Fetch user dependencies error:', error)
      roles.value = []
      organizations.value = []
    }
  }

  const refreshList = () => {
    fetchUsers()
    fetchStats()
  }

  return {
    buildSharedQueryParams,
    buildListParams,
    buildExportParams,
    fetchUsers,
    fetchStats,
    fetchDependencies,
    refreshList,
  }
}
