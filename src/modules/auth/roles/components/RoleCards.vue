<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import {
  bulkDeleteRoles as bulkDeleteRolesRequest,
  deleteRole as deleteRoleRequest,
  exportRoles as exportRolesRequest,
  fetchRole,
  fetchRoles as fetchRolesRequest,
  fetchRoleStats as fetchRoleStatsRequest,
} from '../services/roleService'

const props = defineProps({
  canImport: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canBulkDestroy: { type: Boolean, default: false },
  isImporting: { type: Boolean, default: false },
  downloadTemplateHandler: { type: Function, default: null },
})

const emit = defineEmits(['changed', 'stats-changed', 'import', 'export', 'add'])
const { t } = useI18n()
const { snackbar, showSuccess, showError } = useActionFeedback()

const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

const roles = ref([])
const totalItems = ref(0)
const loading = ref(false)
const editingRole = ref(false)
const isExporting = ref(false)
const isImportDialogVisible = ref(false)
const importFile = ref(null)

const headers = computed(() => [
  { title: t('roles.roles.headers.index'), key: 'index', sortable: false, width: 70, align: 'center' },
  { title: t('roles.roles.headers.name'), key: 'name' },
  { title: t('roles.roles.headers.organization'), key: 'organization_name', sortable: false },
  { title: t('roles.roles.headers.guard_name'), key: 'guard_name', align: 'center' },
  { title: t('roles.roles.headers.permissions'), key: 'permissions', sortable: false },
  { title: t('roles.roles.headers.created_at'), key: 'created_at', sortable: false, width: 180, align: 'center' },
  { title: t('roles.roles.headers.updated_at'), key: 'updated_at', sortable: false, width: 180, align: 'center' },
  { title: t('roles.roles.headers.actions'), key: 'actions', sortable: false, width: 140, align: 'center' },
])

const permissionGroupLabelMap = {
  users: 'Nguoi dung',
  roles: 'Vai tro',
  organizations: 'To chuc',
  permissions: 'Quyen han',
  settings: 'Cau hinh he thong',
  'log-activities': 'Nhat ky hoat dong',
  posts: 'Tin tuc',
  meetings: 'Cuoc hop',
  'my-meetings': 'Lich hop cua toi',
  agendas: 'Chuong trinh hop',
  'meeting-agendas': 'Chuong trinh hop',
  'meeting-types': 'Loai cuoc hop',
  'attendee-groups': 'Nhom thanh phan tham du',
  'attendee-group-members': 'Thanh vien nhom tham du',
  'meeting-document-types': 'Loai tai lieu hop',
  'meeting-document-fields': 'Linh vuc tai lieu hop',
  documents: 'Tai lieu hop',
  conclusions: 'Ket luan',
  votings: 'Bieu quyet',
  reminders: 'Nhac lich hop',
  checkins: 'Diem danh',
  notifications: 'Thong bao',
}

const permissionActionLabelMap = {
  index: 'Xem danh sach',
  show: 'Xem chi tiet',
  store: 'Tao moi',
  update: 'Cap nhat',
  destroy: 'Xoa',
  stats: 'Xem thong ke',
  import: 'Nhap du lieu',
  export: 'Xuat du lieu',
  tree: 'Xem cay quyen',
  dashboard: 'Xem bang dieu khien',
  'live-control': 'Dieu hanh truc tiep',
  'bulk-destroy': 'Xoa hang loat',
  'bulk-update-status': 'Cap nhat trang thai hang loat',
  'set-active': 'Dat noi dung dang dien ra',
  approve: 'Duyet',
  reject: 'Tu choi',
  vote: 'Bo phieu',
  open: 'Mo',
  close: 'Dong',
  'qr-checkin': 'Diem danh QR',
  'self-checkin': 'Tu diem danh',
}

