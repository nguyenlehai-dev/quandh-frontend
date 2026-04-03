<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import { useRouter } from 'vue-router'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import AuthDataActions from '../../shared/AuthDataActions.vue'
import {
  bulkDeleteUsers as bulkDeleteUsersRequest,
  bulkUpdateUserStatus,
  changeUserStatus as changeUserStatusRequest,
  deleteUser as deleteUserRequest,
  downloadUserImportTemplate,
  fetchUserStats,
  fetchUsers as fetchUsersRequest,
  importUsers,
} from '../services/userService'

const { t } = useI18n()
const router = useRouter()

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

const headers = [
  { title: t('user.user.headers.index'), key: 'index', sortable: false, width: 60 },
  { title: t('user.user.headers.name'), key: 'name' },
  { title: t('user.user.headers.email'), key: 'email' },
  { title: t('user.user.headers.roles'), key: 'roles', sortable: false },
  { title: t('user.user.headers.updated_at'), key: 'updated_at', sortable: false },
  { title: t('user.user.headers.status'), key: 'status', sortable: false },
  { title: t('user.user.headers.actions'), key: 'actions', sortable: false },
]

const users = ref([])
const totalUsers = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })
const roles = ref([])
const organizations = ref([])

const fetchDependencies = async () => {
  try {
    const [rRes, oRes] = await Promise.allSettled([
      $api('/roles?limit=100'),
      $api('/organizations?limit=100'),
    ])

    roles.value = rRes.status === 'fulfilled' && rRes.value
      ? (rRes.value.data?.data || rRes.value.data || [])
      : []
    organizations.value = oRes.status === 'fulfilled' && oRes.value
      ? (oRes.value.data?.data || oRes.value.data || [])
      : []
  }
  catch (err) {
    console.error('Fetch dependencies error:', err)
    roles.value = []
    organizations.value = []
  }
}

const getRoleName = roleId => {
  const role = roles.value.find(item => item.id === roleId)

  return role ? role.name : roleId
}

const getOrgName = orgId => {
  const organization = organizations.value.find(item => item.id === orgId)

  return organization ? organization.name : orgId
}

const buildListParams = () => ({
  search: searchQuery.value || undefined,
  status: selectedStatus.value || undefined,
  limit: itemsPerPage.value,
  page: page.value,
  sort_by: sortBy.value,
  sort_order: orderBy.value,
})

const buildExportParams = () => ({
  ...buildListParams(),
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetchUsersRequest(buildListParams())

    users.value = response.data ?? []
    totalUsers.value = response.meta?.total ?? response.total ?? 0
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
    const response = await fetchUserStats({
      search: searchQuery.value,
      status: selectedStatus.value,
    })

    stats.value = response.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (err) {
    console.error('Fetch stats error:', err)
  }
}

let filterTimeout
watch([searchQuery, selectedStatus], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
    fetchStats()
  }, 300)
})

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchUsers()
})

onMounted(() => {
  fetchUsers()
  fetchStats()
  fetchDependencies()
})

const statusOptions = [
  { title: t('user.user.status.active'), value: 'active' },
  { title: t('user.user.status.inactive'), value: 'inactive' },
  { title: t('user.user.status.banned'), value: 'banned' },
]

const normalizeUserStatus = stat => {
  const normalized = `${stat || ''}`.toLowerCase()

  if (normalized === 'active') return 'active'
  if (normalized === 'banned') return 'banned'

  return 'inactive'
}

const resolveUserStatusVariant = stat => {
  const status = normalizeUserStatus(stat)

  if (status === 'active') return 'success'
  if (status === 'inactive') return 'warning'
  if (status === 'banned') return 'error'

  return 'primary'
}

const resolveStatusText = stat => {
  const found = statusOptions.find(item => item.value === normalizeUserStatus(stat))

  return found ? found.title : stat
}

const widgetData = computed(() => [
  {
    title: t('user.user.widgets.total_title'),
    value: stats.value.total ?? 0,
    subtitle: t('user.user.widgets.total_subtitle'),
    icon: 'tabler-users',
    iconColor: 'info',
  },
  {
    title: t('user.user.widgets.active_title'),
    value: stats.value.active ?? 0,
    subtitle: t('user.user.widgets.active_subtitle'),
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: t('user.user.widgets.inactive_title'),
    value: stats.value.inactive ?? 0,
    subtitle: t('user.user.widgets.inactive_subtitle'),
    icon: 'tabler-user-x',
    iconColor: 'error',
  },
])

