<script setup>
import { ref, watch, onMounted } from 'vue'

const { t } = useI18n()

// ─── Filters & Table State ──────────────────────
const searchQuery = ref('')
const selectedMethod = ref()
const selectedStatus = ref()
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('created_at')
const orderBy = ref('desc')
const selectedRows = ref([])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key || 'created_at'
  orderBy.value = options.sortBy[0]?.order || 'desc'
}

// Headers
const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'HÀNH ĐỘNG', key: 'description' },
  { title: 'NGƯỜI DÙNG', key: 'user_name' },
  { title: 'ĐỊA CHỈ IP', key: 'ip_address', sortable: false },
  { title: 'METHOD', key: 'method_type' },
  { title: 'ROUTE', key: 'route', sortable: false },
  { title: 'STATUS', key: 'status_code' },
  { title: 'THỜI GIAN', key: 'created_at', sortable: true },
]

// ─── Data ──────────────────────────────────────
const logs = ref([])
const totalLogs = ref(0)
const loading = ref(false)
const stats = ref({ total: 0 })

const formatDate = dateString => {
  if (!dateString) return ''
  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString
  const d = new Date(safeDateString)
  if (isNaN(d.getTime())) return dateString

  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await $api('/log-activities', {
      params: {
        search: searchQuery.value || undefined,
        method_type: selectedMethod.value || undefined,
        status_code: selectedStatus.value || undefined,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    logs.value = res.data ?? []
    totalLogs.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch logs error:', err)
    logs.value = []
    totalLogs.value = 0
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await $api('/log-activities/stats', {
      params: {
        search: searchQuery.value,
        method_type: selectedMethod.value,
        status_code: selectedStatus.value,
      },
    })

    stats.value = res.data ?? { total: 0 }
  }
  catch (err) {
    console.error('Fetch stats error:', err)
  }
}

// Search/filter changes
let filterTimeout
watch([searchQuery, selectedMethod, selectedStatus], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    fetchLogs()
    fetchStats()
  }, 300)
})

// Pagination/sort changes
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchLogs()
})

// Initial fetch
onMounted(() => {
  fetchLogs()
  fetchStats()
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedMethod.value = null
  selectedStatus.value = null
}

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const statusOptions = [
  { title: '200 OK', value: 200 },
  { title: '201 Created', value: 201 },
  { title: '400 Bad Request', value: 400 },
  { title: '401 Unauthorized', value: 401 },
  { title: '403 Forbidden', value: 403 },
  { title: '404 Not Found', value: 404 },
  { title: '422 Unprocessable', value: 422 },
  { title: '500 Server Error', value: 500 },
]

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const blob = await $api('/log-activities/export', {
      method: 'GET',
      responseType: 'blob',
      params: {
        search: searchQuery.value || undefined,
        method_type: selectedMethod.value || undefined,
        status_code: selectedStatus.value || undefined,
      },
    })

    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `nhat_ky_hoat_dong_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Export error:', err)
    alert("Export thất bại!")
  }
  finally {
    isExporting.value = false
  }
}

const isBulkDeleting = ref(false)

const handleBulkDelete = async () => {
  if (!selectedRows.value.length) return

  const confirmed = window.confirm(`Xác nhận xóa ${selectedRows.value.length} nhật ký đã chọn?`)

  if (!confirmed) return

  isBulkDeleting.value = true
  try {
    await $api('/log-activities/bulk-delete', {
      method: 'POST',
      body: {
        ids: selectedRows.value,
      },
    })

    selectedRows.value = []
    await fetchLogs()
    await fetchStats()
  }
  catch (err) {
    console.error('Bulk delete logs error:', err)
    alert('Xóa hàng loạt thất bại!')
  }
  finally {
    isBulkDeleting.value = false
  }
}

const resolveMethodColor = method => {
  if (method === 'GET') return 'info'
  if (method === 'POST') return 'success'
  if (method === 'PUT' || method === 'PATCH') return 'warning'
  if (method === 'DELETE') return 'error'
  
  return 'primary'
}

const resolveStatusColor = status => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'error'
  
  return 'primary'
}
</script>

<template>
  <div>
    <!-- 👉 Filters -->
    <VCard class="mb-6">
      <VCardText class="pb-2">
        <div class="d-flex align-center gap-2 mb-4">
          <VIcon
            icon="tabler-filter"
            color="primary"
          />
          <div class="text-h6 font-weight-medium">
            Bộ lọc Nhật ký
          </div>
        </div>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              label="Tìm kiếm"
              placeholder="Tên, Hành động, IP..."
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="selectedMethod"
              :items="methodOptions"
              label="Method"
              placeholder="Chọn loại HTTP"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="selectedStatus"
              :items="statusOptions"
              label="Mã Status HTTP"
              placeholder="Chọn mã Status"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="pt-0 d-flex justify-end gap-3 flex-wrap">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="resetFilters"
        >
          <VIcon
            icon="tabler-refresh"
            start
          /> Đặt Lại
        </VBtn>
        <VBtn
          v-if="$can('export', 'ActivityLog')"
          variant="outlined"
          color="primary"
          :loading="isExporting"
          @click="handleExport"
        >
          <VIcon
            icon="tabler-download"
            start
          /> Xuất Excel
        </VBtn>
      </VCardText>

      <VDivider />

      <template v-if="selectedRows.length > 0">
        <VCardText class="d-flex align-center gap-3 flex-wrap">
          <span class="text-body-1 font-weight-medium">
            Đã chọn {{ selectedRows.length }} nhật ký
          </span>
          <VSpacer />
          <VBtn
            v-if="$can('bulkDestroy', 'ActivityLog')"
            color="error"
            variant="tonal"
            prepend-icon="tabler-trash"
            size="small"
            :loading="isBulkDeleting"
            @click="handleBulkDelete"
          >
            Xóa hàng loạt
          </VBtn>
          <VBtn
            variant="text"
            size="small"
            @click="selectedRows = []"
          >
            Bỏ chọn
          </VBtn>
        </VCardText>

        <VDivider />
      </template>

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="logs"
        item-value="id"
        :items-length="totalLogs"
        :headers="headers"
        :loading="loading"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- STT -->
        <template #item.index="{ index }">
          <div class="text-body-2">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </div>
        </template>

        <template #item.description="{ item }">
          <span class="font-weight-medium">{{ item.description || '' }}</span>
        </template>

        <template #item.user_name="{ item }">
          <VChip
            size="small"
            variant="tonal"
            color="primary"
          >
            {{ item.user_name || 'Hệ thống/Guest' }}
          </VChip>
        </template>

        <template #item.method_type="{ item }">
          <VChip
            size="small"
            :color="resolveMethodColor(item.method_type)"
            class="font-weight-bold"
          >
            {{ item.method_type }}
          </VChip>
        </template>
        
        <template #item.status_code="{ item }">
          <VChip
            size="small"
            :color="resolveStatusColor(item.status_code)"
            variant="tonal"
          >
            {{ item.status_code }}
          </VChip>
        </template>

        <!-- Ngày cập nhật -->
        <template #item.created_at="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar
              color="secondary"
              variant="tonal"
              size="28"
            >
              <VIcon
                icon="tabler-clock"
                size="16"
              />
            </VAvatar>
            <span class="text-body-2 text-disabled">{{ formatDate(item.created_at) }}</span>
          </div>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalLogs"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
  </div>
</template>
