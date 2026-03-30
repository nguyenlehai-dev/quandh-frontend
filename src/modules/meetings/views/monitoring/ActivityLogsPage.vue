<script setup>
/* eslint-disable camelcase */

import { ref, computed, onMounted } from 'vue'
import { ability } from '@/plugins/casl/ability'

// ─── Filters & Table State ──────────────────────
const searchQuery = ref('')
const selectedOrg = ref(null)
const selectedMethod = ref(null)
const selectedDateRange = ref(null)
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('')
const orderBy = ref('')
const selectedRows = ref([])

let fetchTimeout

const triggerFetch = () => {
  clearTimeout(fetchTimeout)
  fetchTimeout = setTimeout(() => {
    fetchLogs()
  }, 100)
}

const updateOptions = options => {
  // Đồng bộ sort từ datatable event
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  
  // Datatable xử lý page và itemsPerPage bằng v-model tự ngầm đồng bộ
  // Mỗi lần datatable khởi tạo hoặc đổi trang/sort => gọi fetch (đã có chống trùng)
  triggerFetch()
}

const handleFilterChange = () => {
  // Khi ấn lọc -> reset trang về 1
  page.value = 1
  fetchStats()
  triggerFetch()
}

// Headers
const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'TÊN NGƯỜI DÙNG', key: 'user' },
  { title: 'TỔ CHỨC', key: 'organization', sortable: false },
  { title: 'MÔ TẢ', key: 'description' },
  { title: 'PHƯƠNG THỨC HTTP', key: 'method_type' },
  { title: 'ĐỊA CHỈ IP', key: 'ip_address' },
  { title: 'THỜI GIAN TRUY CẬP', key: 'created_at', sortable: true },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, align: 'end' },
]

// ─── Data ──────────────────────────────────────
const logs = ref([])
const totalLogs = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, view: 0, create: 0, update: 0, delete: 0 })
const organizations = ref([])
const canViewOrganizations = computed(() => ability.can('index', 'Organization'))
const canViewLogList = computed(() => ability.can('read', 'ActivityLog'))
const canViewLogStats = computed(() => ability.can('stats', 'ActivityLog'))

const fetchDependencies = async () => {
  try {
    if (!canViewOrganizations.value) {
      organizations.value = []

      return
    }

    const oRes = await $api('/organizations?limit=100')

    organizations.value = oRes.data?.data || oRes.data || []
  } catch (err) {}
}

const resolveMethodVariant = method => {
  if (!method) return 'secondary'
  const m = method.toUpperCase()
  if (m === 'GET') return 'info'
  if (m === 'POST') return 'success'
  if (m === 'PUT' || m === 'PATCH') return 'warning'
  if (m === 'DELETE') return 'error'
  
  return 'primary'
}

