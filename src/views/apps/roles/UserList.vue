<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import { getCoreRoles } from '@/modules/role-permission/services/coreRoles'
import ExportUserDialog from '@/modules/user-management/components/ExportUserDialog.vue'
import ImportUserDialog from '@/modules/user-management/components/ImportUserDialog.vue'
import {
  bulkDeleteCoreUsers,
  bulkUpdateCoreUserStatus,
  deleteCoreUser,
  downloadCoreUsersExport,
  downloadCoreUsersTemplate,
  getCoreUsers,
  importCoreUsers,
} from '@/modules/user-management/services/coreUsers'
import { mapCoreUserSortField, mapCoreUserToViewModel } from '@/modules/user-management/utils/coreUserAdapters'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const searchQuery = ref('')
const selectedRole = ref()
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

const usersDirectory = ref([])
const roles = ref([])

const headers = computed(() => [
  { title: t('Index'), key: 'stt', sortable: false, align: 'center' },
  { title: t('User'), key: 'user' },
  { title: t('Roles'), key: 'role' },
  { title: t('Organization'), key: 'organization' },
  { title: t('Created'), key: 'createdAt' },
  { title: t('Updated'), key: 'updatedAt' },
  { title: t('Status'), key: 'status', align: 'center' },
  { title: t('Actions'), key: 'actions', sortable: false, align: 'center' },
])

const bulkActions = computed(() => [
  { title: t('Activate'), value: 'active' },
  { title: t('Deactivate'), value: 'inactive' },
  { title: t('Banned'), value: 'banned' },
  { title: t('Delete'), value: 'delete' },
])

const filteredUsers = computed(() => usersDirectory.value.filter(user => (
  selectedRole.value ? user.roleIds.includes(Number(selectedRole.value)) : true
)))

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
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedRole.value = undefined
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

const formatDateTime = value => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime()))
    return value || 'N/A'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
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

const resolveUserStatusLabel = stat => {
  const statLowerCase = String(stat ?? '').toLowerCase()

  if (statLowerCase === 'active')
    return t('Active')
  if (statLowerCase === 'inactive')
    return t('Inactive')
  if (statLowerCase === 'banned')
    return t('Banned')

  return stat
}

const exportUsersToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => ({
    email: item.email,
    name: item.fullName,
    organizations: item.organizations.join(', '),
    roles: item.roles.join(', '),
    status: item.status,
    updatedBy: item.updatedBy,
    userName: item.username,
  })))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
  XLSX.writeFileXLSX(workbook, fileName)
}

const loadRoles = async () => {
  try {
    const response = await getCoreRoles({
      limit: 100,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })

    roles.value = (response.data ?? []).map(role => ({
      title: role.name,
      value: role.id,
    }))
  }
  catch (error) {
    roles.value = []
    throw error
  }
}

