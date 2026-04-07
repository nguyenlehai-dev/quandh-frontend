<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import {
  bulkDeleteCoreLogActivities,
  clearCoreLogActivities,
  deleteCoreLogActivitiesByDate,
  deleteCoreLogActivity,
  downloadCoreLogActivitiesExport,
  getCoreLogActivities,
  getCoreLogActivity,
  getCoreLogActivityStats,
} from '@/modules/activity-log/services/coreLogActivities'

const { t } = useI18n()

const headers = computed(() => [
  { title: t('User'), key: 'user_name', sortable: false },
  { title: t('Description'), key: 'description', sortable: false },
  { title: t('Method'), key: 'method_type' },
  { title: t('HTTP Status'), key: 'status_code' },
  { title: 'IP', key: 'ip_address', sortable: false },
  { title: t('Time'), key: 'created_at' },
  { title: t('Action'), key: 'actions', sortable: false },
])

const methodOptions = computed(() => [
  { title: t('All'), value: 'all' },
  { title: 'GET', value: 'GET' },
  { title: 'POST', value: 'POST' },
  { title: 'PUT', value: 'PUT' },
  { title: 'PATCH', value: 'PATCH' },
  { title: 'DELETE', value: 'DELETE' },
])

const bulkActions = computed(() => [
  { title: t('Delete'), value: 'delete' },
])

const logRows = ref([])
const isLoading = ref(false)
const totalLogs = ref(0)
const totalPages = ref(1)
const page = ref(1)
const itemsPerPage = ref(10)
const selectedRows = ref([])
const selectedBulkAction = ref()
const searchQuery = ref('')
const selectedMethodType = ref('all')
const statusCodeQuery = ref('')
const fromDate = ref('')
const toDate = ref('')
const sortBy = ref('created_at')
const orderBy = ref('desc')
const isDetailDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const pendingAction = ref(null)
const selectedLogDetail = ref(null)
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const resolveActivityAppearance = item => {
  if (item.method_type === 'DELETE')
    return { color: 'error', icon: 'tabler-trash' }

  if (item.method_type === 'POST')
    return { color: 'success', icon: 'tabler-plus' }

  if (item.method_type === 'PATCH' || item.method_type === 'PUT')
    return { color: 'warning', icon: 'tabler-edit' }

  if (item.route?.includes('auth/'))
    return { color: 'primary', icon: 'tabler-lock-check' }

  return { color: 'info', icon: 'tabler-history' }
}

const buildFilters = () => ({
  search: searchQuery.value.trim() || undefined,
  fromDate: fromDate.value || undefined,
  toDate: toDate.value || undefined,
  sortBy: sortBy.value || undefined,
  sortOrder: orderBy.value || undefined,
  limit: itemsPerPage.value,
  page: page.value,
  method_type: selectedMethodType.value === 'all' ? undefined : selectedMethodType.value,
  status_code: statusCodeQuery.value.trim() || undefined,
})

const formatJson = payload => {
  if (!payload)
    return 'N/A'

  return JSON.stringify(payload, null, 2)
}

const fetchActivityLogs = async () => {
  isLoading.value = true

  try {
    const [listResponse, statsResponse] = await Promise.all([
      getCoreLogActivities(buildFilters()),
      getCoreLogActivityStats(buildFilters()),
    ])

    logRows.value = (listResponse?.data ?? []).map(item => ({
      ...item,
      ...resolveActivityAppearance(item),
      user_name: item.user_name || 'Guest',
    }))
    totalLogs.value = statsResponse?.data?.total ?? listResponse?.meta?.total ?? logRows.value.length
    totalPages.value = listResponse?.meta?.last_page ?? 1
    page.value = listResponse?.meta?.current_page ?? page.value
    selectedRows.value = selectedRows.value.filter(id => logRows.value.some(item => item.id === id))
  }
  catch {
    logRows.value = []
    totalLogs.value = 0
  }
  finally {
    isLoading.value = false
  }
}

const updateOptions = options => {
  const nextSort = options.sortBy[0]

  sortBy.value = nextSort?.key ?? 'created_at'
  orderBy.value = nextSort?.order ?? 'desc'
}

const openLogDetail = async logId => {
  const response = await getCoreLogActivity(logId)

  selectedLogDetail.value = response?.data ?? null
  isDetailDialogVisible.value = true
}

const requestDelete = mode => {
  pendingAction.value = mode
  isDeleteDialogVisible.value = true
}

