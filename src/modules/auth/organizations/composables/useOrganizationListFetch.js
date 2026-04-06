import { fetchOrganizationStats, fetchOrganizations as fetchOrganizationsRequest } from '../services/organizationService'

const FORBIDDEN_STATUSES = [403]

const setSessionFlag = (key, value) => sessionStorage.setItem(key, value ? '1' : '0')
const isForbiddenError = error => FORBIDDEN_STATUSES.includes(error?.status) || FORBIDDEN_STATUSES.includes(error?.statusCode)

const sortOrganizationsAsTree = items => {
  if (!Array.isArray(items) || !items.length)
    return []

  const groupedByParent = new Map()

  items.forEach(item => {
    const parentKey = item.parent_id == null ? 'root' : String(item.parent_id)

    if (!groupedByParent.has(parentKey))
      groupedByParent.set(parentKey, [])

    groupedByParent.get(parentKey).push(item)
  })

  groupedByParent.forEach(group => {
    group.sort((a, b) => {
      const depthDelta = Number(a.depth || 0) - Number(b.depth || 0)
      if (depthDelta !== 0)
        return depthDelta

      const sortDelta = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      if (sortDelta !== 0)
        return sortDelta

      return Number(a.id || 0) - Number(b.id || 0)
    })
  })

  const flattened = []

  const appendChildren = parentId => {
    const parentKey = parentId == null ? 'root' : String(parentId)
    const children = groupedByParent.get(parentKey) || []

    children.forEach(item => {
      flattened.push(item)
      appendChildren(item.id)
    })
  }

  appendChildren(null)

  return flattened
}

export function useOrganizationListFetch(options) {
  const {
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
  } = options

  const resetOrganizationsState = () => {
    organizations.value = []
    totalOrganizations.value = 0
  }

  const resetStatsState = () => {
    stats.value = emptyOrganizationStats()
  }

  const buildSharedQueryParams = () => ({
    search: searchQuery.value,
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

  const fetchOrganizations = async () => {
    if (hasInvalidDateRange.value) {
      resetOrganizationsState()
      syncSelectedRows()

      return
    }

    if (!canFetchOrganizations.value) {
      resetOrganizationsState()
      syncSelectedRows()

      return
    }

    loading.value = true
    try {
      const response = await fetchOrganizationsRequest(buildListParams())

      organizations.value = sortOrganizationsAsTree(response.data ?? [])
      totalOrganizations.value = response.meta?.total ?? response.total ?? 0
    }
    catch (error) {
      if (isForbiddenError(error)) {
        organizationsListForbidden.value = true
        setSessionFlag(ORGANIZATIONS_LIST_FORBIDDEN_KEY, true)
        resetOrganizationsState()

        return
      }

      console.error('Fetch organizations error:', error)
      resetOrganizationsState()
    }
    finally {
      loading.value = false
      syncSelectedRows()
    }
  }

  const fetchStats = async () => {
    if (hasInvalidDateRange.value) {
      resetStatsState()

      return
    }

    if (!canFetchOrganizationStats.value) {
      resetStatsState()

      return
    }

    try {
      const response = await fetchOrganizationStats({
        ...buildSharedQueryParams(),
        limit: itemsPerPage.value,
      })

      stats.value = response.data ?? emptyOrganizationStats()
    }
    catch (error) {
      if (isForbiddenError(error)) {
        organizationsStatsForbidden.value = true
        setSessionFlag(ORGANIZATIONS_STATS_FORBIDDEN_KEY, true)
        resetStatsState()

        return
      }

      console.error('Fetch organization stats error:', error)
    }
  }

  const refreshList = () => {
    fetchOrganizations()
    fetchStats()
  }

  return {
    buildSharedQueryParams,
    buildListParams,
    buildExportParams,
    fetchOrganizations,
    fetchStats,
    refreshList,
  }
}