const refreshUsers = async () => {
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
        toDate: toDate.value,
      })

      nextUsers.push(...(response.data ?? []).map(mapCoreUserToViewModel))
      lastPage = response.meta?.last_page ?? 1
      currentPage += 1
    } while (currentPage <= lastPage)

    usersDirectory.value = nextUsers
  }
  catch (error) {
    usersDirectory.value = []
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const requestDeleteUser = id => {
  pendingDeleteUserId.value = id
  isDeleteDialogVisible.value = true
}

const confirmDeleteUser = async isConfirmed => {
  if (!isConfirmed || pendingDeleteUserId.value === null)
    return

  await deleteCoreUser(pendingDeleteUserId.value)
  selectedRows.value = selectedRows.value.filter(rowId => rowId !== pendingDeleteUserId.value)
  pendingDeleteUserId.value = null
  await refreshUsers()
  showSnackbar('Đã xóa người dùng thành công.')
}

const handleBulkAction = async action => {
  if (!action || !selectedRows.value.length)
    return

  if (action === 'delete') {
    await bulkDeleteCoreUsers([...selectedRows.value])
    showSnackbar('Đã xóa các người dùng đã chọn.')
  }
  else {
    await bulkUpdateCoreUserStatus([...selectedRows.value], action)
    showSnackbar('Đã cập nhật trạng thái cho các người dùng đã chọn.')
  }

  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshUsers()
}

const handleExportUsers = async scope => {
  if (scope === 'selected') {
    exportUsersToWorkbook(sortedUsers.value.filter(item => selectedRows.value.includes(item.id)), `role-users-selected-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  if (scope === 'page') {
    exportUsersToWorkbook(users.value, `role-users-page-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  if (!selectedRole.value) {
    await downloadCoreUsersExport({
      fromDate: fromDate.value,
      search: normalizedSearchQuery.value,
      sortBy: mapCoreUserSortField(sortBy.value),
      sortOrder: orderBy.value || 'desc',
      toDate: toDate.value,
    })
    showSnackbar('Đã xuất dữ liệu người dùng thành công.')

    return
  }

  exportUsersToWorkbook(sortedUsers.value, `role-users-filtered-${ new Date().toISOString().slice(0, 10) }.xlsx`)
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

watch([selectedRole, itemsPerPage], () => {
  page.value = 1
})

const refreshUsersDebounced = useDebounceFn(async () => {
  page.value = 1
  await refreshUsers()
}, 300)

watch([searchQuery, fromDate, toDate], refreshUsersDebounced)

onMounted(async () => {
  hydratePendingSnackbar()
  const results = await Promise.allSettled([
    loadRoles(),
    refreshUsers(),
  ])
  const failedResult = results.find(result => result.status === 'rejected')

  if (failedResult?.reason) {
    showSnackbar(
      isCoreForbiddenError(failedResult.reason)
        ? 'Tài khoản hiện tại không có quyền truy cập danh sách người dùng theo vai trò.'
        : getCoreErrorMessage(failedResult.reason, 'Không thể tải dữ liệu người dùng theo vai trò.'),
      'error',
    )
  }
})
</script>

<template>
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
            :placeholder="$t('Search users')"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
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
          md="3"
        >
          <AppDateTimePicker
            v-model="fromDate"
            :placeholder="$t('From Date')"
            :config="{ altFormat: 'd/m/Y', altInput: true, dateFormat: 'Y-m-d' }"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppDateTimePicker
            v-model="toDate"
            :placeholder="$t('To Date')"
            :config="{ altFormat: 'd/m/Y', altInput: true, dateFormat: 'Y-m-d' }"
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

      <div class="d-flex align-center flex-wrap gap-4">
        <VBtn
          variant="tonal"
          color="secondary"
          :icon="$vuetify.display.smAndDown ? 'tabler-download' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-download'"
          @click="isImportDialogVisible = true"
        >
          <span v-if="!$vuetify.display.smAndDown">{{ $t('Import Data') }}</span>
        </VBtn>

        <VBtn
          variant="tonal"
          color="secondary"
          :icon="$vuetify.display.smAndDown ? 'tabler-upload' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-upload'"
          @click="isExportDialogVisible = true"
        >
          <span v-if="!$vuetify.display.smAndDown">{{ $t('Export Data') }}</span>
        </VBtn>

        <VBtn
          variant="tonal"
          color="secondary"
          :icon="$vuetify.display.smAndDown ? 'tabler-refresh' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-refresh'"
          @click="resetFilters"
        >
          <span v-if="!$vuetify.display.smAndDown">{{ $t('Reset') }}</span>
        </VBtn>

        <VBtn
          :icon="$vuetify.display.smAndDown ? 'tabler-plus' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-plus'"
          :to="{ name: 'apps-user-create' }"
        >
          <span v-if="!$vuetify.display.smAndDown">{{ $t('Add New') }}</span>
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

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
      <template #item.stt="{ index }">
        <div class="d-flex align-center justify-center">
          <span class="text-body-1 text-high-emphasis">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </span>
        </div>
      </template>

      <template #item.user="{ item }">
        <div class="d-flex align-center gap-x-4">
          <VAvatar
            size="34"
            variant="tonal"
            :color="resolveUserRoleVariant(item.role).color"
          >
            <span>{{ avatarText(item.fullName) }}</span>
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
          >
            {{ roleName }}
          </VChip>
        </div>
      </template>

      <template #item.organization="{ item }">
        <div class="text-body-1 text-high-emphasis">
          {{ item.organizations.join(', ') || 'N/A' }}
        </div>
      </template>

      <template #item.createdAt="{ item }">
        <div class="d-flex flex-column">
          <span
            class="text-body-2"
            :class="item.createdBy === 'admin' ? 'text-primary font-weight-medium' : 'text-medium-emphasis'"
          >
            {{ item.createdBy || 'N/A' }}
          </span>
          <span class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.createdAt) }}</span>
        </div>
      </template>

      <template #item.updatedAt="{ item }">
        <div class="d-flex flex-column">
          <span
            class="text-body-2"
            :class="item.updatedBy === 'admin' ? 'text-primary font-weight-medium' : 'text-medium-emphasis'"
          >
            {{ item.updatedBy || 'N/A' }}
          </span>
          <span class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.updatedAt) }}</span>
        </div>
      </template>

      <template #item.status="{ item }">
        <div class="d-flex align-center justify-center">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ resolveUserStatusLabel(item.status) }}
          </VChip>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center justify-center">
          <IconBtn @click="requestDeleteUser(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </div>
      </template>

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
</template>
