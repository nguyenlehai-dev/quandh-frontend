<script setup>
/* eslint-disable camelcase, vue/max-attributes-per-line, padding-line-between-statements */

import { ability } from '@/plugins/casl/ability'
import { useActionFeedback } from '@/composables/useActionFeedback'
import ActivityLogDetailDialog from '../components/ActivityLogDetailDialog.vue'
import AuthDataActions from '../../shared/AuthDataActions.vue'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import {
  bulkDeleteActivityLogs,
  clearAllActivityLogs,
  deleteActivityLog,
  deleteActivityLogsByDate,
  exportActivityLogs,
  fetchActivityLog,
  fetchActivityLogStats,
  fetchActivityLogs,
} from '../services/activityLogService'

const { snackbar, showSuccess, showError } = useActionFeedback()

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
  confirmText: 'Xac nhan',
  confirmColor: 'primary',
  action: null,
})

const headers = [
  { title: 'STT', key: 'index', sortable: false, width: '70px' },
  { title: 'MO TA', key: 'description', sortable: false },
  { title: 'NGUOI DUNG', key: 'user_name', sortable: false, width: '170px' },
  { title: 'IP', key: 'ip_address', sortable: false, width: '140px' },
  { title: 'METHOD', key: 'method_type', sortable: false, width: '110px' },
  { title: 'ROUTE', key: 'route', sortable: false },
  { title: 'STATUS', key: 'status_code', sortable: false, width: '110px' },
  { title: 'THOI GIAN', key: 'created_at', sortable: true, width: '170px' },
  { title: 'HANH DONG', key: 'actions', sortable: false, width: '130px' },
]

const canViewLogList = computed(() => ability.can('read', 'LogActivity'))
const canViewLogStats = computed(() => ability.can('stats', 'LogActivity'))
const canExportLogs = computed(() => ability.can('export', 'LogActivity'))
const canViewLogDetail = computed(() => ability.can('show', 'LogActivity') || canViewLogList.value)
const canDeleteLog = computed(() => ability.can('delete', 'LogActivity') || ability.can('bulkDestroy', 'LogActivity'))
const canBulkDeleteLogs = computed(() => ability.can('bulkDestroy', 'LogActivity'))
const canManageLogCleanup = computed(() => canBulkDeleteLogs.value || canDeleteLog.value)

const widgetData = computed(() => [
  {
    title: 'Tong so nhat ky',
    value: stats.value.total ?? 0,
    subtitle: 'Tong so ban ghi sau khi ap dung bo loc',
    icon: 'tabler-history',
    iconColor: 'warning',
  },
  {
    title: 'Dang hien thi',
    value: logs.value.length,
    subtitle: 'So dong dang co tren trang hien tai',
    icon: 'tabler-list-details',
    iconColor: 'info',
  },
])

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
})

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key || 'created_at'
  orderBy.value = options.sortBy[0]?.order || 'desc'
}

const fetchLogsData = async () => {
  if (!canViewLogList.value) {
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
  catch (err) {
    console.error('Fetch activity logs error:', err)
    logs.value = []
    totalLogs.value = 0
    showError(err, 'Khong the tai danh sach nhat ky hoat dong.')
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  if (!canViewLogStats.value) {
    stats.value = { total: 0 }

    return
  }

  try {
    const response = await fetchActivityLogStats(buildExportParams())

    stats.value = response.data ?? { total: 0 }
  }
  catch (err) {
    console.error('Fetch activity log stats error:', err)
    showError(err, 'Khong the tai thong ke nhat ky hoat dong.')
  }
}

const refreshList = async () => {
  await Promise.all([
    fetchLogsData(),
    fetchStats(),
  ])
}

let filterTimeout
watch([searchQuery, selectedMethod, selectedStatus, fromDate, toDate], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    refreshList()
  }, 300)
})

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchLogsData()
})

onMounted(() => {
  refreshList()
})

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const statusOptions = [
  { title: '200 OK', value: 200 },
  { title: '201 Created', value: 201 },
  { title: '204 No Content', value: 204 },
  { title: '400 Bad Request', value: 400 },
  { title: '401 Unauthorized', value: 401 },
  { title: '403 Forbidden', value: 403 },
  { title: '404 Not Found', value: 404 },
  { title: '422 Unprocessable', value: 422 },
  { title: '500 Server Error', value: 500 },
]

