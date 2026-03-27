<script setup>
import { useUserStore } from '../stores/useUserStore'
import { exportUsers, importUsers } from '../services/userService'
import UserDetailDialog from '../components/UserDetailDialog.vue'
import UserRoleAssignmentDialog from '../components/UserRoleAssignmentDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()

// ─── Filters & Table State ──────────────────────
const searchQuery = ref('')
const selectedStatus = ref()
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
  { title: 'Cán bộ', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Tên đăng nhập', key: 'user_name' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// ─── Data ──────────────────────────────────────
const users = ref([])
const totalUsers = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await $api('/users', {
      params: {
        search: searchQuery.value,
        status: selectedStatus.value,
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

// Debounce search/filter changes
watchDebounced([searchQuery, selectedStatus], () => {
  page.value = 1
  fetchUsers()
  fetchStats()
}, { debounce: 500 })

// Pagination/sort changes
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchUsers()
})

// Initial fetch
onMounted(() => {
  fetchUsers()
  fetchStats()
})

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
    title: 'Tổng cán bộ',
    value: stats.value.total ?? 0,
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: 'Đang hoạt động',
    value: stats.value.active ?? 0,
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Không hoạt động',
    value: stats.value.inactive ?? 0,
    icon: 'tabler-user-off',
    iconColor: 'warning',
  },
])

// ─── Create User ────────────────────────────────
const isUserDetailDialogVisible = ref(false)
const selectedUserId = ref(null)

const viewUser = id => {
  selectedUserId.value = id
  isUserDetailDialogVisible.value = true
}

// ─── Role Assignment Dialog ─────────────────────
const isRoleAssignmentVisible = ref(false)
const roleAssignmentUserId = ref(null)

const openRoleAssignment = id => {
  roleAssignmentUserId.value = id
  isRoleAssignmentVisible.value = true
}

const onRoleAssignmentSaved = () => {
  fetchUsers()
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
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
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

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ t('common.common.labels.filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Chọn trạng thái"
              :items="statusOptions"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: t('common.common.labels.all') },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('user.user.list.search')"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            v-if="$can('export', 'User')"
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
            :loading="isExporting"
            @click="handleExport"
          >
            {{ t('common.common.actions.export') }}
          </VBtn>

          <!-- 👉 Import button -->
          <VBtn
            v-if="$can('import', 'User')"
            variant="tonal"
            color="info"
            prepend-icon="tabler-download"
            @click="isImportDialogVisible = true"
          >
            Nhập Excel
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            v-if="$can('create', 'User')"
            prepend-icon="tabler-plus"
            @click="openAddUserForm"
          >
            {{ t('user.user.list.add') }}
          </VBtn>
        </div>
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
        <!-- Cán bộ -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              variant="tonal"
              color="primary"
            >
              <span>{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base font-weight-medium">
                {{ item.name }}
              </h6>
              <div class="text-sm text-disabled">
                @{{ item.user_name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ resolveStatusText(item.status) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('delete', 'User')"
            @click="deleteUser(item.id)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn :to="{ name: 'apps-user-view-id', params: { id: item.id } }" style="display: none;">
            <!-- Keeping the route link just hidden in case, but using manual click to open modal -->
          </IconBtn>
          <IconBtn @click="viewUser(item.id)">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem @click="viewUser(item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.view') }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="$can('update', 'User')"
                  @click="openRoleAssignment(item.id)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-shield-lock" />
                  </template>
                  <VListItemTitle>Phân quyền</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="$can('update', 'User')"
                  @click="openEditUserForm(item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.edit') }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="$can('delete', 'User')"
                  @click="deleteUser(item.id)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.delete') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
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
          <VForm @submit.prevent="onSubmitUserForm">
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
    <!-- 👉 User Role Assignment Modal -->
    <UserRoleAssignmentDialog
      v-model:is-dialog-visible="isRoleAssignmentVisible"
      :user-id="roleAssignmentUserId"
      @saved="onRoleAssignmentSaved"
    />

    <!-- 👉 User Detail Modal -->
    <UserDetailDialog
      v-model:is-dialog-visible="isUserDetailDialogVisible"
      :user-id="selectedUserId"
    />
  </div>
</template>
