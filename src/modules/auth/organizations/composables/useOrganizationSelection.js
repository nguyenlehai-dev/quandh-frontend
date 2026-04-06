import { computed } from 'vue'

export function useOrganizationSelection(options) {
  const {
    organizations,
    selectionSeeds,
    selectedRows,
    statusOptions,
    isCurrentOrganization,
    hasInactiveParent,
  } = options

  const selectedOrganizations = computed(() => organizations.value.filter(item => selectedRows.value.includes(item.id)))

  const organizationById = computed(() => {
    const map = new Map()

    organizations.value.forEach(item => {
      map.set(Number(item.id), item)
    })

    return map
  })

  const childIdsByParentId = computed(() => {
    const map = new Map()

    organizations.value.forEach(item => {
      const parentId = item.parent_id == null ? null : Number(item.parent_id)
      if (!map.has(parentId))
        map.set(parentId, [])

      map.get(parentId).push(Number(item.id))
    })

    return map
  })

  const bulkStatusOptions = computed(() => {
    if (!selectedOrganizations.value.length)
      return []

    return statusOptions.value.filter(option => {
      const candidateOrganizations = option.value === 'inactive'
        ? selectedOrganizations.value.filter(item => !isCurrentOrganization(item.id))
        : selectedOrganizations.value

      if (!candidateOrganizations.length)
        return false

      return candidateOrganizations.some(item => !hasInactiveParent(item) && item.status !== option.value)
    })
  })

  const getAncestorIds = organizationId => {
    const ancestorIds = []
    let currentId = Number(organizationId)

    while (organizationById.value.has(currentId)) {
      const currentOrganization = organizationById.value.get(currentId)
      const parentId = currentOrganization?.parent_id == null ? null : Number(currentOrganization.parent_id)

      if (parentId == null || !organizationById.value.has(parentId))
        break

      ancestorIds.push(parentId)
      currentId = parentId
    }

    return ancestorIds
  }

  const getDescendantIds = organizationId => {
    const descendantIds = []
    const stack = [...(childIdsByParentId.value.get(Number(organizationId)) || [])]

    while (stack.length) {
      const childId = stack.pop()

      descendantIds.push(childId)

      const nestedChildIds = childIdsByParentId.value.get(childId) || []

      nestedChildIds.forEach(nestedChildId => stack.push(nestedChildId))
    }

    return descendantIds
  }

  const resolveSelectedRowsFromSeeds = seedIds => {
    const selectedIdSet = new Set()

    seedIds
      .map(id => Number(id))
      .filter(id => organizationById.value.has(id))
      .forEach(id => {
        selectedIdSet.add(id)
        getAncestorIds(id).forEach(ancestorId => selectedIdSet.add(ancestorId))
        getDescendantIds(id).forEach(descendantId => selectedIdSet.add(descendantId))
      })

    return organizations.value
      .map(item => Number(item.id))
      .filter(id => selectedIdSet.has(id))
  }

  const syncSelectedRows = () => {
    selectionSeeds.value = selectionSeeds.value
      .map(id => Number(id))
      .filter(id => organizationById.value.has(id))

    selectedRows.value = resolveSelectedRowsFromSeeds(selectionSeeds.value)
  }

  const handleSelectionChange = nextSelectedIds => {
    const nextIds = (nextSelectedIds || []).map(id => Number(id))
    const currentSelectedSet = new Set(selectedRows.value.map(id => Number(id)))
    const nextSelectedSet = new Set(nextIds)
    const seedSet = new Set(selectionSeeds.value.map(id => Number(id)))

    const addedIds = nextIds.filter(id => !currentSelectedSet.has(id))
    const removedIds = [...currentSelectedSet].filter(id => !nextSelectedSet.has(id))

    addedIds.forEach(id => {
      if (organizationById.value.has(id))
        seedSet.add(id)
    })

    removedIds.forEach(id => {
      seedSet.delete(id)
      getAncestorIds(id).forEach(ancestorId => seedSet.delete(ancestorId))
      getDescendantIds(id).forEach(descendantId => seedSet.delete(descendantId))
    })

    selectionSeeds.value = [...seedSet]
    selectedRows.value = resolveSelectedRowsFromSeeds(selectionSeeds.value)
  }

  const clearSelectedOrganizations = () => {
    selectionSeeds.value = []
    selectedRows.value = []
  }

  return {
    selectedOrganizations,
    bulkStatusOptions,
    syncSelectedRows,
    handleSelectionChange,
    clearSelectedOrganizations,
  }
}