const resetFilters = () => {
  searchQuery.value = ''
  selectedMethod.value = null
  selectedStatus.value = null
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action)
    return

  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  }
  catch (err) {
    showError(err, 'Khong the thuc hien thao tac nay.')
  }
  finally {
    isConfirming.value = false
  }
}

const resolveMethodColor = method => {
  if (method === 'GET')
    return 'info'
  if (method === 'POST')
    return 'success'
  if (method === 'PUT' || method === 'PATCH')
    return 'warning'
  if (method === 'DELETE')
    return 'error'

  return 'primary'
}

const resolveStatusColor = status => {
  if (status >= 200 && status < 300)
    return 'success'
  if (status >= 400 && status < 500)
    return 'warning'
  if (status >= 500)
    return 'error'

  return 'primary'
}

const openDetailDialog = async item => {
  if (!canViewLogDetail.value)
    return

  detailLoading.value = true
  isDetailDialogVisible.value = true
  selectedLogDetail.value = null

  try {
    const response = await fetchActivityLog(item.id)

    selectedLogDetail.value = response.data ?? response
  }
  catch (err) {
    isDetailDialogVisible.value = false
    showError(err, 'Khong the tai chi tiet nhat ky hoat dong.')
  }
  finally {
    detailLoading.value = false
  }
}