const handleDeleteConfirmation = async isConfirmed => {
  if (!isConfirmed || !pendingAction.value)
    return

  if (pendingAction.value.type === 'single') {
    await deleteCoreLogActivity(pendingAction.value.id)
    showSnackbar('Đã xóa nhật ký thành công.')
  }
  else if (pendingAction.value.type === 'bulk') {
    await bulkDeleteCoreLogActivities(selectedRows.value)
    selectedRows.value = []
    selectedBulkAction.value = undefined
    showSnackbar('Đã xóa các nhật ký đã chọn.')
  }
  else if (pendingAction.value.type === 'clearByDate') {
    await deleteCoreLogActivitiesByDate(fromDate.value, toDate.value)
    showSnackbar('Đã xóa nhật ký theo khoảng thời gian đã chọn.')
  }
  else if (pendingAction.value.type === 'clearAll') {
    await clearCoreLogActivities()
    showSnackbar('Đã xóa toàn bộ nhật ký.')
  }

  pendingAction.value = null
  await fetchActivityLogs()
}

const handleBulkAction = action => {
  if (action === 'delete' && selectedRows.value.length)
    requestDelete({ type: 'bulk' })
}

const handleExportLogs = async () => {
  await downloadCoreLogActivitiesExport(buildFilters())
  showSnackbar('Đã xuất danh sách nhật ký.')
}

watch([searchQuery, selectedMethodType, statusCodeQuery, fromDate, toDate, itemsPerPage], () => {
  page.value = 1
})

watch([searchQuery, selectedMethodType, statusCodeQuery, fromDate, toDate, itemsPerPage, page, sortBy, orderBy], fetchActivityLogs)

onMounted(() => {
  hydratePendingSnackbar()
  fetchActivityLogs()
})
</script>

