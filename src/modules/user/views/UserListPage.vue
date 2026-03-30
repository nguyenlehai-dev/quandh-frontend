<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/useUserStore'
import { downloadUserTemplate, exportUsers, importUsers } from '../services/userService'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

// ─── Filters & Table State ──────────────────────
const searchQuery = ref('')
const selectedStatus = ref()
const selectedRole = ref()
const selectedOrg = ref()
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers
const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'TÊN NGƯỜI DÙNG', key: 'name' },
  { title: 'EMAIL', key: 'email' },
  { title: 'TỔ CHỨC & VAI TRÒ', key: 'roles', sortable: false },
  { title: 'NGÀY CẬP NHẬT', key: 'updated_at', sortable: true },
  { title: 'TRẠNG THÁI', key: 'status' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false },
]

// ─── Data ──────────────────────────────────────
const users = ref([])
const totalUsers = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })
const roles = ref([])
const organizations = ref([])

const fetchDependencies = async () => {
  try {
    const [rRes, oRes] = await Promise.all([
      $api('/roles?limit=100'),
      $api('/organizations?limit=100'),
    ])

    roles.value = rRes.data?.data || rRes.data || []
    organizations.value = oRes.data?.data || oRes.data || []
  } catch (err) {}
}

const getRoleName = roleId => {
  const r = roles.value.find(x => x.id === roleId)
  
  return r ? r.name : roleId
}

const getOrgName = orgId => {
  const o = organizations.value.find(x => x.id === orgId)
  
  return o ? o.name : orgId
}

const formatDate = dateString => {
  if (!dateString) return 'Chưa cập nhật'
  
  // Xử lý chuỗi ngày tháng có định dạng YYYY-MM-DD HH:mm:ss (nếu API trả về có khoảng trắng ở giữa)
  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString
  const d = new Date(safeDateString)
  
  if (isNaN(d.getTime())) return dateString

  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await $api('/users', {
      params: {
        search: searchQuery.value || undefined,
        status: selectedStatus.value || undefined,
        role_id: selectedRole.value || undefined,
        organization_id: selectedOrg.value || undefined,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    users.value = res.data ?? []
    totalUsers.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch users error:', err)
    users.value = []
    totalUsers.value = 0
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await $api('/users/stats', {
      params: {
        search: searchQuery.value,
        status: selectedStatus.value,
      },
    })

    stats.value = res.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (err) {
    console.error('Fetch stats error:', err)
  }
}

// Search/filter changes
let filterTimeout
watch([searchQuery, selectedStatus, selectedRole, selectedOrg], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
    fetchStats()
  }, 300)
})

// Pagination/sort changes
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchUsers()
})

// Initial fetch
onMounted(() => {
  fetchUsers()
  fetchStats()
  fetchDependencies()
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedRole.value = null
  selectedOrg.value = null
}

// ─── Status Options ─────────────────────────────
const statusOptions = [
  { title: 'Đang hoạt động', value: 'active' },
  { title: 'Tạm khóa', value: 'inactive' },
  { title: 'Cấm', value: 'banned' },
]

const resolveUserStatusVariant = stat => {
  if (!stat) return 'primary'
  const s = stat.toLowerCase()
  if (s === 'active') return 'success'
  if (s === 'inactive') return 'warning'
  if (s === 'banned') return 'error'

  return 'primary'
}

const resolveStatusText = stat => {
  const found = statusOptions.find(s => s.value === stat)

  return found ? found.title : stat
}

// ─── Stats Widgets ──────────────────────────────
const widgetData = computed(() => [
  {
    title: 'Tổng số người dùng',
    value: stats.value.total ?? 0,
    subtitle: 'Tất cả người dùng đã đăng ký',
    icon: 'tabler-users',
    iconColor: 'info',
  },
  {
    title: 'Người dùng đang hoạt động',
    value: stats.value.active ?? 0,
    subtitle: 'Người dùng hiện đang hoạt động',
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Người dùng không hoạt động',
    value: stats.value.inactive ?? 0,
    subtitle: 'Người dùng không hoạt động',
    icon: 'tabler-user-x',
    iconColor: 'error',
  },
])

// ─── Create User ────────────────────────────────
const viewUser = id => {
  router.push({ name: 'apps-user-view-id', params: { id } })
}

const isUserFormVisible = ref(false)
const isEditing = ref(false)
const editingUserId = ref(null)

const defaultUserForm = {
  name: '',
  user_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  status: 'active',
}

const userFormData = ref({ ...defaultUserForm })
const userFormRef = ref()

const openAddUserForm = () => {
  isEditing.value = false
  editingUserId.value = null
  userFormData.value = { ...defaultUserForm }
  isUserFormVisible.value = true
}

const openEditUserForm = item => {
  isEditing.value = true
  editingUserId.value = item.id
  userFormData.value = {
    name: item.name,
    user_name: item.user_name,
    email: item.email,
    password: '',
    password_confirmation: '',
    status: item.status,
  }
  isUserFormVisible.value = true
}

const onSubmitUserForm = async () => {
  const { valid } = await userFormRef.value?.validate() ?? { valid: true }
  if (!valid) return

  if (!isEditing.value || userFormData.value.password) {
    if (userFormData.value.password !== userFormData.value.password_confirmation) {
      alert("Mật khẩu xác nhận không khớp!")
      
      return
    }
  }

  try {
    const payload = { ...userFormData.value }
    if (isEditing.value && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    if (isEditing.value) {
      await $api(`/users/${editingUserId.value}`, { method: 'PUT', body: payload })
    }
    else {
      await $api('/users', { method: 'POST', body: payload })
    }

    isUserFormVisible.value = false
    userFormData.value = { ...defaultUserForm }
    fetchUsers()
    fetchStats()
  }
  catch (err) {
    if (err.response?._data?.errors) {
      alert("Lỗi nhập liệu:\n" + Object.values(err.response._data.errors).map(x => x.join("\n")).join("\n"))
    } else {
      alert("Lỗi thêm cán bộ: " + (err.message || ""))
    }
    console.error('Submit user form error:', err)
  }
}

// ─── Delete User ────────────────────────────────
const deleteUser = async id => {
  await $api(`/users/${id}`, { method: 'DELETE' })

  const idx = selectedRows.value.findIndex(row => row === id)
  if (idx !== -1) selectedRows.value.splice(idx, 1)
  fetchUsers()
  fetchStats()
}

// ─── Bulk Operations ────────────────────────────
const bulkDeleteUsers = async () => {
  if (!selectedRows.value.length) return
  try {
    await $api('/users/bulk-delete', { method: 'POST', body: { ids: selectedRows.value } })
    selectedRows.value = []
    fetchUsers()
    fetchStats()
  }
  catch (err) {
    console.error('Bulk delete error:', err)
  }
}

const bulkChangeStatus = async newStatus => {
  if (!selectedRows.value.length) return
  try {
    await $api('/users/bulk-status', { method: 'PATCH', body: { ids: selectedRows.value, status: newStatus } })
    selectedRows.value = []
    fetchUsers()
    fetchStats()
  }
  catch (err) {
    console.error('Bulk status error:', err)
  }
}

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportUsers({
      search: searchQuery.value,
      status: selectedStatus.value,
      sort_by: sortBy.value,
      sort_order: orderBy.value,
      page: page.value,
      limit: itemsPerPage.value,
    })

    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Export error:', err)
  }
  finally {
    isExporting.value = false
  }
}