const formatDate = dateString => {
  if (!dateString) return ''
  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString
  const d = new Date(safeDateString)
  if (isNaN(d.getTime())) return dateString
  
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const parseDateRange = () => {
  if (!selectedDateRange.value) return { from_date: undefined, to_date: undefined }
  const parts = selectedDateRange.value.split(' to ')
  
  const endDate = parts[1] || parts[0]

  return {
    from_date: parts[0] ? parts[0] + ' 00:00:00' : undefined,
    to_date: endDate ? endDate + ' 23:59:59' : undefined,
  }
}

const fetchLogs = async () => {
  if (!canViewLogList.value) {
    logs.value = []
    totalLogs.value = 0

    return
  }

  loading.value = true
  try {
    const dates = parseDateRange()

    const res = await $api('/log-activities', {
      params: {
        search: searchQuery.value || undefined,
        organization_id: selectedOrg.value || undefined,
        method_type: selectedMethod.value || undefined,
        from_date: dates.from_date,
        to_date: dates.to_date,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    logs.value = res.data ?? []
    totalLogs.value = res.meta?.total ?? res.total ?? 0
  } catch (err) {
    console.error('Fetch logs error:', err)
    logs.value = []
    totalLogs.value = 0
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  if (!canViewLogStats.value) {
    stats.value = { total: 0, view: 0, create: 0, update: 0, delete: 0 }

    return
  }

  try {
    const dates = parseDateRange()

    const res = await $api('/log-activities/stats', {
      params: {
        search: searchQuery.value,
        organization_id: selectedOrg.value,
        method_type: selectedMethod.value,
        from_date: dates.from_date,
        to_date: dates.to_date,
      },
    })

    stats.value = res.data ?? { total: 0, view: 0, create: 0, update: 0, delete: 0 }
  } catch (err) {
    console.error('Fetch stats error:', err)
  }
}

onMounted(() => {
  fetchStats()
  fetchDependencies()

  // Dữ liệu bảng sẽ được fetch khi VDataTableServer khởi tạo và kích hoạt update:options
})

const methodOptions = [
  { title: 'Xem', value: 'GET' },
  { title: 'Tạo mới', value: 'POST' },
  { title: 'Cập nhật', value: 'PUT' },
  { title: 'Xoá', value: 'DELETE' },
]

const getMethodLabel = method => {
  if (!method) return 'Khác'
  const m = method.toUpperCase()
  if (m === 'GET') return 'Xem'
  if (m === 'POST') return 'Tạo mới'
  if (m === 'PUT' || m === 'PATCH') return 'Cập nhật'
  if (m === 'DELETE') return 'Xóa'
  
  return m
}

const widgetData = computed(() => [
  {
    title: 'Số lượt thao tác xem',
    value: stats.value.view ?? 0,
    subtitle: 'Tổng số lượt thao tác xem',
    icon: 'tabler-eye',
    iconColor: 'info',
  },
  {
    title: 'Số lượt thao tác tạo',
    value: stats.value.create ?? 0,
    subtitle: 'Tổng số lượt thao tác tạo dữ liệu',
    icon: 'tabler-plus',
    iconColor: 'success',
  },
  {
    title: 'Số lượt thao tác cập nhật',
    value: stats.value.update ?? 0,
    subtitle: 'Tổng số lượt cập nhật dữ liệu',
    icon: 'tabler-edit',
    iconColor: 'warning',
  },
  {
    title: 'Số lượt thao tác xoá',
    value: stats.value.delete ?? 0,
    subtitle: 'Tổng số lượt thao tác xoá dữ liệu',
    icon: 'tabler-trash',
    iconColor: 'error',
  },
])

// ─── Actions ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const dates = parseDateRange()

    const query = new URLSearchParams({
      search: searchQuery.value || '',
      organization_id: selectedOrg.value || '',
      method_type: selectedMethod.value || '',
      from_date: dates.from_date || '',
      to_date: dates.to_date || '',
    }).toString()
    
    // Sử dụng url trực tiếp cho API export (có thêm token nếu cần xác thực qua fetch)
    const token = useCookie('accessToken').value || useCookie('access_token').value || localStorage.getItem('accessToken') || ''

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/log-activities/export?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) throw new Error('Export failed')

    const blob = await response.blob()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `nhat_ky_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  } catch (err) {
    console.error('Export error:', err)
  } finally {
    isExporting.value = false
  }
}

// Single Delete
const deleteDialog = ref(false)
const logToDelete = ref(null)

const confirmDeleteLog = id => {
  logToDelete.value = id
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!logToDelete.value) return
  try {
    await $api(`/log-activities/${logToDelete.value}`, { method: 'DELETE' })
    fetchLogs()
    fetchStats()
    deleteDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

// Bulk Delete
const bulkDeleteDialog = ref(false)

const executeBulkDelete = async () => {
  if (!selectedRows.value.length) return
  try {
    await $api('/log-activities/bulk-delete', { method: 'POST', body: { ids: selectedRows.value } })
    selectedRows.value = []
    fetchLogs()
    fetchStats()
    bulkDeleteDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

// Clear All
const clearAllDialog = ref(false)

const executeClearAll = async () => {
  try {
    await $api('/log-activities/clear', { method: 'POST' })
    fetchLogs()
    fetchStats()
    clearAllDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

// View Details
const viewDialog = ref(false)
const viewData = ref({})

const openViewDetails = item => {
  viewData.value = item
  viewDialog.value = true
}
</script>

<template>
  <div>
    <!-- 👉 Stats Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol
          v-for="(data, id) in widgetData"
          :key="id"
          cols="12"
          md="3"
          sm="6"
        >
          <VCard>
            <VCardText>
              <div class="d-flex justify-space-between">
                <div class="d-flex flex-column gap-y-1">
                  <div class="text-body-1 text-high-emphasis">
                    {{ data.title }}
                  </div>
                  <h4 class="text-h4">
                    {{ data.value }}
                  </h4>
                  <div class="text-caption text-disabled mt-1">
                    {{ data.subtitle }}
                  </div>
                </div>
                <VAvatar
                  :color="data.iconColor"
                  variant="tonal"
                  rounded
                  size="42"
                >
                  <VIcon
                    :icon="data.icon"
                    size="26"
                  />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- 👉 Filters -->
    <VCard class="mb-6">
      <VCardText class="pb-2">
        <div class="d-flex align-center gap-2 mb-4">
          <VIcon
            icon="tabler-filter"
            color="primary"
          />
          <div class="text-h6 font-weight-medium">
            Bộ lọc
          </div>
        </div>
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="searchQuery"
              label="Tìm kiếm người dùng/IP"
              placeholder="Nhập tên người dùng"
              clearable
              @update:model-value="handleFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedOrg"
              :items="organizations"
              item-title="name"
              item-value="id"
              label="Tổ chức"
              placeholder="Chọn tổ chức"
              clearable
              @update:model-value="handleFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="selectedDateRange"
              label="Khoảng thời gian"
              placeholder="Chọn khoảng thời gian"
              :config="{ mode: 'range' }"
              clearable
              @update:model-value="handleFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedMethod"
              :items="methodOptions"
              item-title="title"
              item-value="value"
              label="Hành động"
              placeholder="Chọn hành động"
              clearable
              @update:model-value="handleFilterChange"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="pt-0 d-flex justify-end gap-3 flex-wrap">
        <VBtn
          variant="outlined"
          color="primary"
          :loading="isExporting"
          @click="handleExport"
        >
          <VIcon
            icon="tabler-file-export"
            start
          /> Xuất Dữ Liệu
        </VBtn>
        <VBtn
          variant="elevated"
          color="error"
          @click="clearAllDialog = true"
        >
          <VIcon
            icon="tabler-trash-x"
            start
          /> Xoá Tất Cả
        </VBtn>
      </VCardText>
    </VCard>

    <!-- 👉 Data Table -->
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4 pt-4 pb-0">
        <div class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-history"
            size="24"
            color="primary"
          />
          <h5 class="text-h5 font-weight-bold">
            Nhật ký hoạt động
          </h5>
        </div>
        <VSpacer />
        <!-- Xóa hàng loạt -->
        <VBtn
          v-if="selectedRows.length > 0"
          color="error"
          variant="tonal"
          @click="bulkDeleteDialog = true"
        >
          <VIcon
            icon="tabler-trash"
            start
          /> Xóa Đã Chọn ({{ selectedRows.length }})
        </VBtn>
        <div class="d-flex align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[10, 25, 50, 100]"
            style="inline-size: 6.25rem;"
            density="compact"
          />
        </div>
      </VCardText>

      <VDivider class="mt-4" />

      <VDataTableServer
        v-model="selectedRows"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="logs"
        :items-length="totalLogs"
        :headers="headers"
        :loading="loading"
        show-select
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.user="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="34"
              :color="item.user ? 'primary' : 'secondary'"
              variant="tonal"
              class="me-3"
            >
              <VIcon
                :icon="item.user ? 'tabler-user' : 'tabler-user-off'"
                size="20"
              />
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-body-1 font-weight-medium">{{ item.user?.name || 'Vô danh' }}</span>
              <span class="text-caption text-disabled">{{ item.user?.user_name || item.user_type }}</span>
            </div>
          </div>
        </template>

        <template #item.organization="{ item }">
          <div class="text-body-2 font-weight-medium">
            {{ item.organization?.name || 'Không xác định' }}
          </div>
        </template>

        <template #item.description="{ item }">
          <span class="text-body-2">{{ item.description || `Truy cập ${item.route}` }}</span>
        </template>

        <template #item.method_type="{ item }">
          <VChip
            :color="resolveMethodVariant(item.method_type)"
            size="small"
            class="text-uppercase font-weight-medium"
          >
            {{ getMethodLabel(item.method_type) }}
          </VChip>
        </template>

        <template #item.ip_address="{ item }">
          <span class="text-body-2 font-weight-medium text-warning">{{ item.ip_address || 'N/A' }}</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <IconBtn
            variant="text"
            color="info"
            size="small"
            @click="openViewDetails(item)"
          >
            <VIcon
              icon="tabler-eye"
              size="20"
            />
          </IconBtn>
          <IconBtn
            variant="text"
            color="error"
            size="small"
            @click="confirmDeleteLog(item.id)"
          >
            <VIcon
              icon="tabler-trash"
              size="20"
            />
          </IconBtn>
        </template>

        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              Biểu diễn từ {{ (page - 1) * itemsPerPage + 1 }} đến {{ Math.min(page * itemsPerPage, totalLogs) }} của {{ totalLogs }} mục
            </p>
            <VPagination
              v-model="page"
              :length="Math.ceil(totalLogs / itemsPerPage)"
              :total-visible="5"
              active-color="primary"
              size="small"
            />
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Dialog View Details -->
    <VDialog
      v-model="viewDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="px-6 py-4 border-b">
          Chi tiết hành động
        </VCardTitle>
        <VCardText class="pa-6">
          <VRow>
            <VCol
              cols="12"
              sm="6"
            >
              <span class="font-weight-medium">Route:</span> {{ viewData.route }}
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <span class="font-weight-medium">Trạng thái:</span> 
              <VChip
                size="x-small"
                :color="viewData.status_code >= 400 ? 'error' : 'success'"
              >
                {{ viewData.status_code || 200 }}
              </VChip>
            </VCol>
            <VCol cols="12">
              <span class="font-weight-medium">Trình duyệt (User Agent):</span>
              <div class="text-caption mt-1 pa-2 bg-var-theme-background rounded">
                {{ viewData.user_agent }}
              </div>
            </VCol>
            <VCol cols="12">
              <span class="font-weight-medium">Dữ liệu yêu cầu:</span>
              <pre
                class="bg-var-theme-background pa-4 rounded mt-2 text-caption"
                style="overflow-x: auto"
              >{{ JSON.stringify(viewData.request_data, null, 2) || '{}' }}</pre>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4 pt-0 justify-end">
          <VBtn
            color="secondary"
            variant="outlined"
            @click="viewDialog = false"
          >
            Đóng
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Single Delete -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard class="text-center pa-6">
        <VIcon
          icon="tabler-alert-circle"
          color="error"
          size="80"
          class="mx-auto"
        />
        <h4 class="text-h4 mt-4 mb-2">
          Xác nhận xóa
        </h4>
        <p class="text-body-1 text-disabled mb-6">
          Bạn có chắc chắn muốn xóa nhật ký này không?
        </p>
        <div class="d-flex justify-center gap-3">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="deleteDialog = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="error"
            @click="executeDelete"
          >
            Xác nhận
          </VBtn>
        </div>
      </VCard>
    </VDialog>

    <!-- Dialog Bulk Delete -->
    <VDialog
      v-model="bulkDeleteDialog"
      max-width="400"
    >
      <VCard class="text-center pa-6">
        <VIcon
          icon="tabler-alert-circle"
          color="error"
          size="80"
          class="mx-auto"
        />
        <h4 class="text-h4 mt-4 mb-2">
          Xóa mục đã chọn
        </h4>
        <p class="text-body-1 text-disabled mb-6">
          Sẽ xóa vĩnh viễn {{ selectedRows.length }} dòng dữ liệu.
        </p>
        <div class="d-flex justify-center gap-3">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="bulkDeleteDialog = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="error"
            @click="executeBulkDelete"
          >
            Xác nhận
          </VBtn>
        </div>
      </VCard>
    </VDialog>

    <!-- Dialog Clear All -->
    <VDialog
      v-model="clearAllDialog"
      max-width="450"
    >
      <VCard class="text-center pa-6">
        <VIcon
          icon="tabler-alert-triangle"
          color="error"
          size="80"
          class="mx-auto"
        />
        <h4 class="text-h4 mt-4 mb-2">
          Cảnh báo nghiêm trọng
        </h4>
        <p class="text-body-1 text-disabled mb-6">
          Thao tác NÀY sẽ quét sạch toàn bộ nhật ký trong hệ thống và không thể phục hồi. Bạn đã chắc chắn chưa?
        </p>
        <div class="d-flex justify-center gap-3">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="clearAllDialog = false"
          >
            Đóng
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            @click="executeClearAll"
          >
            Xóa Toàn Bộ
          </VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.text-warning {
  color: rgb(var(--v-theme-warning));
}

.bg-var-theme-background {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