const humanizePermissionPart = value => {
  const normalized = String(value || '').trim()
  if (!normalized)
    return ''

  return normalized
    .split(/[-_.]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getPermissionGroupLabel = groupName => permissionGroupLabelMap[groupName] || humanizePermissionPart(groupName)

const getPermissionDisplayLabel = permissionName => {
  if (!permissionName)
    return ''

  if (permissionName.startsWith('group:'))
    return getPermissionGroupLabel(permissionName.replace('group:', ''))

  const [groupName = permissionName, actionName = ''] = permissionName.split('.')
  const groupLabel = getPermissionGroupLabel(groupName)
  const actionLabel = permissionActionLabelMap[actionName] || humanizePermissionPart(actionName)

  return actionName ? `${actionLabel} ${groupLabel}`.trim() : groupLabel
}

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const buildListParams = () => ({
  search: searchQuery.value || undefined,
  'from_date': fromDate.value || undefined,
  'to_date': toDate.value || undefined,
  limit: itemsPerPage.value,
  page: page.value,
  'sort_by': sortBy.value,
  'sort_order': orderBy.value,
})

const buildExportParams = () => ({
  search: searchQuery.value || undefined,
  'from_date': fromDate.value || undefined,
  'to_date': toDate.value || undefined,
  limit: itemsPerPage.value,
  'sort_by': sortBy.value,
  'sort_order': orderBy.value,
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await fetchRolesRequest(buildListParams())

    roles.value = response.data ?? []
    totalItems.value = response.meta?.total ?? response.total ?? 0
  }
  catch (err) {
    console.error('Fetch roles error:', err)
    roles.value = []
    totalItems.value = 0
    showError(err, 'Khong the tai danh sach vai tro.')
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await fetchRoleStatsRequest(buildExportParams())

    emit('stats-changed', response.data ?? { total: 0 })
  }
  catch (err) {
    console.error('Fetch role stats error:', err)
  }
}

const refreshAll = async () => {
  await Promise.all([
    fetchRoles(),
    fetchStats(),
  ])
}

let filterTimeout
watch([searchQuery, fromDate, toDate], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    refreshAll()
  }, 300)
})

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchRoles()
  fetchStats()
})

onMounted(() => {
  refreshAll()
})

const getCreatedByLabel = item => item.created_by || t('roles.roles.list.system_admin')
const getUpdatedByLabel = item => item.updated_by || t('roles.roles.list.system_admin')

const clearFilters = () => {
  searchQuery.value = ''
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
  refreshAll()
}

const openImportDialog = () => {
  if (!props.canImport)
    return

  isImportDialogVisible.value = true
}

const closeImportDialog = () => {
  isImportDialogVisible.value = false
  importFile.value = null
}

const handleImport = () => {
  const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

  if (!file)
    return

  emit('import', file)
  closeImportDialog()
}

const isRoleDialogVisible = ref(false)
const isRoleDetailDialogVisible = ref(false)
const isAddRoleDialogVisible = ref(false)
const roleDetail = ref({ id: null, name: '', 'guard_name': 'web', permissions: [] })

const openCreateDialog = () => {
  isAddRoleDialogVisible.value = true
}

const showRoleDetail = async item => {
  editingRole.value = true
  roleDetail.value = { id: null, name: '', 'guard_name': 'web', permissions: [] }

  try {
    const response = await fetchRole(item.id)
    const detail = response.data ?? response

    roleDetail.value = {
      id: detail.id,
      name: detail.name,
      'guard_name': detail.guard_name ?? 'web',
      permissions: detail.permissions ?? [],
    }
  }
  catch (err) {
    console.error('Fetch role detail error:', err)
    showError(err, 'Khong the tai chi tiet vai tro.')
  }
  finally {
    editingRole.value = false
    if (roleDetail.value?.id === item.id)
      isRoleDetailDialogVisible.value = true
  }
}

const editRole = async item => {
  editingRole.value = true
  roleDetail.value = { id: null, name: '', 'guard_name': 'web', permissions: [] }

  try {
    const response = await fetchRole(item.id)
    const detail = response.data ?? response

    roleDetail.value = {
      id: detail.id,
      name: detail.name,
      'guard_name': detail.guard_name ?? 'web',
      permissions: detail.permissions ?? [],
    }
  }
  catch (err) {
    console.error('Fetch role detail error:', err)
    showError(err, 'Khong the tai chi tiet vai tro.')
  }
  finally {
    editingRole.value = false
    if (roleDetail.value?.id === item.id)
      isRoleDialogVisible.value = true
  }
}

const onRoleSaved = payload => {
  page.value = 1
  if (payload?.message)
    showSuccess(payload.message)

  fetchRoles()
  emit('changed')
}

const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)

const confirmDialog = ref({
  title: '',
  message: '',
  confirmText: 'Xac nhan',
  confirmColor: 'primary',
  action: null,
})

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action)
    return

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

