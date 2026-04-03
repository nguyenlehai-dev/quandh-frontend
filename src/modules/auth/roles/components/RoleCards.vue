<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import {
  bulkDeleteRoles as bulkDeleteRolesRequest,
  fetchRole,
  fetchRoles as fetchRolesRequest,
} from '../services/roleService'

const emit = defineEmits(['changed'])
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

const headers = [
  { title: t('roles.roles.headers.index'), key: 'index', sortable: false, width: 70 },
  { title: t('roles.roles.headers.name'), key: 'name' },
  { title: t('roles.roles.headers.guard_name'), key: 'guard_name' },
  { title: t('roles.roles.headers.permissions'), key: 'permissions', sortable: false },
  { title: t('roles.roles.headers.updated_at'), key: 'updated_at', sortable: false, width: 180 },
  { title: t('roles.roles.headers.actions'), key: 'actions', sortable: false, width: 140 },
]

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
  ...buildListParams(),
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

let filterTimeout
watch([searchQuery, fromDate, toDate], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    fetchRoles()
  }, 300)
})

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchRoles()
})

onMounted(() => {
  fetchRoles()
})

const clearFilters = () => {
  searchQuery.value = ''
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
  fetchRoles()
}

const isRoleDialogVisible = ref(false)
const isAddRoleDialogVisible = ref(false)
const roleDetail = ref({ id: null, name: '', permissions: [] })

const openCreateDialog = () => {
  isAddRoleDialogVisible.value = true
}

