<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import { getCoreOrganizationOptions } from '@/modules/organization/services/coreOrganizations'
import { getCoreRoles } from '@/modules/role-permission/services/coreRoles'
import ExportUserDialog from '@/modules/user-management/components/ExportUserDialog.vue'
import ImportUserDialog from '@/modules/user-management/components/ImportUserDialog.vue'
import {
  bulkDeleteCoreUsers,
  bulkUpdateCoreUserStatus,
  changeCoreUserStatus,
  deleteCoreUser,
  downloadCoreUsersExport,
  downloadCoreUsersTemplate,
  getCoreUserStats,
  getCoreUsers,
  importCoreUsers,
} from '@/modules/user-management/services/coreUsers'
import { mapCoreUserSortField, mapCoreUserToViewModel } from '@/modules/user-management/utils/coreUserAdapters'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const searchQuery = ref('')
const selectedRole = ref()
const selectedOrganization = ref()
const selectedStatus = ref()
const fromDate = ref('')
const toDate = ref('')
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const pendingDeleteUserId = ref(null)
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const selectedBulkAction = ref()
const isLoading = ref(false)

const rawUsers = ref([])
const roles = ref([])
const organizationOptions = ref([])
const userStats = ref({
  active: 0,
  inactive: 0,
  total: 0,
})

const headers = computed(() => [
  { title: t('User'), key: 'user' },
  { title: t('Roles'), key: 'role' },
  { title: t('Organization'), key: 'organization' },
  { title: t('Updated By'), key: 'updatedBy' },
  { title: t('Status'), key: 'status' },
  { title: t('Actions'), key: 'actions', sortable: false },
])

const statusOptions = computed(() => [
  { title: t('Active'), value: 'active' },
  { title: t('Inactive'), value: 'inactive' },
  { title: 'Banned', value: 'banned' },
])

const bulkActions = computed(() => [
  { title: t('Activate'), value: 'active' },
  { title: t('Deactivate'), value: 'inactive' },
  { title: 'Banned', value: 'banned' },
  { title: t('Delete'), value: 'delete' },
])

const organizationItems = computed(() => organizationOptions.value.map(item => ({
  title: item.name,
  value: item.id,
})))
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const widgetData = computed(() => [
  {
    title: t('Total Users'),
    value: `${userStats.value.total}`,
    change: 0,
    desc: t('Total Users'),
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: t('Active Users'),
    value: `${userStats.value.active}`,
    change: 0,
    desc: t('Active'),
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: t('Inactive Users'),
    value: `${userStats.value.inactive}`,
    change: 0,
    desc: t('Inactive'),
    icon: 'tabler-user-off',
    iconColor: 'secondary',
  },
  {
    title: t('Roles'),
    value: `${roles.value.length}`,
    change: 0,
    desc: t('Available Roles'),
    icon: 'tabler-shield-lock',
    iconColor: 'info',
  },
])

const filteredUsers = computed(() => rawUsers.value.filter(user => {
  const matchesRole = selectedRole.value ? user.roleIds.includes(Number(selectedRole.value)) : true
  const matchesOrganization = selectedOrganization.value ? user.organizationIds.includes(Number(selectedOrganization.value)) : true

  return matchesRole && matchesOrganization
}))

const sortedUsers = computed(() => {
  if (!sortBy.value || !orderBy.value)
    return filteredUsers.value

  return [...filteredUsers.value].sort((firstUser, secondUser) => {
    const firstValue = Array.isArray(firstUser[sortBy.value]) ? firstUser[sortBy.value].join(', ') : firstUser[sortBy.value] ?? ''
    const secondValue = Array.isArray(secondUser[sortBy.value]) ? secondUser[sortBy.value].join(', ') : secondUser[sortBy.value] ?? ''
    const comparison = String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true, sensitivity: 'base' })

    return orderBy.value === 'asc' ? comparison : comparison * -1
  })
})

const users = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage.value

  return sortedUsers.value.slice(startIndex, startIndex + itemsPerPage.value)
})