// ─── Import ─────────────────────────────────────
const isImportDialogVisible = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

const handleImport = async () => {
  if (!importFile.value) return
  isImporting.value = true
  try {
    await importUsers(importFile.value)
    isImportDialogVisible.value = false
    importFile.value = null
    fetchUsers()
    fetchStats()
  }
  catch (err) {
    console.error('Import error:', err)
  }
  finally {
    isImporting.value = false
  }
}

// ─── Download Template ──────────────────────────
const isDownloadingTemplate = ref(false)

const handleDownloadTemplate = async () => {
  isDownloadingTemplate.value = true
  try {
    const blob = await downloadUserTemplate()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'users_template.xlsx'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Download template error:', err)
  }
  finally {
    isDownloadingTemplate.value = false
  }
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
          md="4"
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
              label="Tìm kiếm người dùng"
              placeholder="Nhập tên người dùng"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedRole"
              :items="roles"
              item-title="name"
              item-value="id"
              label="Vai trò"
              placeholder="Chọn vai trò"
              clearable
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
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedStatus"
              :items="statusOptions"
              label="Trạng thái"
              placeholder="Chọn trạng thái"
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
          v-if="$can('import', 'User')"
          variant="outlined"
          color="primary"
          @click="isImportDialogVisible = true"
        >
          <VIcon
            icon="tabler-upload"
            start
          /> Nhập Dữ Liệu
        </VBtn>
        <VBtn
          v-if="$can('export', 'User')"
          variant="outlined"
          color="primary"
          :loading="isExporting"
          @click="handleExport"
        >
          <VIcon
            icon="tabler-download"
            start
          /> Xuất Dữ Liệu
        </VBtn>
        <VBtn
          v-if="$can('create', 'User')"
          color="primary"
          @click="openAddUserForm"
        >
          <VIcon
            icon="tabler-plus"
            start
          /> Thêm Mới
        </VBtn>
      </VCardText>
      <!-- 👉 Bulk Action Bar -->
      <template v-if="selectedRows.length > 0">
        <VDivider />
        <VCardText class="d-flex align-center gap-3">
          <span class="text-body-1 font-weight-medium">
            Đã chọn {{ selectedRows.length }} mục
          </span>
          <VSpacer />
          <VBtn
            v-if="$can('bulkDestroy', 'User')"
            variant="tonal"
            color="error"
            size="small"
            prepend-icon="tabler-trash"
            @click="bulkDeleteUsers"
          >
            Xóa hàng loạt
          </VBtn>
          <VMenu>
            <template #activator="{ props }">
              <VBtn
                v-if="$can('bulkUpdateStatus', 'User')"
                v-bind="props"
                variant="tonal"
                color="warning"
                size="small"
                prepend-icon="tabler-toggle-left"
              >
                Đổi trạng thái
              </VBtn>
            </template>
            <VList>
              <VListItem
                v-for="s in statusOptions"
                :key="s.value"
                @click="bulkChangeStatus(s.value)"
              >
                <VListItemTitle>{{ s.title }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
          <VBtn
            variant="text"
            size="small"
            @click="selectedRows = []"
          >
            Bỏ chọn
          </VBtn>
        </VCardText>
      </template>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="users"
        item-value="id"
        :items-length="totalUsers"
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

        <!-- Cán bộ -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              variant="tonal"
              color="info"
            >
              <span>{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base font-weight-medium text-high-emphasis">
                {{ item.name }}
              </h6>
              <div class="text-caption mt-1">
                <VChip
                  size="x-small"
                  color="info"
                  variant="flat"
                >
                  {{ item.user_name }}
                </VChip>
              </div>
            </div>
          </div>
        </template>

        <!-- Tổ chức & Vai trò -->
        <template #item.roles="{ item }">
          <div class="d-flex flex-column gap-3 py-2">
            <div
              v-for="assign in item.assignments"
              :key="assign.role_id"
              class="d-flex flex-column"
            >
              <div class="d-flex align-center gap-2 text-body-2 text-high-emphasis font-weight-medium">
                <VIcon
                  icon="tabler-shield"
                  size="18"
                  color="success"
                /> {{ getRoleName(assign.role_id) }}
              </div>
              <div class="d-flex gap-1 mt-1 flex-wrap pl-6">
                <VChip
                  v-for="orgId in assign.organization_ids"
                  :key="orgId"
                  size="x-small"
                  color="info"
                  class="rounded"
                >
                  {{ getOrgName(orgId) }}
                </VChip>
              </div>
            </div>
          </div>
        </template>

        <!-- Ngày cập nhật -->
        <template #item.updated_at="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar
              color="primary"
              variant="tonal"
              size="28"
            >
              <VIcon
                icon="tabler-clock"
                size="16"
              />
            </VAvatar>
            <span class="text-body-2 text-info font-weight-medium">{{ formatDate(item.updated_at || item.created_at) }}</span>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize px-3"
            variant="tonal"
          >
            {{ resolveStatusText(item.status) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <IconBtn
              variant="text"
              color="info"
              size="small"
              @click="viewUser(item.id)"
            >
              <VIcon
                icon="tabler-eye"
                size="20"
              />
            </IconBtn>
            <IconBtn
              v-if="$can('update', 'User')"
              variant="text"
              color="primary"
              size="small"
              :to="{ name: 'apps-user-edit-id', params: { id: item.id } }"
            >
              <VIcon
                icon="tabler-pencil"
                stroke="1.5"
                size="20"
              />
            </IconBtn>
            <IconBtn
              v-if="$can('delete', 'User')"
              variant="text"
              color="error"
              size="small"
              @click="deleteUser(item.id)"
            >
              <VIcon
                icon="tabler-trash"
                stroke="1.5"
                size="20"
              />
            </IconBtn>
          </div>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>

    <!-- 👉 User Form Form (Add/Edit) -->
    <VDialog
      v-model="isUserFormVisible"
      max-width="800"
    >
      <VCard :title="isEditing ? 'Sửa Cán bộ' : 'Thêm Cán bộ mới'">
        <VCardText>
          <VForm
            ref="userFormRef"
            @submit.prevent="onSubmitUserForm"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="userFormData.name"
                  :rules="[requiredValidator]"
                  label="Họ và Tên"
                  placeholder="Nguyễn Văn A"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userFormData.user_name"
                  :rules="[requiredValidator]"
                  label="Tên đăng nhập"
                  placeholder="nguyenvana"
                  :disabled="isEditing"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userFormData.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="email@example.com"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userFormData.password"
                  :rules="isEditing ? [] : [requiredValidator]"
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••"
                  :hint="isEditing ? 'Bỏ trống nếu không đổi mật khẩu' : ''"
                  persistent-hint
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userFormData.password_confirmation"
                  :rules="isEditing ? [] : [requiredValidator]"
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="••••••"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="userFormData.status"
                  label="Trạng thái"
                  :items="statusOptions"
                />
              </VCol>
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Lưu
                </VBtn>
                <VBtn
                  variant="tonal"
                  color="error"
                  @click="isUserFormVisible = false"
                >
                  Hủy
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 Import Dialog -->
    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập dữ liệu từ Excel">
        <VCardText>
          <div class="mb-5">
            <VBtn
              variant="tonal"
              color="success"
              size="small"
              prepend-icon="tabler-download"
              :loading="isDownloadingTemplate"
              @click="handleDownloadTemplate"
            >
              Tải File Mẫu
            </VBtn>
            <div class="text-caption mt-1 text-disabled">
              * Vui lòng tải file mẫu về, điền dữ liệu và upload lại hệ thống.
            </div>
          </div>
          
          <VFileInput
            v-model="importFile"
            label="Chọn file Excel"
            accept=".xlsx,.xls,.csv"
            prepend-icon="tabler-file-spreadsheet"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            @click="isImportDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            @click="handleImport"
          >
            Nhập
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