const viewUser = id => {
  router.push({ name: 'apps-user-view-id', params: { id } })
}

const openCreateUserPage = () => {
  router.push({ name: 'apps-user-create' })
}

const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })
const { snackbar, showSuccess, showError } = useActionFeedback()

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return

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

const deleteUser = id => {
  openConfirmDialog({
    title: 'Xoa nguoi dung',
    message: 'Ban co chac chan muon xoa nguoi dung nay khong?',
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteUserRequest(id)

      const idx = selectedRows.value.findIndex(row => row === id)
      if (idx !== -1) selectedRows.value.splice(idx, 1)

      showSuccess('Xoa nguoi dung thanh cong.')
      fetchUsers()
      fetchStats()
    },
  })
}

const bulkDeleteUsers = () => {
  if (!selectedRows.value.length) return

  openConfirmDialog({
    title: 'Xoa hang loat nguoi dung',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} nguoi dung da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteUsersRequest(selectedRows.value)
      selectedRows.value = []
      showSuccess('Xoa hang loat nguoi dung thanh cong.')
      fetchUsers()
      fetchStats()
    },
  })
}

const bulkChangeStatus = newStatus => {
  if (!selectedRows.value.length) return

  const nextLabel = resolveStatusText(newStatus)

  openConfirmDialog({
    title: 'Doi trang thai hang loat',
    message: `Ban co chac chan muon chuyen ${selectedRows.value.length} nguoi dung da chon sang "${nextLabel}" khong?`,
    confirmText: 'Doi trang thai',
    confirmColor: 'warning',
    action: async () => {
      await bulkUpdateUserStatus(selectedRows.value, newStatus)
      selectedRows.value = []
      showSuccess('Cap nhat trang thai hang loat thanh cong.')
      fetchUsers()
      fetchStats()
    },
  })
}

const changeUserStatus = (item, newStatus) => {
  const nextLabel = resolveStatusText(newStatus)

  openConfirmDialog({
    title: 'Doi trang thai nguoi dung',
    message: `Ban co chac chan muon chuyen "${item.name}" sang "${nextLabel}" khong?`,
    confirmText: 'Doi trang thai',
    confirmColor: 'warning',
    action: async () => {
      await changeUserStatusRequest(item.id, newStatus)
      showSuccess('Cap nhat trang thai nguoi dung thanh cong.')
      fetchUsers()
      fetchStats()
    },
  })
}

