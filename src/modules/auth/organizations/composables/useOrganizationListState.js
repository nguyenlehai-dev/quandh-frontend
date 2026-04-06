import { computed, ref } from 'vue'
import { useCookie } from '@/@core/composable/useCookie'
import { ability } from '@/plugins/casl/ability'

const DEFAULT_STATS = Object.freeze({ total: 0, active: 0, inactive: 0 })
const ITEMS_PER_PAGE_OPTIONS = Object.freeze([5, 10, 20, 50, 100])
const ORGANIZATIONS_LIST_FORBIDDEN_KEY = 'organizationsListForbidden'
const ORGANIZATIONS_STATS_FORBIDDEN_KEY = 'organizationsStatsForbidden'
const STATUS_TOGGLE_ICONS = Object.freeze({
  active: 'tabler-toggle-right',
  inactive: 'tabler-toggle-left',
})
const STATUS_TOGGLE_MESSAGES = Object.freeze({
  noPermission: 'Ban khong co quyen cap nhat trang thai.',
  inactiveParent: 'To chuc con dang phu thuoc to chuc cha ngung hoat dong.',
  currentOrganizationInactive: 'Khong the chuyen to chuc dang lam viec hien tai sang ngung hoat dong.',
})

const getSessionFlag = key => sessionStorage.getItem(key) === '1'
const emptyOrganizationStats = () => ({ ...DEFAULT_STATS })

export function useOrganizationListState() {
  const { t } = useI18n()

  const searchQuery = ref('')
  const selectedStatus = ref(null)
  const fromDate = ref('')
  const toDate = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref('created_at')
  const orderBy = ref('desc')
  const selectionSeeds = ref([])
  const selectedRows = ref([])

  const organizations = ref([])
  const totalOrganizations = ref(0)
  const loading = ref(false)
  const stats = ref(emptyOrganizationStats())
  const organizationsListForbidden = ref(getSessionFlag(ORGANIZATIONS_LIST_FORBIDDEN_KEY))
  const organizationsStatsForbidden = ref(getSessionFlag(ORGANIZATIONS_STATS_FORBIDDEN_KEY))

  const isDialogVisible = ref(false)
  const editingOrganization = ref(null)
  const isReadonlyDrawer = ref(false)
  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const isExporting = ref(false)
  const isImporting = ref(false)
  const statusUpdatingIds = ref([])

  const confirmDialog = ref({
    title: '',
    message: '',
    confirmText: 'Xac nhan',
    confirmColor: 'primary',
    action: null,
  })

  const currentOrganizationId = computed(() => Number(useCookie('currentOrganizationId').value) || null)
  const canFetchOrganizations = computed(() => ability.can('read', 'Organization') && !organizationsListForbidden.value)
  const canFetchOrganizationStats = computed(() => ability.can('stats', 'Organization') && !organizationsStatsForbidden.value)

  const headers = computed(() => [
    { title: t('organizations.organizations.headers.index'), key: 'index', sortable: false, width: '70px', align: 'center' },
    { title: t('organizations.organizations.headers.name'), key: 'name' },
    { title: t('organizations.organizations.headers.parent'), key: 'parent' },
    { title: t('organizations.organizations.headers.status'), key: 'status', sortable: false, width: '140px', align: 'center' },
    { title: t('organizations.organizations.headers.created_at'), key: 'created_at', sortable: false, width: '180px', align: 'center' },
    { title: t('organizations.organizations.headers.updated_at'), key: 'updated_at', sortable: false, width: '180px', align: 'center' },
    { title: t('organizations.organizations.headers.actions'), key: 'actions', sortable: false, align: 'center', width: '180px' },
  ])

  const statusOptions = computed(() => [
    { key: 'common.common.labels.all', value: null },
    { key: 'organizations.organizations.status.active', value: 'active' },
    { key: 'organizations.organizations.status.inactive', value: 'inactive' },
  ].map(item => ({
    title: t(item.key),
    value: item.value,
  })))

  const widgetData = computed(() => [
    { title: t('organizations.organizations.widgets.total'), value: stats.value.total ?? 0, icon: 'tabler-building', iconColor: 'primary' },
    { title: t('organizations.organizations.widgets.active'), value: stats.value.active ?? 0, icon: 'tabler-building-community', iconColor: 'success' },
    { title: t('organizations.organizations.widgets.inactive'), value: stats.value.inactive ?? 0, icon: 'tabler-building-skyscraper', iconColor: 'warning' },
  ])

  const hasInvalidDateRange = computed(() => !!(fromDate.value && toDate.value && toDate.value < fromDate.value))

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key || sortBy.value
    orderBy.value = options.sortBy[0]?.order || orderBy.value
  }

  const isCurrentOrganization = organizationId => Number(organizationId) === currentOrganizationId.value
  const hasInactiveParent = item => item?.parent?.status === 'inactive'
  const isStatusUpdating = organizationId => statusUpdatingIds.value.includes(Number(organizationId))

  const getStatusToggleState = item => {
    if (!ability.can('update', 'Organization')) {
      return {
        disabled: true,
        icon: item?.status === 'active' ? STATUS_TOGGLE_ICONS.active : STATUS_TOGGLE_ICONS.inactive,
        color: item?.status === 'active' ? 'success' : 'error',
        title: STATUS_TOGGLE_MESSAGES.noPermission,
      }
    }

    if (hasInactiveParent(item)) {
      return {
        disabled: true,
        icon: STATUS_TOGGLE_ICONS.inactive,
        color: 'warning',
        title: STATUS_TOGGLE_MESSAGES.inactiveParent,
      }
    }

    if (item?.status === 'active' && isCurrentOrganization(item.id)) {
      return {
        disabled: true,
        icon: STATUS_TOGGLE_ICONS.active,
        color: 'success',
        title: STATUS_TOGGLE_MESSAGES.currentOrganizationInactive,
      }
    }

    return {
      disabled: false,
      icon: item?.status === 'active' ? STATUS_TOGGLE_ICONS.active : STATUS_TOGGLE_ICONS.inactive,
      color: item?.status === 'active' ? 'success' : 'error',
      title: item?.status === 'active'
        ? `Bam de chuyen sang ${t('organizations.organizations.status.inactive').toLowerCase()}.`
        : `Bam de chuyen sang ${t('organizations.organizations.status.active').toLowerCase()}.`,
    }
  }

  const getTreeIndentStyle = item => {
    const depth = Number(item?.depth || 0)

    return {
      paddingInlineStart: `${depth * 24}px`,
    }
  }

  return {
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
    getStatusToggleState,
    getTreeIndentStyle,
  }
}