const handleDeleteLog = item => {
  openConfirmDialog({
    title: 'Xoa nhat ky hoat dong',
    message: `Ban co chac chan muon xoa nhat ky "${item.description || item.route || item.id}" khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteActivityLog(item.id)
      selectedRows.value = selectedRows.value.filter(id => id !== item.id)
      showSuccess('Xoa nhat ky hoat dong thanh cong.')
      await refreshList()
    },
  })
}

const handleBulkDelete = () => {
  if (!selectedRows.value.length)
    return

  openConfirmDialog({
    title: 'Xoa hang loat nhat ky',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} nhat ky da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteActivityLogs(selectedRows.value)
      selectedRows.value = []
      showSuccess('Xoa hang loat nhat ky hoat dong thanh cong.')
      await refreshList()
    },
  })
}

const openDeleteByDateDialog = () => {
  deleteByDateForm.value = {
    from_date: fromDate.value || '',
    to_date: toDate.value || '',
  }
  isDeleteByDateDialogVisible.value = true
}

const submitDeleteByDate = async () => {
  if (!deleteByDateForm.value.from_date || !deleteByDateForm.value.to_date) {
    showError(new Error('validation'), 'Vui long chon day du tu ngay va den ngay.')

    return
  }

  isDeleteByDateSubmitting.value = true
  try {
    await deleteActivityLogsByDate(deleteByDateForm.value)
    selectedRows.value = []
    isDeleteByDateDialogVisible.value = false
    showSuccess('Xoa nhat ky theo khoang thoi gian thanh cong.')
    await refreshList()
  }
  catch (err) {
    showError(err, 'Khong the xoa nhat ky theo khoang thoi gian.')
  }
  finally {
    isDeleteByDateSubmitting.value = false
  }
}

const handleClearAll = () => {
  openConfirmDialog({
    title: 'Xoa toan bo nhat ky',
    message: 'Thao tac nay se xoa toan bo nhat ky hoat dong va khong the khoi phuc. Ban co chac chan muon tiep tuc khong?',
    confirmText: 'Xoa toan bo',
    confirmColor: 'error',
    action: async () => {
      await clearAllActivityLogs()
      selectedRows.value = []
      showSuccess('Da xoa toan bo nhat ky hoat dong.')
      await refreshList()
    },
  })
}

const handleExport = async () => {
  if (!canExportLogs.value)
    return

  isExporting.value = true
  try {
    if (selectedRows.value.length) {
      const selectedLogs = logs.value.filter(item => selectedRows.value.includes(item.id))

      exportRowsToExcel({
        rows: selectedLogs.map(item => ({
          description: item.description || '',
          user_name: item.user_name || 'Guest',
          ip_address: item.ip_address || '',
          method_type: item.method_type || '',
          route: item.route || '',
          status_code: item.status_code ?? '',
          created_at: formatAuthDateTime(item.created_at, { fallback: '' }),
        })),
        headers: ['description', 'user_name', 'ip_address', 'method_type', 'route', 'status_code', 'created_at'],
        sheetName: 'ActivityLogs',
        fileName: `activity_logs_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 36 },
          { wch: 24 },
          { wch: 18 },
          { wch: 12 },
          { wch: 40 },
          { wch: 14 },
          { wch: 22 },
        ],
      })

      showSuccess('Xuat nhat ky hoat dong thanh cong.')

      return
    }

    const response = await exportActivityLogs(buildExportParams())
    const safeBlob = response instanceof Blob ? response : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)

    showSuccess('Xuat nhat ky hoat dong thanh cong.')
  }
  catch (err) {
    console.error('Export activity logs error:', err)
    showError(err, 'Khong the xuat nhat ky hoat dong.')
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div id="activity-logs-module-root">
    <VRow class="mb-4">
      <VCol
        cols="12"
        class="mb-2"
      >
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex align-center gap-4">
            <VAvatar
              color="warning"
              variant="outlined"
              rounded="xl"
              size="54"
              class="border-opacity-100 border-warning"
            >
              <VIcon
                icon="tabler-history"
                size="28"
              />
            </VAvatar>
            <div class="d-flex flex-column">
              <h3 class="text-h3 font-weight-bold mb-1">
                Nhat ky hoat dong
              </h3>
              <span class="text-body-2 text-disabled">Theo doi truy cap he thong, xem chi tiet log va xu ly du lieu nhat ky.</span>
            </div>
          </div>

          <div class="d-flex align-center flex-wrap gap-3">
            <VBtn
              v-if="canManageLogCleanup"
              variant="tonal"
              color="error"
              prepend-icon="tabler-calendar-off"
              @click="openDeleteByDateDialog"
            >
              Xoa theo ngay
            </VBtn>
            <VBtn
              v-if="canManageLogCleanup"
              variant="tonal"
              color="error"
              prepend-icon="tabler-trash-x"
              @click="handleClearAll"
            >
              Xoa tat ca
            </VBtn>
            <AuthDataActions
              :show-export="canExportLogs"
              :export-loading="isExporting"
              export-label="Xuat du lieu"
              :export-handler="handleExport"
            />
          </div>
        </div>
      </VCol>

      <VCol
        v-for="(data, idx) in widgetData"
        :key="idx"
        cols="12"
        md="6"
      >
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                {{ data.title }}
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ data.value }}
              </h3>
              <span class="text-caption text-disabled">{{ data.subtitle }}</span>
            </div>
            <VAvatar
              :color="data.iconColor"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon
                :icon="data.icon"
                size="26"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard class="activity-logs-main-card">
          <VCardText class="activity-logs-main-card__header">
            <div class="d-flex align-center gap-2 mb-4">
              <VIcon
                icon="tabler-filter"
                size="20"
                color="warning"
              />
              <span class="text-subtitle-1 font-weight-bold">Bo loc</span>
            </div>

            <VRow class="activity-logs-filter-row">
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="searchQuery"
                  label="Tim kiem nhat ky"
                  placeholder="Nhap hanh dong, route, IP, quoc gia..."
                  prepend-inner-icon="tabler-search"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
              >
                <AppSelect
                  v-model="selectedMethod"
                  :items="methodOptions"
                  label="Method"
                  placeholder="Chon method"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
              >
                <AppSelect
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Status code"
                  placeholder="Chon status"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
              >
                <AppDateTimePicker
                  v-model="fromDate"
                  label="Tu ngay"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d' }"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
              >
                <AppDateTimePicker
                  v-model="toDate"
                  label="Den ngay"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d' }"
                  clearable
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end mt-4">
              <VBtn
                variant="tonal"
                color="secondary"
                prepend-icon="tabler-rotate-clockwise"
                @click="resetFilters"
              >
                Dat lai
              </VBtn>
            </div>

            <VAlert
              type="info"
              variant="tonal"
              class="mt-4"
              title="Du lieu nhat ky"
            >
              Man nay phuc vu truy vet thao tac he thong, xem chi tiet request va don dep nhat ky khi can.
            </VAlert>

            <div
              v-if="selectedRows.length"
              class="d-flex align-center justify-space-between flex-wrap gap-3 mt-4"
            >
              <div class="text-body-2 text-medium-emphasis">
                Da chon {{ selectedRows.length }} nhat ky
              </div>

              <VBtn
                v-if="canBulkDeleteLogs"
                color="error"
                variant="tonal"
                prepend-icon="tabler-trash"
                @click="handleBulkDelete"
              >
                Xoa hang loat
              </VBtn>
            </div>
          </VCardText>

          <VDivider />

          <VDataTableServer
            v-model:items-per-page="itemsPerPage"
            v-model:model-value="selectedRows"
            v-model:page="page"
            :items-length="totalLogs"
            :headers="headers"
            :items="logs"
            :loading="loading"
            item-value="id"
            class="text-no-wrap activity-log-table"
            show-select
            @update:options="updateOptions"
          >
            <template #item.index="{ index }">
              <span class="text-body-2 text-disabled">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
            </template>

            <template #item.description="{ item }">
              <span class="font-weight-medium">{{ item.description || item.route || 'N/A' }}</span>
            </template>

            <template #item.user_name="{ item }">
              <VChip
                size="small"
                variant="tonal"
                color="primary"
                label
              >
                {{ item.user_name || 'Guest' }}
              </VChip>
            </template>

            <template #item.ip_address="{ item }">
              <span class="text-body-2 text-disabled">{{ item.ip_address || 'N/A' }}</span>
            </template>

            <template #item.method_type="{ item }">
              <VChip
                size="small"
                :color="resolveMethodColor(item.method_type)"
                label
              >
                {{ item.method_type || 'N/A' }}
              </VChip>
            </template>

            <template #item.route="{ item }">
              <span class="text-body-2">{{ item.route || 'N/A' }}</span>
            </template>

            <template #item.status_code="{ item }">
              <VChip
                size="small"
                :color="resolveStatusColor(item.status_code)"
                variant="tonal"
                label
              >
                {{ item.status_code ?? 'N/A' }}
              </VChip>
            </template>

            <template #item.created_at="{ item }">
              <span class="text-body-2 text-disabled">{{ formatAuthDateTime(item.created_at, { fallback: 'N/A', includeSeconds: true }) }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center">
                <IconBtn
                  v-if="canViewLogDetail"
                  variant="text"
                  color="info"
                  size="small"
                  @click="openDetailDialog(item)"
                >
                  <VIcon
                    icon="tabler-eye"
                    size="20"
                  />
                </IconBtn>
                <IconBtn
                  v-if="canDeleteLog"
                  variant="text"
                  color="error"
                  size="small"
                  @click="handleDeleteLog(item)"
                >
                  <VIcon
                    icon="tabler-trash"
                    size="20"
                  />
                </IconBtn>
              </div>
            </template>

            <template #bottom>
              <TablePagination
                v-model:page="page"
                :items-per-page="itemsPerPage"
                :total-items="totalLogs"
              />
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>

    <ActivityLogDetailDialog
      v-model="isDetailDialogVisible"
      :loading="detailLoading"
      :activity-log="selectedLogDetail"
    />

    <VDialog
      v-model="isDeleteByDateDialogVisible"
      max-width="520"
    >
      <VCard class="pa-2 pa-sm-6">
        <VCardText>
          <h4 class="text-h4 text-center mb-2">
            Xoa nhat ky theo khoang ngay
          </h4>
          <p class="text-body-1 text-center mb-6">
            Chon khoang ngay can xoa. Thao tac nay chi ap dung cho ban ghi trong khoang da chon.
          </p>

          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <AppDateTimePicker
                v-model="deleteByDateForm.from_date"
                label="Tu ngay"
                placeholder="YYYY-MM-DD"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppDateTimePicker
                v-model="deleteByDateForm.to_date"
                label="Den ngay"
                placeholder="YYYY-MM-DD"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>
          </VRow>

          <div class="d-flex gap-4 justify-center mt-6">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="isDeleteByDateDialogVisible = false"
            >
              Huy
            </VBtn>
            <VBtn
              color="error"
              :loading="isDeleteByDateSubmitting"
              @click="submitDeleteByDate"
            >
              Xoa du lieu
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<style lang="scss">
.activity-logs-main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 22px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.activity-logs-main-card__header {
  padding: 20px 24px 16px;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-warning), 0.04), rgba(var(--v-theme-surface), 0)),
    linear-gradient(90deg, rgba(var(--v-theme-info), 0.04), transparent 30%);
}

.activity-log-table {
  .v-data-table__tr {
    &:hover {
      background: rgba(var(--v-theme-primary), 0.04) !important;
    }
  }
}
</style>