const totalUsers = computed(() => sortedUsers.value.length)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resolveUserRoleVariant = role => {
  const roleLowerCase = String(role ?? '').toLowerCase()

  if (roleLowerCase.includes('admin'))
    return { color: 'primary', icon: 'tabler-crown' }
  if (roleLowerCase.includes('editor') || roleLowerCase.includes('biên tập'))
    return { color: 'warning', icon: 'tabler-edit' }
  if (roleLowerCase.includes('report') || roleLowerCase.includes('báo cáo'))
    return { color: 'error', icon: 'tabler-file-text' }
  if (roleLowerCase.includes('user'))
    return { color: 'success', icon: 'tabler-user' }
  if (roleLowerCase.includes('maintain') || roleLowerCase.includes('vận hành'))
    return { color: 'info', icon: 'tabler-settings' }

  return { color: 'secondary', icon: 'tabler-shield' }
}

const resolveUserStatusVariant = stat => {
  const statLowerCase = String(stat ?? '').toLowerCase()

  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'
  if (statLowerCase === 'banned')
    return 'error'

  return 'primary'
}

const exportUsersToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => ({
    createdAt: item.createdAt,
    createdBy: item.createdBy,
    email: item.email,
    name: item.fullName,
    organizations: item.organizations.join(', '),
    roles: item.roles.join(', '),
    status: item.status,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
    userName: item.username,
  })))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
  XLSX.writeFileXLSX(workbook, fileName)
}

const loadReferenceData = async () => {
  const [rolesResult, organizationsResult] = await Promise.allSettled([
    getCoreRoles({ limit: 100, sortBy: 'created_at', sortOrder: 'desc' }),
    getCoreOrganizationOptions({ limit: 100, status: 'active', sortBy: 'created_at', sortOrder: 'desc' }),
  ])

  roles.value = rolesResult.status === 'fulfilled'
    ? (rolesResult.value.data ?? []).map(role => ({
      title: role.name,
      value: role.id,
    }))
    : []

  organizationOptions.value = organizationsResult.status === 'fulfilled'
    ? organizationsResult.value.data ?? []
    : []

  const referenceError = rolesResult.status === 'rejected'
    ? rolesResult.reason
    : organizationsResult.status === 'rejected'
      ? organizationsResult.reason
      : null

  if (referenceError) {
    showSnackbar(
      isCoreForbiddenError(referenceError)
        ? 'Tài khoản hiện tại không có quyền tải đủ dữ liệu tham chiếu của người dùng.'
        : getCoreErrorMessage(referenceError, 'Không thể tải dữ liệu tham chiếu của người dùng.'),
      'error',
    )
  }
}

