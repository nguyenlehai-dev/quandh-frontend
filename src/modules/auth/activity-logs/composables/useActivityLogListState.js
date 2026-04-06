import { computed, ref } from 'vue'

export function useActivityLogListState() {
  const { t } = useI18n()
  const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100]

  const searchQuery = ref('')
  const selectedMethod = ref(null)
  const selectedStatus = ref(null)
  const fromDate = ref('')
  const toDate = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref('created_at')
  const orderBy = ref('desc')
  const selectedRows = ref([])
  const logs = ref([])
  const totalLogs = ref(0)
  const loading = ref(false)
  const isExporting = ref(false)
  const stats = ref({ total: 0 })
  const detailLoading = ref(false)
  const selectedLogDetail = ref(null)
  const isDetailDialogVisible = ref(false)
  const isConfirmDialogVisible = ref(false)
  const isConfirming = ref(false)
  const isDeleteByDateDialogVisible = ref(false)
  const isDeleteByDateSubmitting = ref(false)
  const deleteByDateForm = ref({ from_date: '', to_date: '' })

  const confirmDialog = ref({
    title: '',
    message: '',
    confirmText: t('auth.auth.activity_logs.messages.confirm'),
    confirmColor: 'primary',
    action: null,
  })

  const headers = computed(() => [
    { title: t('auth.auth.activity_logs.table.index'), key: 'index', sortable: false, width: '70px', align: 'center' },
    { title: t('auth.auth.activity_logs.table.module_name'), key: 'description', sortable: false },
    { title: t('auth.auth.activity_logs.table.user_name'), key: 'user_name', sortable: false, width: '180px' },
    { title: t('auth.auth.activity_logs.table.ip'), key: 'ip_address', sortable: false, width: '150px', align: 'center' },
    { title: t('auth.auth.activity_logs.table.status'), key: 'status_code', sortable: false, width: '120px', align: 'center' },
    { title: t('auth.auth.activity_logs.table.created_at'), key: 'created_at', sortable: true, width: '185px', align: 'center' },
    { title: t('auth.auth.activity_logs.table.updated_at'), key: 'updated_at', sortable: false, width: '185px', align: 'center' },
    { title: t('auth.auth.activity_logs.table.actions'), key: 'actions', sortable: false, width: '130px', align: 'center' },
  ])

  const widgetData = computed(() => [
    {
      title: 'auth.auth.activity_logs.stats.total',
      value: stats.value.total ?? 0,
      subtitle: 'auth.auth.activity_logs.stats.total_subtitle',
      icon: 'tabler-history',
      iconColor: 'warning',
    },
    {
      title: 'auth.auth.activity_logs.stats.showing',
      value: logs.value.length,
      subtitle: 'auth.auth.activity_logs.stats.showing_subtitle',
      icon: 'tabler-list-details',
      iconColor: 'info',
    },
  ])

  const methodOptions = computed(() => [
    { title: t('common.common.labels.all'), value: null },
    { title: 'GET', value: 'GET' },
    { title: 'POST', value: 'POST' },
    { title: 'PUT', value: 'PUT' },
    { title: 'PATCH', value: 'PATCH' },
    { title: 'DELETE', value: 'DELETE' },
  ])

  const statusOptions = computed(() => [
    { title: t('common.common.labels.all'), value: null },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.ok_200'), value: 200 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.created_201'), value: 201 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.no_content_204'), value: 204 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.bad_request_400'), value: 400 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.unauthorized_401'), value: 401 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.forbidden_403'), value: 403 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.not_found_404'), value: 404 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.unprocessable_422'), value: 422 },
    { title: t('auth.auth.activity_logs.toolbar.status_labels.server_error_500'), value: 500 },
  ])

  const hasInvalidDateRange = computed(() => Boolean(
    fromDate.value
    && toDate.value
    && new Date(toDate.value) < new Date(fromDate.value),
  ))

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key || 'created_at'
    orderBy.value = options.sortBy[0]?.order || 'desc'
  }

  return {
    ITEMS_PER_PAGE_OPTIONS,
    searchQuery,
    selectedMethod,
    selectedStatus,
    fromDate,
    toDate,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    logs,
    totalLogs,
    loading,
    isExporting,
    stats,
    detailLoading,
    selectedLogDetail,
    isDetailDialogVisible,
    isConfirmDialogVisible,
    isConfirming,
    isDeleteByDateDialogVisible,
    isDeleteByDateSubmitting,
    deleteByDateForm,
    confirmDialog,
    headers,
    widgetData,
    methodOptions,
    statusOptions,
    hasInvalidDateRange,
    updateOptions,
  }
}
