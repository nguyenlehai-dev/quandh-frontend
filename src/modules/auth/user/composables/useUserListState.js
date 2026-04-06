import { computed, ref } from 'vue'

const DEFAULT_STATS = Object.freeze({ total: 0, active: 0, inactive: 0 })
const ITEMS_PER_PAGE_OPTIONS = Object.freeze([5, 10, 20, 50, 100])
const STATUS_VARIANTS = Object.freeze({
  active: 'success',
  inactive: 'warning',
  banned: 'error',
  default: 'primary',
})

const emptyUserStats = () => ({ ...DEFAULT_STATS })

export function useUserListState() {
  const { t } = useI18n()

  const searchQuery = ref('')
  const selectedStatus = ref(null)
  const fromDate = ref('')
  const toDate = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref('created_at')
  const orderBy = ref('desc')
  const selectedRows = ref([])

  const users = ref([])
  const totalUsers = ref(0)
  const loading = ref(false)
  const stats = ref(emptyUserStats())
  const roles = ref([])
  const organizations = ref([])

  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const isExporting = ref(false)
  const isImporting = ref(false)

  const confirmDialog = ref({
    title: '',
    message: '',
    confirmText: t('common.common.actions.confirm'),
    confirmColor: 'primary',
    action: null,
  })

  const headers = computed(() => [
    { title: t('user.user.headers.index'), key: 'index', sortable: false, width: '70px', align: 'center' },
    { title: t('user.user.headers.name'), key: 'name' },
    { title: t('user.user.headers.email'), key: 'email' },
    { title: t('user.user.headers.roles'), key: 'roles', sortable: false },
    { title: t('user.user.headers.status'), key: 'status', sortable: false, width: '140px', align: 'center' },
    { title: t('user.user.headers.created_at'), key: 'created_at', sortable: false, width: '180px', align: 'center' },
    { title: t('user.user.headers.updated_at'), key: 'updated_at', sortable: false, width: '180px', align: 'center' },
    { title: t('user.user.headers.actions'), key: 'actions', sortable: false, align: 'center', width: '180px' },
  ])

  const statusFilterOptions = computed(() => [
    { key: 'common.common.labels.all', value: null },
    { key: 'user.user.status.active', value: 'active' },
    { key: 'user.user.status.inactive', value: 'inactive' },
    { key: 'user.user.status.banned', value: 'banned' },
  ].map(item => ({
    title: t(item.key),
    value: item.value,
  })))

  const statusActionOptions = computed(() => statusFilterOptions.value.filter(item => item.value !== null))

  const widgetData = computed(() => [
    { title: t('user.user.widgets.total_title'), value: stats.value.total ?? 0, icon: 'tabler-users', iconColor: 'info' },
    { title: t('user.user.widgets.active_title'), value: stats.value.active ?? 0, icon: 'tabler-user-check', iconColor: 'success' },
    { title: t('user.user.widgets.inactive_title'), value: stats.value.inactive ?? 0, icon: 'tabler-user-x', iconColor: 'error' },
  ])

  const hasInvalidDateRange = computed(() => !!(fromDate.value && toDate.value && toDate.value < fromDate.value))

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key || sortBy.value
    orderBy.value = options.sortBy[0]?.order || orderBy.value
  }

  const normalizeUserStatus = stat => {
    const normalized = `${stat || ''}`.toLowerCase()

    if (normalized === 'active') return 'active'
    if (normalized === 'banned') return 'banned'

    return 'inactive'
  }

  const resolveUserStatusVariant = stat => STATUS_VARIANTS[normalizeUserStatus(stat)] || STATUS_VARIANTS.default

  const resolveStatusText = stat => {
    const found = statusActionOptions.value.find(item => item.value === normalizeUserStatus(stat))

    return found ? found.title : stat
  }

  const getRoleName = roleId => {
    const role = roles.value.find(item => item.id === roleId)

    return role ? role.name : roleId
  }

  const getOrgName = orgId => {
    const organization = organizations.value.find(item => item.id === orgId)

    return organization ? organization.name : orgId
  }

  return {
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
    statusOptions: statusFilterOptions,
    statusActionOptions,
    widgetData,
    hasInvalidDateRange,
    updateOptions,
    normalizeUserStatus,
    resolveUserStatusVariant,
    resolveStatusText,
    getRoleName,
    getOrgName,
  }
}