<template>
  <VRow class="mb-2">
    <VCol
      cols="12"
      md="4"
    >
      <VCard>
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <div class="text-body-2 text-medium-emphasis mb-1">
              {{ $t('Total Logs') }}
            </div>
            <div class="text-h4">
              {{ totalLogs }}
            </div>
          </div>

          <VAvatar
            rounded
            color="primary"
            variant="tonal"
          >
            <VIcon icon="tabler-history" />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <VCard>
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <div class="text-body-2 text-medium-emphasis mb-1">
              {{ $t('Selected') }}
            </div>
            <div class="text-h4">
              {{ selectedRows.length }}
            </div>
          </div>

          <VAvatar
            rounded
            color="info"
            variant="tonal"
          >
            <VIcon icon="tabler-checklist" />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <VCard>
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <div class="text-body-2 text-medium-emphasis mb-1">
              {{ $t('Filtered Method') }}
            </div>
            <div class="text-h4">
              {{ selectedMethodType === 'all' ? $t('All') : selectedMethodType }}
            </div>
          </div>

          <VAvatar
            rounded
            color="warning"
            variant="tonal"
          >
            <VIcon icon="tabler-filter" />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VCard>
    <VCardItem class="pb-4">
      <VCardTitle>{{ $t('Filters') }}</VCardTitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="searchQuery"
            :label="$t('Search')"
            :placeholder="$t('Search description, route, user')"
          />
        </VCol>

        <VCol
          cols="12"
          md="2"
        >
          <AppSelect
            v-model="selectedMethodType"
            :label="$t('Method')"
            :items="methodOptions"
          />
        </VCol>

        <VCol
          cols="12"
          md="2"
        >
          <AppTextField
            v-model="statusCodeQuery"
            :label="$t('HTTP Status')"
            placeholder="200"
          />
        </VCol>

        <VCol
          cols="12"
          md="2"
        >
          <AppDateTimePicker
            v-model="fromDate"
            :label="$t('From Date')"
            :placeholder="$t('From Date')"
            :config="{ dateFormat: 'Y-m-d' }"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppDateTimePicker
            v-model="toDate"
            :label="$t('To Date')"
            :placeholder="$t('To Date')"
            :config="{ dateFormat: 'Y-m-d' }"
          />
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VCardText class="d-flex flex-wrap gap-4 align-center">
      <AppSelect
        v-if="selectedRows.length"
        v-model="selectedBulkAction"
        :placeholder="$t('Action')"
        :items="bulkActions"
        style="inline-size: 13rem;"
        @update:model-value="handleBulkAction"
      />

      <VSpacer />

      <div class="d-flex gap-4 flex-wrap align-center">
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-upload"
          @click="handleExportLogs"
        >
          {{ $t('Export') }}
        </VBtn>

        <VBtn
          variant="tonal"
          color="warning"
          prepend-icon="tabler-calendar-off"
          :disabled="!fromDate || !toDate"
          @click="requestDelete({ type: 'clearByDate' })"
        >
          {{ $t('Delete by date') }}
        </VBtn>

        <VBtn
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="requestDelete({ type: 'clearAll' })"
        >
          {{ $t('Delete all') }}
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:model-value="selectedRows"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="logRows"
      :items-length="totalLogs"
      item-value="id"
      :loading="isLoading"
      class="text-no-wrap"
      show-select
      @update:options="updateOptions"
    >
      <template #item.user_name="{ item }">
        <div class="d-flex align-center gap-x-3">
          <VAvatar
            size="32"
            rounded
            color="secondary"
            variant="tonal"
          >
            <VIcon :icon="item.icon" :color="item.color" size="18" />
          </VAvatar>

          <div class="d-flex flex-column">
            <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.user_name }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ item.user_type || 'N/A' }}</span>
          </div>
        </div>
      </template>

      <template #item.description="{ item }">
        <div class="d-flex flex-column">
          <span class="text-body-2 text-high-emphasis text-wrap">{{ item.description }}</span>
          <span class="text-body-2 text-medium-emphasis text-wrap">{{ item.route }}</span>
        </div>
      </template>

      <template #item.method_type="{ item }">
        <VChip
          :color="item.color"
          size="small"
          label
        >
          {{ item.method_type }}
        </VChip>
      </template>

      <template #item.status_code="{ item }">
        <VChip
          :color="item.status_code >= 400 ? 'error' : 'success'"
          size="small"
          label
        >
          {{ item.status_code }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <IconBtn @click="openLogDetail(item.id)">
          <VIcon icon="tabler-eye" />
        </IconBtn>

        <IconBtn @click="requestDelete({ type: 'single', id: item.id })">
          <VIcon icon="tabler-trash" />
        </IconBtn>
      </template>

      <template #bottom>
        <VDivider />

        <div class="d-flex flex-wrap align-center justify-space-between gap-4 px-6 py-4">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 20, title: '20' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 6rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />

          <div class="d-flex flex-wrap align-center justify-end gap-4 ms-auto">
            <p class="text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalLogs) }}
            </p>

            <VPagination
              :model-value="page"
              active-color="primary"
              :length="Math.max(totalPages, 1)"
              :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(totalPages, 1), 5)"
              @update:model-value="page = $event"
            />
          </div>
        </div>
      </template>
    </VDataTableServer>
  </VCard>

  <VDialog
    v-model="isDetailDialogVisible"
    max-width="900"
  >
    <VCard>
      <VCardItem :title="$t('Log Details')" />

      <VCardText v-if="selectedLogDetail">
        <VRow>
          <VCol cols="12" md="6">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('User') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.user_name || $t('Guest') }}</div>
          </VCol>

          <VCol cols="12" md="6">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Organization') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.organization_id || 'N/A' }}</div>
          </VCol>

          <VCol cols="12">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Description') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.description }}</div>
          </VCol>

          <VCol cols="12" md="6">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Route') }}</div>
            <div class="text-body-1 text-break">{{ selectedLogDetail.route }}</div>
          </VCol>

          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Method') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.method_type }}</div>
          </VCol>

          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('HTTP Status') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.status_code }}</div>
          </VCol>

          <VCol cols="12" md="4">
            <div class="text-body-2 text-medium-emphasis mb-1">IP</div>
            <div class="text-body-1">{{ selectedLogDetail.ip_address || 'N/A' }}</div>
          </VCol>

          <VCol cols="12" md="4">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Country') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.country || 'N/A' }}</div>
          </VCol>

          <VCol cols="12" md="4">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Time') }}</div>
            <div class="text-body-1">{{ selectedLogDetail.created_at }}</div>
          </VCol>

          <VCol cols="12">
            <div class="text-body-2 text-medium-emphasis mb-1">User Agent</div>
            <div class="text-body-1 text-break">{{ selectedLogDetail.user_agent || 'N/A' }}</div>
          </VCol>

          <VCol cols="12">
            <div class="text-body-2 text-medium-emphasis mb-1">{{ $t('Request Data') }}</div>
            <VCard
              variant="tonal"
              color="secondary"
            >
              <VCardText>
                <pre class="mb-0 text-body-2 detail-pre">{{ formatJson(selectedLogDetail.request_data) }}</pre>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isDeleteDialogVisible"
    :confirmation-question="$t('Are you sure you want to perform this action on the logs?')"
    :confirm-title="$t('Deleted')"
    :confirm-msg="$t('The action on the logs has been completed.')"
    :cancel-title="$t('Cancelled')"
    :cancel-msg="$t('The logs remain unchanged.')"
    @confirm="handleDeleteConfirmation"
  />

  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    timeout="2400"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>

<style scoped lang="scss">
.detail-pre {
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
