<script setup>
// State bộ lọc
const filters = ref({
  user_id: null,
  organization_id: null,
  date_range: '',
  method: null,
})

// Options cho Phương thức HTTP
const methodOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Xem', value: 'GET' },
  { title: 'Thêm mới', value: 'POST' },
  { title: 'Cập nhật', value: 'PUT' },
  { title: 'Xóa', value: 'DELETE' },
]

// State cho Data Table
const page = ref(1)
const itemsPerPage = ref(10)

// Computed URL query parameters
const queryParams = computed(() => {
  const params = {
    page: page.value,
    limit: itemsPerPage.value,
  }

  if (filters.value.user_id) params.user_id = filters.value.user_id
  if (filters.value.organization_id) params.organization_id = filters.value.organization_id
  if (filters.value.method) params.method_type = filters.value.method
  
  if (filters.value.date_range) {
    const dates = filters.value.date_range.split(' to ')
    if (dates.length > 0) params.from_date = dates[0]
    if (dates.length > 1) params.to_date = dates[1]
  }

  return params
})

// Fetch log activities
const { data: logsData, isFetching: logsLoading } = await useApi(createUrl('/log-activities', {
  query: queryParams,
}))

const logs = computed(() => logsData.value?.data ?? [])
const totalLogs = computed(() => logsData.value?.meta?.total ?? 0)

// Fetch stats
const statsUrl = computed(() => {
  const params = { ...queryParams.value }
  delete params.page
  delete params.limit
  return createUrl('/log-activities/stats', { query: params }).value
})

const { data: statsData, isFetching: statsLoading } = await useApi(statsUrl)

// Compute stat cards from API
const statCards = computed(() => {
  const stats = statsData.value?.data || statsData.value || {}
  return [
    {
      title: 'Số lượt thao tác xem',
      value: stats.view?.toLocaleString() ?? '0',
      subtitle: 'Tổng số lượt thao tác xem',
      icon: 'tabler-eye',
      color: 'info',
    },
    {
      title: 'Số lượt thao tác tạo',
      value: stats.create?.toLocaleString() ?? '0',
      subtitle: 'Tổng số lượt thao tác tạo dữ liệu',
      icon: 'tabler-circle-plus',
      color: 'success',
    },
    {
      title: 'Số lượt thao tác cập nhật',
      value: stats.update?.toLocaleString() ?? '0',
      subtitle: 'Tổng số lượt cập nhật dữ liệu',
      icon: 'tabler-edit',
      color: 'warning',
    },
    {
      title: 'Số lượt thao tác xoá',
      value: stats.delete?.toLocaleString() ?? '0',
      subtitle: 'Tổng số lượt xoá dữ liệu',
      icon: 'tabler-trash',
      color: 'error',
    },
  ]
})

// Fetch Options for filters (mock since endpoints may not exist yet)
const userOptions = ref([
  { label: 'Quản trị hệ thống', value: 1 },
  { label: 'Nguyễn Lê Hải', value: 2 }
])

const orgOptions = ref([
  { label: 'Thành phố Đà Nẵng', value: 1 },
  { label: 'Sở Thông tin', value: 2 }
])

// Headers for DataTable
const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'TÊN NGƯỜI DÙNG', key: 'user_name' },
  { title: 'TỔ CHỨC', key: 'organization_id' },
  { title: 'MÔ TẢ', key: 'description' },
  { title: 'PHƯƠNG THỨC HTTP', key: 'method_type' },
  { title: 'THỜI GIAN', key: 'created_at' },
]

// Handlers
const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return 'info'
    case 'POST': return 'success'
    case 'PUT':
    case 'PATCH': return 'warning'
    case 'DELETE': return 'error'
    default: return 'primary'
  }
}

const getMethodLabel = (method) => {
  switch (method) {
    case 'GET': return 'Xem'
    case 'POST': return 'Thêm mới'
    case 'PUT':
    case 'PATCH': return 'Cập nhật'
    case 'DELETE': return 'Xóa'
    default: return method || 'Khác'
  }
}

const clearFilters = () => {
  filters.value = {
    user_id: null,
    organization_id: null,
    date_range: '',
    method: null,
  }
}
</script>

<template>
  <div>
    <!-- Stats Cards Row -->
    <VRow class="match-height mb-6">
      <VCol
        v-for="stat in statCards"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="pb-2">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-caption text-disabled">
                {{ stat.title }}
              </div>
              <VAvatar
                :color="stat.color"
                variant="tonal"
                size="34"
                rounded
              >
                <VIcon
                  :icon="stat.icon"
                  size="22"
                />
              </VAvatar>
            </div>
            <div class="text-h4 font-weight-bold mb-1">
              <VProgressCircular
                v-if="statsLoading"
                indeterminate
                size="24"
                width="2"
                color="primary"
              />
              <span v-else>{{ stat.value }}</span>
            </div>
          </VCardText>
          <VCardText class="pt-0 text-caption text-disabled">
            {{ stat.subtitle }}
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VCardItem class="pb-0">
        <VCardTitle>Nhật ký hoạt động toàn bộ hệ thống</VCardTitle>
      </VCardItem>
      <VCardText class="pt-4">
        <div class="text-subtitle-1 font-weight-bold mb-4">Bộ lọc</div>
        <VRow>
          <VCol cols="12" md="3">
            <AppAutocomplete
              v-model="filters.user_id"
              :items="userOptions"
              item-title="label"
              item-value="value"
              label="Tìm kiếm người dùng"
              placeholder="Chọn người dùng"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppAutocomplete
              v-model="filters.organization_id"
              :items="orgOptions"
              item-title="label"
              item-value="value"
              label="Tổ chức"
              placeholder="Chọn tổ chức"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppDateTimePicker
              v-model="filters.date_range"
              label="Khoảng thời gian"
              placeholder="Chọn khoảng thời gian"
              :config="{ mode: 'range' }"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppSelect
              v-model="filters.method"
              :items="methodOptions"
              label="Phương thức HTTP"
              placeholder="Chọn phương thức"
              clearable
            />
          </VCol>
          <VCol cols="12" class="d-flex justify-end gap-3 mt-4">
            <VBtn
              variant="tonal"
              color="primary"
              prepend-icon="tabler-download"
            >
              Xuất dữ liệu
            </VBtn>
            <VBtn
              variant="tonal"
              color="error"
              prepend-icon="tabler-trash"
              @click="clearFilters"
            >
              Xóa tất cả
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <!-- Data Table -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="logs"
        :items-length="totalLogs"
        :headers="headers"
        :loading="logsLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.user_name="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar size="32" color="primary" variant="tonal">
              <span>{{ item.user_name?.charAt(0)?.toUpperCase() || 'H' }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.user_name || 'Hệ thống' }}</span>
            </div>
          </div>
        </template>

        <template #item.organization_id="{ item }">
          {{ item.organization_id ? 'Thành phố Đà Nẵng' : 'Hệ thống' }}
        </template>
        
        <template #item.description="{ item }">
          {{ item.description }}
        </template>

        <template #item.method_type="{ item }">
          <VChip
            :color="getMethodColor(item.method_type)"
            size="small"
            class="font-weight-medium"
          >
            {{ getMethodLabel(item.method_type) }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          {{ item.created_at }}
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalLogs"
          />
        </template>

        <template #no-data>
          <div class="text-center pa-4 text-disabled">
            <VIcon
              icon="tabler-database-off"
              size="48"
              class="mb-2"
            />
            <div>Không có dữ liệu nhật ký hệ thống</div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
