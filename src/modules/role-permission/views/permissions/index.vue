<script setup>
import AddEditPermissionDialog from '@/components/dialogs/AddEditPermissionDialog.vue'
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import ExportPermissionDialog from '@/modules/role-permission/components/ExportPermissionDialog.vue'
import ImportPermissionDialog from '@/modules/role-permission/components/ImportPermissionDialog.vue'
import {
  bulkDeleteCorePermissions,
  createCorePermission,
  deleteCorePermission,
  downloadCorePermissionsExport,
  downloadCorePermissionsTemplate,
  getCorePermission,
  getCorePermissionStats,
  getCorePermissions,
  importCorePermissions,
  updateCorePermission,
} from '@/modules/role-permission/services/corePermissions'
import { getCoreRoles, updateCoreRole } from '@/modules/role-permission/services/coreRoles'
import { buildPermissionRoleAssignments } from '@/modules/role-permission/utils/coreAccessAdapters'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const headers = computed(() => [
  { title: t('Index'), key: 'stt', sortable: false, align: 'center' },
  { title: t('Permission Name'), key: 'name' },
  { title: t('Assigned Roles Label'), key: 'assignedTo', sortable: false },
  { title: t('Created'), key: 'createdAt' },
  { title: t('Updated'), key: 'updatedAt' },
  { title: t('Action'), key: 'actions', sortable: false, align: 'center' },
])

const search = ref('')
const selectedRows = ref([])
const selectedBulkAction = ref()
const selectedRole = ref()
const fromDate = ref('')
const toDate = ref('')
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const pendingDeletePermissionId = ref(null)
const isLoading = ref(false)
const permissionStats = ref({ total: 0 })

const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resetFilters = () => {
  search.value = ''
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

const isPermissionDialogVisible = ref(false)
const permissionForm = ref({
  id: null,
  name: '',
  assignedTo: [],
  parentId: null,
  sortOrder: 0,
})

const permissionsDirectory = ref([])
const rolesDirectory = ref([])
const normalizedSearch = computed(() => search.value.trim().toLowerCase())

const roleOptions = computed(() => rolesDirectory.value.map(role => ({
  title: role.name,
  value: role.id,
})))
const roleMap = computed(() => rolesDirectory.value.reduce((acc, role, index) => {
  const colors = ['primary', 'success', 'warning', 'info', 'error', 'secondary']

  acc[role.id] = {
    color: colors[index % colors.length],
    title: role.name,
  }

  return acc
}, {}))

const bulkActions = computed(() => [
  ...roleOptions.value.map(role => ({
    title: `Gán ${role.title}`,
    value: role.value,
  })),
  {
    title: t('Delete'),
    value: 'delete',
  },
])

const permissions = computed(() => buildPermissionRoleAssignments(permissionsDirectory.value, rolesDirectory.value)
  .map(permission => ({
    assignedRoleIds: permission.assignedRoleIds,
    assignedTo: permission.assignedRoleNames,
    createdAt: permission.created_at,
    createdBy: permission.created_by ?? 'N/A',
    createdDate: permission.created_at,
    description: permission.description,
    id: permission.id,
    name: permission.name,
    parentId: permission.parent_id,
    sortOrder: permission.sort_order,
    updatedAt: permission.updated_at ?? permission.created_at ?? '',
    updatedBy: permission.updated_by ?? 'N/A',
  })))

const filteredPermissions = computed(() => permissions.value.filter(permission => (
  selectedRole.value ? permission.assignedRoleIds.includes(Number(selectedRole.value)) : true
)))

const sortedPermissions = computed(() => {
  if (!sortBy.value || !orderBy.value)
    return filteredPermissions.value

  return [...filteredPermissions.value].sort((firstPermission, secondPermission) => {
    const firstValue = firstPermission[sortBy.value] ?? ''
    const secondValue = secondPermission[sortBy.value] ?? ''
    const comparison = String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true, sensitivity: 'base' })

    return orderBy.value === 'asc' ? comparison : comparison * -1
  })
})

const paginatedPermissions = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage.value

  return sortedPermissions.value.slice(startIndex, startIndex + itemsPerPage.value)
})

const totalPermissions = computed(() => sortedPermissions.value.length)
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()
const widgetData = computed(() => [
  {
    title: t('Total Permissions'),
    value: `${permissionStats.value.total}`,
    desc: t('Total Permissions'),
    icon: 'tabler-key',
    color: 'primary',
  },
  {
    title: 'Roles',
    value: `${rolesDirectory.value.length}`,
    desc: t('Existing Roles'),
    icon: 'tabler-shield-lock',
    color: 'info',
  },
])

