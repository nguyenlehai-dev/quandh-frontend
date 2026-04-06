import { computed, ref } from 'vue'

const DEFAULT_STATS = Object.freeze({ total: 0 })
const ITEMS_PER_PAGE_OPTIONS = Object.freeze([5, 10, 20, 50, 100])

const permissionGroupLabelMap = Object.freeze({
  users: 'Người dùng',
  roles: 'Vai trò',
  organizations: 'Tổ chức',
  permissions: 'Quyền hạn',
  settings: 'Cấu hình hệ thống',
  'log-activities': 'Nhật ký hoạt động',
  posts: 'Tin tức',
  meetings: 'Cuộc họp',
  'meeting-participants': 'Thành phần họp',
  'meeting-agendas': 'Chương trình họp',
  'meeting-documents': 'Tài liệu họp',
  'meeting-conclusions': 'Kết luận họp',
  'meeting-speech-requests': 'Đăng ký phát biểu',
  'meeting-votings': 'Biểu quyết họp',
  'meeting-personal-notes': 'Ghi chú cá nhân',
  'meeting-reminders': 'Nhắc lịch họp',
  'meeting-types': 'Loại cuộc họp',
  'attendee-groups': 'Nhóm thành phần tham dự',
  'attendee-group-members': 'Thành viên nhóm thành phần',
  'meeting-document-types': 'Loại tài liệu họp',
  'meeting-document-fields': 'Lĩnh vực tài liệu họp',
  'my-meetings': 'Lịch họp của tôi',
})

const permissionActionLabelMap = Object.freeze({
  index: 'Xem danh sách',
  show: 'Xem chi tiết',
  store: 'Tạo mới',
  update: 'Cập nhật',
  destroy: 'Xóa',
  stats: 'Xem thống kê',
  import: 'Nhập dữ liệu',
  export: 'Xuất dữ liệu',
  tree: 'Xem cây quyền',
  dashboard: 'Xem bảng điều khiển',
  'live-control': 'Điều hành trực tiếp',
  'bulk-destroy': 'Xóa hàng loạt',
  'bulk-update-status': 'Cập nhật trạng thái hàng loạt',
  'set-active': 'Đặt nội dung đang diễn ra',
  approve: 'Duyệt',
  reject: 'Từ chối',
  vote: 'Bỏ phiếu',
  open: 'Mở',
  close: 'Đóng',
  'qr-checkin': 'Điểm danh QR',
  'self-checkin': 'Tự điểm danh',
  checkin: 'Điểm danh',
  reorder: 'Sắp xếp lại',
  results: 'Xem kết quả',
  'change-status': 'Đổi trạng thái',
  'speech-request': 'Đăng ký phát biểu',
  note: 'Ghi chú cá nhân',
})

const emptyPermissionStats = () => ({ ...DEFAULT_STATS })

const humanizePermissionPart = value => {
  const normalized = String(value || '').trim()
  if (!normalized)
    return ''

  return normalized
    .split(/[-_.]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const countTreeNodes = nodes => (nodes || []).reduce((count, node) => count + 1 + countTreeNodes(node.children || []), 0)

export function usePermissionListState() {
  const { t } = useI18n()

  const searchQuery = ref('')
  const fromDate = ref('')
  const toDate = ref('')
  const page = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref('sort_order')
  const orderBy = ref('asc')
  const permissions = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isExporting = ref(false)
  const isImporting = ref(false)
  const selectedRows = ref([])
  const stats = ref(emptyPermissionStats())
  const permissionTree = ref([])
  const permissionItem = ref(null)
  const isDialogVisible = ref(false)
  const detailPermissionItem = ref(null)
  const isDetailDialogVisible = ref(false)
  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })

  const headers = computed(() => [
    { title: t('permissions.permissions.headers.index'), key: 'index', sortable: false, width: '70px', align: 'center' },
    { title: t('permissions.permissions.headers.name'), key: 'name' },
    { title: t('permissions.permissions.headers.group'), key: 'group', sortable: false },
    { title: t('permissions.permissions.headers.guard_name'), key: 'guard_name', sortable: false, width: '120px', align: 'center' },
    { title: t('permissions.permissions.headers.description'), key: 'description', sortable: false },
    { title: t('permissions.permissions.headers.sort_order'), key: 'sort_order', sortable: false, width: '110px', align: 'center' },
    { title: t('permissions.permissions.headers.created_at'), key: 'created_at', sortable: false, width: '180px', align: 'center' },
    { title: t('permissions.permissions.headers.updated_at'), key: 'updated_at', sortable: false, width: '180px', align: 'center' },
    { title: t('permissions.permissions.headers.actions'), key: 'actions', sortable: false, width: '180px', align: 'center' },
  ])

  const rootGroupCount = computed(() => (permissionTree.value || []).length)
  const hasInvalidDateRange = computed(() => !!(fromDate.value && toDate.value && toDate.value < fromDate.value))

  const widgetData = computed(() => [
    {
      title: t('permissions.permissions.page.permissions_count'),
      value: stats.value.total ?? 0,
      subtitle: t('permissions.permissions.page.permissions_total'),
      icon: 'tabler-key',
      iconColor: 'warning',
    },
    {
      title: t('permissions.permissions.page.groups_count'),
      value: rootGroupCount.value,
      subtitle: t('permissions.permissions.page.groups_total'),
      icon: 'tabler-category',
      iconColor: 'info',
    },
  ])

  const getPermissionGroupLabel = groupName => permissionGroupLabelMap[groupName] || humanizePermissionPart(groupName)

  const getPermissionDisplayLabel = permissionName => {
    if (!permissionName)
      return ''

    if (permissionName.startsWith('group:'))
      return getPermissionGroupLabel(permissionName.replace('group:', ''))

    const [groupName = permissionName, actionName = ''] = permissionName.split('.')
    const groupLabel = getPermissionGroupLabel(groupName)
    const actionLabel = permissionActionLabelMap[actionName] || humanizePermissionPart(actionName)

    return actionName ? `${actionLabel} ${groupLabel}`.trim() : groupLabel
  }

  const parentOptions = computed(() => {
    const options = []

    const appendNodes = (nodes, level = 0) => {
      nodes.forEach(node => {
        options.push({
          title: `${'-- '.repeat(level)}${getPermissionDisplayLabel(node.name)}`,
          value: node.id,
        })
        appendNodes(node.children || [], level + 1)
      })
    }

    appendNodes(permissionTree.value)

    return options
  })

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key || 'sort_order'
    orderBy.value = options.sortBy[0]?.order || 'asc'
  }

  const isGroupRow = item => item.name?.startsWith('group:')

  const getGroupName = item => {
    if (isGroupRow(item))
      return t('permissions.permissions.page.dash')

    if (item.parent?.name)
      return getPermissionGroupLabel(item.parent.name.replace('group:', ''))

    return getPermissionGroupLabel(item.name.split('.')[0])
  }

  const getDisplayName = item => getPermissionDisplayLabel(item.name)

  return {
    ITEMS_PER_PAGE_OPTIONS,
    emptyPermissionStats,
    countTreeNodes,
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
    isExporting,
    isImporting,
    selectedRows,
    stats,
    permissionTree,
    permissionItem,
    isDialogVisible,
    detailPermissionItem,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    headers,
    widgetData,
    parentOptions,
    hasInvalidDateRange,
    updateOptions,
    isGroupRow,
    getGroupName,
    getDisplayName,
  }
}