const fetchUsersFromCore = async () => {
  isLoading.value = true

  try {
    let currentPage = 1
    let lastPage = 1
    const nextUsers = []

    do {
      const response = await getCoreUsers({
        fromDate: fromDate.value,
        limit: 100,
        page: currentPage,
        search: normalizedSearchQuery.value,
        sortBy: mapCoreUserSortField(sortBy.value),
        sortOrder: orderBy.value || 'desc',
        status: selectedStatus.value,
        toDate: toDate.value,
      })

      nextUsers.push(...(response.data ?? []).map(mapCoreUserToViewModel))
      lastPage = response.meta?.last_page ?? 1
      currentPage += 1
    } while (currentPage <= lastPage)

    rawUsers.value = nextUsers
  }
  catch (error) {
    rawUsers.value = []
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const fetchUserStats = async () => {
  try {
    const response = await getCoreUserStats({
      fromDate: fromDate.value,
      search: normalizedSearchQuery.value,
      status: selectedStatus.value,
      toDate: toDate.value,
    })

    userStats.value = response.data ?? {
      active: 0,
      inactive: 0,
      total: 0,
    }
  }
  catch (error) {
    userStats.value = {
      active: 0,
      inactive: 0,
      total: 0,
    }

    throw error
  }
}

const refreshUsers = async () => {
  const results = await Promise.allSettled([
    fetchUsersFromCore(),
    fetchUserStats(),
  ])

  const failedResult = results.find(result => result.status === 'rejected')

  if (failedResult?.reason) {
    showSnackbar(
      isCoreForbiddenError(failedResult.reason)
        ? 'Tài khoản hiện tại không có quyền truy cập danh sách người dùng.'
        : getCoreErrorMessage(failedResult.reason, 'Không thể tải danh sách người dùng.'),
      'error',
    )
  }
}

const deleteUser = async id => {
  await deleteCoreUser(id)
  selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  await refreshUsers()
  showSnackbar('Đã xóa người dùng thành công.')
}

const toggleUserStatus = async item => {
  const nextStatus = item.status === 'active' ? 'inactive' : 'active'

  await changeCoreUserStatus(item.id, nextStatus)
  await refreshUsers()
  showSnackbar('Đã cập nhật trạng thái người dùng.')
}

const requestDeleteUser = id => {
  pendingDeleteUserId.value = id
  isDeleteDialogVisible.value = true
}

const confirmDeleteUser = async isConfirmed => {
  if (!isConfirmed || pendingDeleteUserId.value === null)
    return

  await deleteUser(pendingDeleteUserId.value)
  pendingDeleteUserId.value = null
}

const handleBulkAction = async action => {
  if (!action || !selectedRows.value.length)
    return

  const selectedIds = [...selectedRows.value]

  if (action === 'delete') {
    await bulkDeleteCoreUsers(selectedIds)
    showSnackbar('Đã xóa các người dùng đã chọn.')
  }
  else {
    await bulkUpdateCoreUserStatus(selectedIds, action)
    showSnackbar('Đã cập nhật trạng thái cho các người dùng đã chọn.')
  }

  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshUsers()
}

const handleExportUsers = async scope => {
  if (scope === 'selected') {
    exportUsersToWorkbook(sortedUsers.value.filter(item => selectedRows.value.includes(item.id)), `users-selected-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  if (scope === 'page') {
    exportUsersToWorkbook(users.value, `users-page-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  if (!selectedRole.value && !selectedOrganization.value) {
    await downloadCoreUsersExport({
      fromDate: fromDate.value,
      search: normalizedSearchQuery.value,
      sortBy: mapCoreUserSortField(sortBy.value),
      sortOrder: orderBy.value || 'desc',
      status: selectedStatus.value,
      toDate: toDate.value,
    })
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  exportUsersToWorkbook(sortedUsers.value, `users-filtered-${ new Date().toISOString().slice(0, 10) }.xlsx`)
  showSnackbar('Đã xuất dữ liệu người dùng thành công.')
}

const handleImportUsers = async file => {
  await importCoreUsers(file)
  await refreshUsers()
  showSnackbar('Đã nhập dữ liệu người dùng thành công.')
}

const handleDownloadUserTemplate = async () => {
  await downloadCoreUsersTemplate()
  showSnackbar('Đã tải file mẫu người dùng.')
}

const refreshUsersDebounced = useDebounceFn(async () => {
  page.value = 1
  await refreshUsers()
}, 300)

watch([searchQuery, selectedStatus, fromDate, toDate], refreshUsersDebounced)
watch([selectedRole, selectedOrganization, itemsPerPage], () => {
  page.value = 1
})

onMounted(async () => {
  hydratePendingSnackbar()
  await loadReferenceData()
  await refreshUsers()
})
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template
          v-for="(data, id) in widgetData"
          :key="id"
        >
          <VCol
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
                    <div class="d-flex gap-x-2 align-center">
                      <h4 class="text-h4">
                        {{ data.value }}
                      </h4>
                      <div
                        class="text-base"
                        :class="data.change > 0 ? 'text-success' : data.change < 0 ? 'text-error' : 'text-medium-emphasis'"
                      >
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
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
        </template>
      </VRow>
    </div>

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              :placeholder="$t('Search users')"
            />
          </VCol>

          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppSelect
              v-model="selectedRole"
              :placeholder="$t('Select role')"
              :items="roles"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppSelect
              v-model="selectedOrganization"
              :placeholder="$t('Select organization')"
              :items="organizationItems"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppSelect
              v-model="selectedStatus"
              :placeholder="$t('Select status')"
              :items="statusOptions"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppDateTimePicker
              v-model="fromDate"
              :placeholder="$t('From Date')"
              :config="{ dateFormat: 'Y-m-d' }"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppDateTimePicker
              v-model="toDate"
              :placeholder="$t('To Date')"
              :config="{ dateFormat: 'Y-m-d' }"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <div
          v-if="selectedRows.length"
          class="d-flex align-center gap-3 flex-wrap"
        >
          <AppSelect
            v-model="selectedBulkAction"
            :placeholder="$t('Action')"
            :items="bulkActions"
            style="inline-size: 13rem;"
            @update:model-value="handleBulkAction"
          />
        </div>

        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-download"
            @click="isImportDialogVisible = true"
          >
            {{ $t('Import') }}
          </VBtn>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
            @click="isExportDialogVisible = true"
          >
            {{ $t('Export') }}
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{ name: 'apps-user-create' }"
          >
            {{ $t('Add New User') }}
          </VBtn>
        </div>
      </VCardText>

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
        :loading="isLoading"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              :color="!item.avatar ? resolveUserRoleVariant(item.role).color : undefined"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.fullName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.fullName }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <template #item.role="{ item }">
          <div class="d-flex flex-wrap gap-2">
            <VChip
              v-for="roleName in item.roles"
              :key="`${item.id}-${roleName}`"
              size="small"
              label
              :color="resolveUserRoleVariant(roleName).color"
              class="font-weight-medium"
            >
              {{ roleName }}
            </VChip>
          </div>
        </template>

        <template #item.organization="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.organizations.join(', ') || 'N/A' }}
          </div>
        </template>

        <template #item.updatedBy="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.updatedBy || 'N/A' }}
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
            {{ item.status }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="requestDeleteUser(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <IconBtn :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>

                  <VListItemTitle>{{ $t('View') }}</VListItemTitle>
                </VListItem>

                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>{{ $t('Edit') }}</VListItemTitle>
                </VListItem>

                <VListItem @click="requestDeleteUser(item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ $t('Delete') }}</VListItemTitle>
                </VListItem>

                <VListItem @click="toggleUserStatus(item)">
                  <template #prepend>
                    <VIcon :icon="item.status === 'active' ? 'tabler-user-off' : 'tabler-user-check'" />
                  </template>
                  <VListItemTitle>{{ item.status === 'active' ? $t('Deactivate') : $t('Activate') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />

          <div class="d-flex flex-wrap align-center justify-space-between gap-4 px-6 py-4">
            <AppSelect
              :model-value="itemsPerPage"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              style="inline-size: 6rem;"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
            />

            <div class="d-flex flex-wrap align-center justify-end gap-4 ms-auto">
              <p class="text-disabled mb-0">
                {{ paginationMeta({ page, itemsPerPage }, totalUsers) }}
              </p>

              <VPagination
                :model-value="page"
                active-color="primary"
                :length="Math.max(Math.ceil(totalUsers / itemsPerPage), 1)"
                :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(Math.ceil(totalUsers / itemsPerPage), 1), 5)"
                @update:model-value="page = $event"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <ImportUserDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      @import="handleImportUsers"
      @download-template="handleDownloadUserTemplate"
    />

    <ExportUserDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      :selected-count="selectedRows.length"
      @export="handleExportUsers"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      :confirmation-question="$t('Are you sure you want to delete this user?')"
      :confirm-title="$t('Deleted')"
      :confirm-msg="$t('The user has been removed from the list.')"
      :cancel-title="$t('Cancelled')"
      :cancel-msg="$t('The user remains unchanged.')"
      @confirm="confirmDeleteUser"
    />

    <VSnackbar
      v-model="isSnackbarVisible"
      location="top end"
      :color="snackbarColor"
      timeout="2400"
    >
      {{ snackbarText }}
    </VSnackbar>
  </section>
</template>