const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    if (selectedRows.value.length) {
      const selectedUsers = users.value.filter(item => selectedRows.value.includes(item.id))

      exportRowsToExcel({
        rows: selectedUsers.map(item => ({
          name: item.name || '',
          email: item.email || '',
          user_name: item.user_name || '',
          status: normalizeUserStatus(item.status),
          roles: (item.assignments || [])
            .map(assign => `${getRoleName(assign.role_id)} (${(assign.organization_ids || []).map(getOrgName).join(', ')})`)
            .join(' | '),
          updated_at: formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
        })),
        headers: ['name', 'email', 'user_name', 'status', 'roles', 'updated_at'],
        sheetName: 'Users',
        fileName: `users_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 28 },
          { wch: 32 },
          { wch: 22 },
          { wch: 14 },
          { wch: 48 },
          { wch: 22 },
        ],
      })

      return
    }

    const blob = await $api(`/users/export?${buildAuthQueryString(buildExportParams())}`, {
      responseType: 'blob',
    })

    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    showError(err, 'Khong the xuat du lieu nguoi dung.')
    console.error('Export error:', err)
  }
  finally {
    isExporting.value = false
  }
}

const handleImport = async file => {
  try {
    await importUsers(file)
    showSuccess('Import du lieu nguoi dung thanh cong.')
    fetchUsers()
    fetchStats()
  }
  catch (err) {
    showError(err, 'Khong the import du lieu nguoi dung.')
    console.error('Import error:', err)
  }
}
</script>

<template>
  <div>
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

    <VCard class="organization-main-card mb-6">
      <VCardItem class="pb-4 organization-main-card__header">
        <template #prepend>
          <div class="d-flex align-center organization-toolbar-title">
            <VIcon
              icon="tabler-filter"
              color="primary"
              size="24"
              class="me-2"
            />
            <h5 class="text-h5 text-primary mb-0 font-weight-medium">
              {{ t('user.user.list.filter') }}
            </h5>
          </div>
        </template>

        <template #append>
          <AuthDataActions
            :show-import="$can('import', 'User')"
            :show-template="$can('import', 'User')"
            :show-export="$can('export', 'User')"
            :show-create="$can('create', 'User')"
            :create-label="t('user.user.list.add_new')"
            :import-label="t('user.user.list.import_data')"
            import-subtitle="Nap file Excel vao he thong"
            template-label="Tai file mau import"
            template-subtitle="Lay mau Excel dung cot ma backend dang nhan"
            :export-label="t('user.user.list.export_data')"
            export-subtitle="Xuat danh sach hien tai ra file"
            :import-dialog-title="t('user.user.list.import_dialog_title')"
            :import-hint="t('user.user.list.import_hint')"
            :select-file-label="t('user.user.list.select_excel')"
            :cancel-text="t('user.user.list.cancel')"
            :import-text="t('user.user.list.import')"
            :export-loading="isExporting"
            :import-handler="handleImport"
            :template-handler="downloadUserImportTemplate"
            :export-handler="handleExport"
            :create-handler="openCreateUserPage"
          />
        </template>
      </VCardItem>

      <VCardText class="pb-6 organization-filter-panel">
        <VRow>
          <VCol
            cols="12"
            md="9"
            class="organization-filter-col"
          >
            <AppTextField
              v-model="searchQuery"
              class="organization-filter-input"
              :label="t('user.user.list.search_label')"
              :placeholder="t('user.user.list.search_placeholder')"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
            class="organization-filter-col"
          >
            <AppSelect
              v-model="selectedStatus"
              class="organization-filter-input"
              :items="statusOptions"
              :label="t('user.user.list.status_label')"
              :placeholder="t('user.user.list.status_placeholder')"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <template v-if="selectedRows.length > 0">
        <VDivider />
        <VCardText class="d-flex align-center gap-3">
          <span class="text-body-1 font-weight-medium">
            {{ t('user.user.list.selected_count', { count: selectedRows.length }) }}
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
            {{ t('user.user.list.bulk_delete') }}
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
                {{ t('user.user.list.change_status') }}
              </VBtn>
            </template>
            <VList>
              <VListItem
                v-for="status in statusOptions"
                :key="status.value"
                @click="bulkChangeStatus(status.value)"
              >
                <VListItemTitle>{{ status.title }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
          <VBtn
            variant="text"
            size="small"
            @click="selectedRows = []"
          >
            {{ t('user.user.list.clear_selection') }}
          </VBtn>
        </VCardText>
      </template>

      <VDivider />

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
        <template #item.index="{ index }">
          <div class="text-body-2">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </div>
        </template>

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
              <div
                class="d-flex gap-1 mt-1 flex-wrap"
                style="padding-inline-start: 24px;"
              >
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
            <span class="text-body-2 text-info font-weight-medium">{{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('user.user.list.no_update') }) }}</span>
          </div>
        </template>

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
            <VMenu v-if="$can('update', 'User')">
              <template #activator="{ props }">
                <IconBtn
                  variant="text"
                  color="warning"
                  size="small"
                  v-bind="props"
                >
                  <VIcon
                    icon="tabler-toggle-right"
                    size="20"
                  />
                </IconBtn>
              </template>
              <VList>
                <VListItem
                  v-for="status in statusOptions.filter(option => option.value !== normalizeUserStatus(item.status))"
                  :key="status.value"
                  @click="changeUserStatus(item, status.value)"
                >
                  <VListItemTitle>{{ status.title }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
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

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
    </VCard>

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

<style scoped>
.organization-main-card__header {
  padding-block-end: 8px;
}

.organization-toolbar-title {
  min-height: 40px;
}

.organization-filter-panel {
  padding-block-start: 8px;
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-primary), 0.015));
}

.organization-filter-col {
  display: flex;
  align-items: center;
}

.organization-filter-input {
  flex: 1 1 auto;
}

.organization-filter-input :deep(.v-input) {
  inline-size: 100%;
}

.organization-filter-input :deep(.v-field) {
  min-block-size: 46px;
}

.organization-filter-input :deep(.v-field__input) {
  align-items: center;
  min-block-size: 46px;
  padding-block: 0;
}

.organization-filter-input :deep(.v-label) {
  margin-block-end: 6px;
}

@media (max-width: 959px) {
  .organization-main-card__header {
    padding-block-end: 8px;
  }
}

@media (max-width: 600px) {
  .organization-toolbar-title {
    min-height: auto;
    align-items: center;
  }

  .organization-filter-col {
    inline-size: 100%;
  }
}
</style>