const permissionNameIdLookup = computed(() => permissionsDirectory.value.reduce((acc, permission) => {
  acc[permission.name] = permission.id

  return acc
}, {}))

const syncPermissionRoles = async ({ nextAssignedRoleIds, permissionName, previousPermissionName = permissionName }) => {
  for (const role of rolesDirectory.value) {
    const currentPermissionNames = (role.permissions ?? []).filter(permission => permission !== previousPermissionName && permission !== permissionName)

    if (nextAssignedRoleIds.includes(role.id))
      currentPermissionNames.push(permissionName)

    const permissionIds = [...new Set(currentPermissionNames.map(name => permissionNameIdLookup.value[name]).filter(Boolean))]

    await updateCoreRole(role.id, {
      guard_name: role.guard_name ?? 'web',
      name: role.name,
      permission_ids: permissionIds,
    })
  }
}

const loadRoles = async () => {
  try {
    const response = await getCoreRoles({
      limit: 100,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })

    rolesDirectory.value = response.data ?? []
  }
  catch (error) {
    rolesDirectory.value = []
    throw error
  }
}

const loadPermissionStats = async () => {
  try {
    const response = await getCorePermissionStats({
      fromDate: fromDate.value,
      search: normalizedSearch.value,
      toDate: toDate.value,
    })

    permissionStats.value = response?.data ?? { total: 0 }
  }
  catch (error) {
    permissionStats.value = { total: 0 }
    throw error
  }
}

const loadPermissions = async () => {
  isLoading.value = true

  try {
    let currentPage = 1
    let lastPage = 1
    const nextPermissions = []

    do {
      const response = await getCorePermissions({
        fromDate: fromDate.value,
        limit: 100,
        page: currentPage,
        search: normalizedSearch.value,
        sortBy: sortBy.value === 'updatedAt' ? 'updated_at' : sortBy.value || 'updated_at',
        sortOrder: orderBy.value || 'desc',
        toDate: toDate.value,
      })

      nextPermissions.push(...(response.data ?? []))
      lastPage = response.meta?.last_page ?? 1
      currentPage += 1
    } while (currentPage <= lastPage)

    permissionsDirectory.value = nextPermissions
  }
  catch (error) {
    permissionsDirectory.value = []
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const refreshPermissions = async () => {
  const results = await Promise.allSettled([
    loadPermissions(),
    loadRoles(),
    loadPermissionStats(),
  ])

  const failedResult = results.find(result => result.status === 'rejected')

  if (failedResult?.reason) {
    showSnackbar(
      isCoreForbiddenError(failedResult.reason)
        ? 'Tài khoản hiện tại không có quyền truy cập danh sách quyền.'
        : getCoreErrorMessage(failedResult.reason, 'Không thể tải dữ liệu quyền.'),
      'error',
    )
  }
}

const openPermissionDialog = async permission => {
  if (permission?.id) {
    const response = await getCorePermission(permission.id)
    const detail = response?.data ?? permission

    permissionForm.value = {
      assignedTo: [...(permission?.assignedRoleIds ?? [])],
      id: detail.id ?? permission.id,
      name: detail.name ?? permission.name,
      parentId: detail.parent_id ?? permission.parentId ?? null,
      sortOrder: detail.sort_order ?? permission.sortOrder ?? 0,
    }
    isPermissionDialogVisible.value = true

    return
  }

  permissionForm.value = {
    assignedTo: [...(permission?.assignedRoleIds ?? [])],
    id: permission?.id ?? null,
    name: permission?.name ?? '',
    parentId: permission?.parentId ?? null,
    sortOrder: permission?.sortOrder ?? 0,
  }
  isPermissionDialogVisible.value = true
}

const requestDeletePermission = id => {
  pendingDeletePermissionId.value = id
  isDeleteDialogVisible.value = true
}

const confirmDeletePermission = async isConfirmed => {
  if (!isConfirmed || pendingDeletePermissionId.value === null)
    return

  await deleteCorePermission(pendingDeletePermissionId.value)
  selectedRows.value = selectedRows.value.filter(rowId => rowId !== pendingDeletePermissionId.value)
  pendingDeletePermissionId.value = null
  await refreshPermissions()
  showSnackbar('Đã xóa quyền thành công.')
}

const handleBulkAction = async action => {
  if (!action || !selectedRows.value.length)
    return

  if (action === 'delete') {
    await bulkDeleteCorePermissions([...selectedRows.value])
    showSnackbar('Đã xóa các quyền đã chọn.')
  }
  else {
    const selectedPermissions = permissions.value.filter(permission => selectedRows.value.includes(permission.id))

    for (const permission of selectedPermissions)
      await syncPermissionRoles({ nextAssignedRoleIds: [Number(action)], permissionName: permission.name })

    showSnackbar('Đã cập nhật vai trò cho các quyền đã chọn.')
  }

  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshPermissions()
}

const exportPermissionsToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => ({
    assignedTo: item.assignedTo.join(', '),
    createdDate: item.createdDate,
    name: item.name,
  })))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Permissions')
  XLSX.writeFileXLSX(workbook, fileName)
}

