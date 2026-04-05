import { computed } from 'vue'

export function useUserSelection(options) {
  const {
    users,
    selectedRows,
    statusActionOptions,
    normalizeUserStatus,
  } = options

  const selectedUsers = computed(() => users.value.filter(item => selectedRows.value.includes(item.id)))

  const bulkStatusOptions = computed(() => {
    if (!selectedUsers.value.length)
      return []

    return statusActionOptions.value.filter(option => selectedUsers.value.some(item => normalizeUserStatus(item.status) !== option.value))
  })

  const handleSelectionChange = nextSelectedIds => {
    selectedRows.value = (nextSelectedIds || []).map(id => Number(id))
  }

  return {
    selectedUsers,
    bulkStatusOptions,
    handleSelectionChange,
  }
}