const deleteRole = item => {
  openConfirmDialog({
    title: 'Xoa vai tro',
    message: `Ban co chac chan muon xoa vai tro "${item.name}" khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteRoleRequest(item.id)
      selectedRows.value = selectedRows.value.filter(id => id !== item.id)
      showSuccess('Xoa vai tro thanh cong.')
      await refreshAll()
      emit('changed')
    },
  })
}

const bulkDeleteRoles = () => {
  if (!selectedRows.value.length)
    return

  openConfirmDialog({
    title: 'Xoa hang loat vai tro',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} vai tro da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteRolesRequest(selectedRows.value)
      selectedRows.value = []
      showSuccess('Xoa hang loat vai tro thanh cong.')
      await refreshAll()
      emit('changed')
    },
  })
}

const exportRoles = async () => {
  isExporting.value = true
  try {
    if (selectedRows.value.length) {
      const selectedRoles = roles.value.filter(item => selectedRows.value.includes(item.id))

      exportRowsToExcel({
        rows: selectedRoles.map(item => ({
          id: item.id ?? '',
          name: item.name || '',
          'guard_name': item.guard_name || 'web',
          'organization_id': item.organization_id ?? '',
          'organization_name': item.organization?.name || item.organization_name || '',
          'created_at': formatAuthDateTime(item.created_at, { fallback: '' }),
          'updated_at': formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
        })),
        headers: ['id', 'name', 'guard_name', 'organization_id', 'organization_name', 'created_at', 'updated_at'],
        sheetName: 'Roles',
        fileName: `roles_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 10 },
          { wch: 24 },
          { wch: 16 },
          { wch: 18 },
          { wch: 28 },
          { wch: 22 },
          { wch: 22 },
        ],
      })

      return
    }

    const response = await exportRolesRequest(buildExportParams())

    const safeBlob = response instanceof Blob
      ? response
      : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = window.URL.createObjectURL(safeBlob)

    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `roles_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Export roles error:', err)
    showError(err, 'Khong the xuat du lieu vai tro.')
    throw err
  }
  finally {
    isExporting.value = false
  }
}

const permissionPreview = permissions => {
  const items = Array.isArray(permissions) ? permissions : []

  return items.slice(0, 3).map(permission => ({
    raw: permission,
    label: getPermissionDisplayLabel(permission.name || permission),
  }))
}

defineExpose({
  exportRoles,
  fetchRoles,
  fetchStats,
  isExporting,
  openCreateDialog,
  refreshRoles: refreshAll,
  selectedRows,
})
</script>

<template>
  <VCard class="roles-main-card">
    <VCard
      :title="t('roles.roles.list.filter')"
      flat
      class="roles-toolbar-card"
    >
      <VCardText>
        <VRow class="align-center">
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              :label="t('roles.roles.list.search_label')"
              :placeholder="t('roles.roles.list.search_placeholder')"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <AppDateTimePicker
              v-model="fromDate"
              :label="t('roles.roles.list.from_date')"
              :placeholder="t('roles.roles.list.from_date_placeholder')"
              :config="{ dateFormat: 'Y-m-d' }"
              clearable
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <AppDateTimePicker
              v-model="toDate"
              :label="t('roles.roles.list.to_date')"
              :placeholder="t('roles.roles.list.to_date_placeholder')"
              :config="{ dateFormat: 'Y-m-d' }"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText>
        <div class="d-flex justify-sm-space-between justify-start flex-wrap gap-4">
          <div class="d-flex gap-x-4 align-center flex-wrap">
            <VMenu v-if="selectedRows.length && canBulkDestroy">
              <template #activator="{ props: menuProps }">
                <VBtn
                  v-bind="menuProps"
                  variant="tonal"
                  prepend-icon="tabler-chevron-down"
                >
                  {{ t('common.common.labels.actions') }}
                </VBtn>
              </template>

              <VList>
                <VListItem @click="bulkDeleteRoles">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('roles.roles.list.bulk_delete') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </div>

          <div class="d-flex gap-x-4 align-center flex-wrap">
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-upload"
              :text="t('common.common.actions.import')"
              :loading="isImporting"
              :disabled="!canImport"
              @click="openImportDialog"
            />
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-file-download"
              :text="t('common.common.actions.export')"
              :loading="isExporting"
              :disabled="!canExport"
              @click="emit('export')"
            />
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              :disabled="!canCreate"
              @click="emit('add')"
            >
              {{ t('roles.roles.list.add_new') }}
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />
    </VCard>

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :items="roles"
      item-value="id"
      :items-length="totalItems"
      :headers="headers"
      :loading="loading"
      class="text-no-wrap roles-table role-cards-table"
      show-select
      @update:options="updateOptions"
    >
      <template #item.index="{ index }">
        <div class="d-flex justify-center">
          <span class="text-body-2">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </span>
        </div>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex flex-column gap-1 py-2">
          <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.name }}</span>
          <span class="text-caption text-disabled">ID #{{ item.id }}</span>
        </div>
      </template>

      <template #item.organization_name="{ item }">
        <div class="d-flex flex-column gap-1 py-2">
          <span class="text-body-2 text-high-emphasis">{{ item.organization?.name || item.organization_name || '-' }}</span>
          <span class="text-caption text-disabled">ID #{{ item.organization_id ?? '-' }}</span>
        </div>
      </template>

      <template #item.guard_name="{ item }">
        <div class="d-flex justify-center">
          <VChip
            size="small"
            color="info"
            variant="tonal"
            label
          >
            {{ item.guard_name || 'web' }}
          </VChip>
        </div>
      </template>

      <template #item.permissions="{ item }">
        <div class="d-flex flex-wrap gap-2 py-2">
          <VChip
            v-for="permission in permissionPreview(item.permissions)"
            :key="permission.raw?.id || permission.raw"
            size="x-small"
            color="primary"
            variant="tonal"
            label
          >
            {{ permission.label }}
          </VChip>
          <VChip
            v-if="(item.permissions?.length || 0) > 3"
            size="x-small"
            color="secondary"
            variant="outlined"
            label
          >
            +{{ item.permissions.length - 3 }}
          </VChip>
          <span
            v-if="!item.permissions?.length"
            class="text-body-2 text-disabled"
          >
            {{ t('roles.roles.list.no_permissions') }}
          </span>
        </div>
      </template>

      <template #item.created_at="{ item }">
        <div class="d-flex flex-column gap-y-1 text-center">
          <span class="text-body-2 font-weight-medium text-primary">
            {{ getCreatedByLabel(item) }}
          </span>
          <span class="text-caption text-disabled">
            {{ formatAuthDateTime(item.created_at, { fallback: t('roles.roles.list.no_update') }) }}
          </span>
        </div>
      </template>

      <template #item.updated_at="{ item }">
        <div class="d-flex flex-column gap-y-1 text-center">
          <span class="text-body-2 font-weight-medium text-primary">
            {{ getUpdatedByLabel(item) }}
          </span>
          <span class="text-caption text-disabled">
            {{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('roles.roles.list.no_update') }) }}
          </span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center justify-center">
          <IconBtn
            v-if="$can('update', 'Role')"
            variant="text"
            color="default"
            size="small"
            @click="editRole(item)"
          >
            <VIcon
              :icon="editingRole && roleDetail.id === item.id ? 'tabler-loader-2' : 'tabler-edit'"
              size="20"
            />
          </IconBtn>

          <IconBtn
            v-if="$can('show', 'Role') || $can('delete', 'Role')"
            variant="text"
            color="default"
            size="small"
          >
            <VIcon
              icon="tabler-dots-vertical"
              size="20"
            />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  v-if="$can('show', 'Role')"
                  @click="showRoleDetail(item)"
                >
                  <template #prepend>
                    <VIcon
                      icon="tabler-eye"
                      size="18"
                    />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.view') }}</VListItemTitle>
                </VListItem>
                <VListItem
                  v-if="$can('delete', 'Role')"
                  @click="deleteRole(item)"
                >
                  <template #prepend>
                    <VIcon
                      icon="tabler-trash"
                      size="18"
                    />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.delete') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </div>
      </template>

      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
        />
      </template>
    </VDataTableServer>
  </VCard>

  <AddEditRoleDialog
    v-model:is-dialog-visible="isAddRoleDialogVisible"
    @saved="onRoleSaved"
  />

  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDialogVisible"
    v-model:role-permissions="roleDetail"
    @saved="onRoleSaved"
  />

  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDetailDialogVisible"
    v-model:role-permissions="roleDetail"
    readonly
  />

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

  <VDialog
    v-model="isImportDialogVisible"
    max-width="500"
  >
    <VCard :title="t('roles.roles.import.dialog_title')">
      <VCardText>
        <div class="text-caption mb-5 text-disabled">
          {{ t('roles.roles.import.helper_text') }}
        </div>

        <div
          v-if="typeof downloadTemplateHandler === 'function'"
          class="d-flex justify-end mb-4"
        >
          <VBtn
            variant="text"
            color="info"
            prepend-icon="tabler-download"
            @click="downloadTemplateHandler?.()"
          >
            {{ t('common.common.actions.download_template') }}
          </VBtn>
        </div>

        <VFileInput
          v-model="importFile"
          :label="t('roles.roles.import.file_label')"
          accept=".xlsx,.xls,.csv"
          prepend-icon="tabler-file-spreadsheet"
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="tonal"
          @click="closeImportDialog"
        >
          {{ t('roles.roles.import.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="isImporting"
          :disabled="!importFile"
          @click="handleImport"
        >
          {{ t('roles.roles.import.confirm') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.role-cards-table :deep(.v-data-table-column--select-row),
.role-cards-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.role-cards-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>

<style scoped>
.roles-main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary-darken-1), 0.08);
  border-radius: 22px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 8%);
}

.roles-toolbar-card {
  border-end-end-radius: 0;
  border-end-start-radius: 0;
}

.roles-table :deep(.v-data-table-header__content) {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.roles-table :deep(tbody tr) {
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.roles-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary-darken-1), 0.03);
}

.roles-table :deep(td),
.roles-table :deep(th) {
  border-color: rgba(var(--v-border-color), 0.6);
}
</style>