const handleExportPermissions = async scope => {
  if (scope === 'selected') {
    exportPermissionsToWorkbook(sortedPermissions.value.filter(item => selectedRows.value.includes(item.id)), `permissions-selected-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu quyền thành công.')

    return
  }

  if (scope === 'page') {
    exportPermissionsToWorkbook(paginatedPermissions.value, `permissions-page-${ new Date().toISOString().slice(0, 10) }.xlsx`)
    showSnackbar('Đã xuất dữ liệu quyền thành công.')

    return
  }

  if (!selectedRole.value) {
    await downloadCorePermissionsExport({
      fromDate: fromDate.value,
      search: normalizedSearch.value,
      sortBy: sortBy.value === 'updatedAt' ? 'updated_at' : sortBy.value,
      sortOrder: orderBy.value || 'desc',
      toDate: toDate.value,
    })
    showSnackbar('Đã xuất dữ liệu quyền thành công.')

    return
  }

  exportPermissionsToWorkbook(sortedPermissions.value, `permissions-filtered-${ new Date().toISOString().slice(0, 10) }.xlsx`)
  showSnackbar('Đã xuất dữ liệu quyền thành công.')
}

const handleImportPermissions = async file => {
  await importCorePermissions(file)
  await refreshPermissions()
  showSnackbar('Đã nhập dữ liệu quyền thành công.')
}

const handleDownloadPermissionTemplate = async () => {
  await downloadCorePermissionsTemplate()
  showSnackbar('Đã tải file mẫu quyền.')
}

const savePermission = async payload => {
  const previousPermissionName = permissionForm.value.name
  let savedPermission

  if (payload.id) {
    const response = await updateCorePermission(payload.id, {
      description: payload.name,
      guard_name: 'web',
      name: payload.name,
      parent_id: permissionForm.value.parentId,
      sort_order: permissionForm.value.sortOrder,
    })

    savedPermission = response.data
    showSnackbar('Đã cập nhật quyền thành công.')
  }
  else {
    const response = await createCorePermission({
      description: payload.name,
      guard_name: 'web',
      name: payload.name,
      parent_id: null,
      sort_order: 0,
    })

    savedPermission = response.data
    showSnackbar('Đã tạo quyền mới thành công.')
  }

  await loadPermissions()
  await syncPermissionRoles({
    nextAssignedRoleIds: payload.assignedTo.map(Number),
    permissionName: savedPermission.name,
    previousPermissionName,
  })
  await refreshPermissions()
}

const refreshPermissionsDebounced = useDebounceFn(async () => {
  page.value = 1
  await refreshPermissions()
}, 300)

watch([search, fromDate, toDate], refreshPermissionsDebounced)
watch([selectedRole, itemsPerPage], () => {
  page.value = 1
})

onMounted(() => {
  hydratePendingSnackbar()
})

onMounted(() => {
  refreshPermissions()
})
</script>

<template>
  <VRow>
    <VCol
      v-for="item in widgetData"
      :key="item.title"
      cols="12"
      md="6"
    >
      <VCard>
        <VCardText class="d-flex justify-space-between align-center">
          <div>
            <div class="text-body-2 text-medium-emphasis mb-1">
              {{ item.title }}
            </div>
            <div class="text-h4">
              {{ item.value }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ item.desc }}
            </div>
          </div>

          <VAvatar
            rounded
            :color="item.color"
            variant="tonal"
          >
            <VIcon :icon="item.icon" />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
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
                v-model="search"
                :placeholder="$t('Search permissions')"
              />
            </VCol>

            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <AppSelect
                v-model="selectedRole"
                :placeholder="$t('Assigned Roles Label')"
                :items="roleOptions"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol
              cols="12"
              sm="6"
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
              sm="6"
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
            style="inline-size: 14rem;"
            @update:model-value="handleBulkAction"
          />

          <VSpacer />

          <div class="d-flex align-center gap-4 flex-wrap">
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
              density="default"
              :icon="$vuetify.display.smAndDown ? 'tabler-plus' : undefined"
              :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-plus'"
              @click="openPermissionDialog()"
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
          :items-length="totalPermissions"
          :headers="headers"
          :items="paginatedPermissions"
          :loading="isLoading"
          item-value="id"
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

          <template #item.name="{ item }">
            <div class="text-high-emphasis text-body-1">
              {{ item.name }}
            </div>
          </template>

          <template #item.assignedTo="{ item }">
            <div class="d-flex gap-4 flex-wrap">
              <VChip
                v-for="roleName in item.assignedTo"
                :key="`${item.id}-${roleName}`"
                label
                size="small"
                :color="roleMap[item.assignedRoleIds[item.assignedTo.indexOf(roleName)]]?.color || 'secondary'"
                class="font-weight-medium"
              >
                {{ roleName }}
              </VChip>
            </div>
          </template>

          <template #item.updatedAt="{ item }">
            <div class="d-flex flex-column">
              <span
                class="text-body-2"
                :class="item.updatedBy === 'admin' ? 'text-primary font-weight-medium' : 'text-medium-emphasis'"
              >
                {{ item.updatedBy }}
              </span>
              <span class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.updatedAt) }}</span>
            </div>
          </template>

          <template #item.createdAt="{ item }">
            <div class="d-flex flex-column">
              <span
                class="text-body-2"
                :class="item.createdBy === 'admin' ? 'text-primary font-weight-medium' : 'text-medium-emphasis'"
              >
                {{ item.createdBy }}
              </span>
              <span class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.createdAt) }}</span>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-center">
              <IconBtn @click="openPermissionDialog(item)">
                <VIcon icon="tabler-pencil" />
              </IconBtn>

              <IconBtn @click="requestDeletePermission(item.id)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
            </div>
          </template>

          <template #bottom>
            <VDivider />

            <div class="d-flex flex-wrap align-center justify-space-between gap-4 px-6 py-4">
              <AppSelect
                :model-value="itemsPerPage"
                :items="[
                  { value: 5, title: '5' },
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
                  {{ paginationMeta({ page, itemsPerPage }, totalPermissions) }}
                </p>

                <VPagination
                  :model-value="page"
                  active-color="primary"
                  :length="Math.max(Math.ceil(totalPermissions / itemsPerPage), 1)"
                  :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(Math.ceil(totalPermissions / itemsPerPage), 1), 5)"
                  @update:model-value="page = $event"
                />
              </div>
            </div>
          </template>
        </VDataTableServer>
      </VCard>

      <AddEditPermissionDialog
        v-model:is-dialog-visible="isPermissionDialogVisible"
        :permission-id="permissionForm.id"
        v-model:permission-name="permissionForm.name"
        v-model:assigned-roles="permissionForm.assignedTo"
        :role-options="roleOptions"
        @save="savePermission"
      />

      <ImportPermissionDialog
        v-model:is-dialog-visible="isImportDialogVisible"
        @import="handleImportPermissions"
        @download-template="handleDownloadPermissionTemplate"
      />

      <ExportPermissionDialog
        v-model:is-dialog-visible="isExportDialogVisible"
        :selected-count="selectedRows.length"
        @export="handleExportPermissions"
      />

      <ConfirmDialog
        v-model:is-dialog-visible="isDeleteDialogVisible"
        :confirmation-question="$t('Are you sure you want to delete this permission?')"
        :confirm-title="$t('Deleted')"
        :confirm-msg="$t('The permission has been removed from the list.')"
        :cancel-title="$t('Cancelled')"
        :cancel-msg="$t('The permission remains unchanged.')"
        @confirm="confirmDeletePermission"
      />

      <VSnackbar
        v-model="isSnackbarVisible"
        location="top end"
        :color="snackbarColor"
        timeout="2400"
      >
        {{ snackbarText }}
      </VSnackbar>
    </VCol>
  </VRow>
</template>