const editRole = async item => {
  editingRole.value = true
  roleDetail.value = { id: null, name: '', permissions: [] }

  try {
    const response = await fetchRole(item.id)
    const detail = response.data ?? response

    roleDetail.value = {
      id: detail.id,
      name: detail.name,
      'guard_name': detail.guard_name ?? 'api',
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
      await $api(`/roles/${item.id}`, { method: 'DELETE' })
      selectedRows.value = selectedRows.value.filter(id => id !== item.id)
      showSuccess('Xoa vai tro thanh cong.')
      fetchRoles()
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
      fetchRoles()
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
          name: item.name || '',
          'guard_name': item.guard_name || 'api',
          permissions: (item.permissions || []).map(permission => permission.name || permission).join(', '),
          'permissions_count': item.permissions?.length || 0,
          'updated_at': formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
        })),
        headers: ['name', 'guard_name', 'permissions', 'permissions_count', 'updated_at'],
        sheetName: 'Roles',
        fileName: `roles_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 24 },
          { wch: 16 },
          { wch: 56 },
          { wch: 18 },
          { wch: 22 },
        ],
      })

      return
    }

    const query = buildAuthQueryString(buildExportParams())

    const response = await $api(`/roles/export${query ? `?${query}` : ''}`, {
      responseType: 'blob',
    })

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

  return items.slice(0, 3)
}

defineExpose({
  exportRoles,
  fetchRoles,
  isExporting,
  openCreateDialog,
  refreshRoles: fetchRoles,
  selectedRows,
})
</script>

<template>
  <VCard class="roles-main-card">
    <VCardText class="roles-main-card__header pb-3">
      <div class="d-flex align-center gap-2 mb-4">
        <VIcon
          icon="tabler-filter"
          size="20"
          color="info"
        />
        <span class="text-subtitle-1 font-weight-bold">{{ t('roles.roles.list.filter') }}</span>
      </div>

      <VRow class="roles-filter-row">
        <VCol
          cols="12"
          md="5"
          class="roles-filter-col"
        >
          <div class="roles-filter-input">
            <AppTextField
              v-model="searchQuery"
              :label="t('roles.roles.list.search_label')"
              :placeholder="t('roles.roles.list.search_placeholder')"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </div>
        </VCol>

        <VCol
          cols="12"
          md="3"
          class="roles-filter-col"
        >
          <div class="roles-filter-input">
            <AppDateTimePicker
              v-model="fromDate"
              :label="t('roles.roles.list.from_date')"
              :placeholder="t('roles.roles.list.from_date_placeholder')"
              :config="{ dateFormat: 'Y-m-d' }"
              clearable
            />
          </div>
        </VCol>

        <VCol
          cols="12"
          md="3"
          class="roles-filter-col"
        >
          <div class="roles-filter-input">
            <AppDateTimePicker
              v-model="toDate"
              :label="t('roles.roles.list.to_date')"
              :placeholder="t('roles.roles.list.to_date_placeholder')"
              :config="{ dateFormat: 'Y-m-d' }"
              clearable
            />
          </div>
        </VCol>

        <VCol
          cols="12"
          md="1"
          class="roles-filter-col justify-end"
        >
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-rotate-clockwise"
            @click="clearFilters"
          >
            {{ t('roles.roles.list.reset') }}
          </VBtn>
        </VCol>
      </VRow>

      <div
        v-if="selectedRows.length"
        class="d-flex align-center justify-space-between flex-wrap gap-3 mt-4"
      >
        <div class="text-body-2 text-medium-emphasis">
          {{ t('roles.roles.list.selected_summary', { count: selectedRows.length }) }}
        </div>

        <VBtn
          v-if="$can('delete', 'Role')"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="bulkDeleteRoles"
        >
          {{ t('roles.roles.list.bulk_delete') }}
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :items="roles"
      item-value="id"
      :items-length="totalItems"
      :headers="headers"
      :loading="loading"
      class="text-no-wrap roles-table"
      show-select
      @update:options="updateOptions"
    >
      <template #item.index="{ index }">
        <span class="text-body-2">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </span>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex flex-column gap-1 py-2">
          <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.name }}</span>
          <span class="text-caption text-disabled">ID #{{ item.id }}</span>
        </div>
      </template>

      <template #item.guard_name="{ item }">
        <VChip
          size="small"
          color="info"
          variant="tonal"
          label
        >
          {{ item.guard_name || 'api' }}
        </VChip>
      </template>

      <template #item.permissions="{ item }">
        <div class="d-flex flex-wrap gap-2 py-2">
          <VChip
            v-for="permission in permissionPreview(item.permissions)"
            :key="permission.id || permission"
            size="x-small"
            color="primary"
            variant="tonal"
            label
          >
            {{ permission.name || permission }}
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

      <template #item.updated_at="{ item }">
        <span class="text-body-2 text-info font-weight-medium">
          {{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('roles.roles.list.no_update') }) }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center">
          <IconBtn
            v-if="$can('update', 'Role')"
            variant="text"
            color="primary"
            size="small"
            @click="editRole(item)"
          >
            <VIcon
              :icon="editingRole && roleDetail.id === item.id ? 'tabler-loader-2' : 'tabler-pencil'"
              size="20"
            />
          </IconBtn>

          <IconBtn
            v-if="$can('delete', 'Role')"
            variant="text"
            color="error"
            size="small"
            @click="deleteRole(item)"
          >
            <VIcon
              icon="tabler-trash"
              size="20"
            />
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
</template>

<style scoped>
.roles-main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 22px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.roles-main-card__header {
  padding-block: 20px 16px;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-primary), 0.04), rgba(var(--v-theme-surface), 0)),
    linear-gradient(90deg, rgba(var(--v-theme-info), 0.04), transparent 30%);
}

.roles-filter-row {
  align-items: center;
}

.roles-filter-col {
  display: flex;
  align-items: center;
}

.roles-filter-input {
  flex: 1 1 auto;
}

.roles-filter-input :deep(.v-input) {
  inline-size: 100%;
}

.roles-filter-input :deep(.v-field) {
  min-block-size: 46px;
}

.roles-filter-input :deep(.v-field__input) {
  align-items: center;
  min-block-size: 46px;
  padding-block: 0;
}

.roles-filter-input :deep(.v-label) {
  margin-block-end: 6px;
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
  background: rgba(var(--v-theme-primary), 0.03);
}

.roles-table :deep(td),
.roles-table :deep(th) {
  border-color: rgba(var(--v-border-color), 0.6);
}

@media (max-width: 959px) {
  .roles-main-card__header {
    padding-block-end: 8px;
  }

  .roles-filter-row {
    row-gap: 4px;
  }
}

@media (max-width: 600px) {
  .roles-filter-col {
    inline-size: 100%;
  }
}
</style>
