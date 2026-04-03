<script setup>
/* eslint-disable camelcase */

import AddEditPermissionDialog from '@/components/dialogs/AddEditPermissionDialog.vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import AuthDataActions from '../../shared/AuthDataActions.vue'
import {
  bulkDeletePermissions as bulkDeletePermissionsRequest,
  deletePermission as deletePermissionRequest,
  downloadPermissionTemplate,
  fetchPermissionStats,
  fetchPermissionTree,
  fetchPermissions as fetchPermissionsRequest,
  importPermissions,
} from '../services/permissionService'

const { t } = useI18n()
const { snackbar, showSuccess, showError } = useActionFeedback()

const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref('sort_order')
const orderBy = ref('asc')
const permissions = ref([])
const totalItems = ref(0)
const loading = ref(false)
const isExporting = ref(false)
const selectedRows = ref([])
const stats = ref({ total: 0 })
const permissionTree = ref([])
const permissionItem = ref(null)
const isDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })

const headers = [
  { title: t('permissions.permissions.headers.index'), key: 'index', sortable: false, width: '70px' },
  { title: t('permissions.permissions.headers.name'), key: 'name' },
  { title: t('permissions.permissions.headers.group'), key: 'group', sortable: false },
  { title: t('permissions.permissions.headers.guard_name'), key: 'guard_name', sortable: false, width: '120px' },
  { title: t('permissions.permissions.headers.description'), key: 'description', sortable: false },
  { title: t('permissions.permissions.headers.sort_order'), key: 'sort_order', sortable: false, width: '110px' },
  { title: t('permissions.permissions.headers.created_at'), key: 'created_at', sortable: false, width: '170px' },
  { title: t('permissions.permissions.headers.actions'), key: 'actions', sortable: false, width: '130px' },
]

const buildListParams = () => ({
  search: searchQuery.value || undefined,
  from_date: fromDate.value || undefined,
  to_date: toDate.value || undefined,
  limit: itemsPerPage.value,
  page: page.value,
  sort_by: sortBy.value,
  sort_order: orderBy.value,
})

const buildExportParams = () => ({
  ...buildListParams(),
})

const countTreeNodes = nodes => {
  return (nodes || []).reduce((count, node) => {
    return count + 1 + countTreeNodes(node.children || [])
  }, 0)
}

const rootGroupCount = computed(() => (permissionTree.value || []).length)

const parentOptions = computed(() => {
  const options = []

  const appendNodes = (nodes, level = 0) => {
    nodes.forEach(node => {
      options.push({
        title: `${'-- '.repeat(level)}${node.name}`,
        value: node.id,
      })
      appendNodes(node.children || [], level + 1)
    })
  }

  appendNodes(permissionTree.value)

  return options
})

const widgetData = computed(() => [
  {
    title: t('permissions.permissions.page.permissions_count'),
    value: stats.value.total ?? 0,
    subtitle: t('permissions.permissions.page.permissions_total'),
    icon: 'tabler-key',
    iconColor: 'warning',
  },
  {
    title: t('permissions.permissions.page.groups_count'),
    value: rootGroupCount.value,
    subtitle: t('permissions.permissions.page.groups_total'),
    icon: 'tabler-category',
    iconColor: 'info',
  },
])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key || 'sort_order'
  orderBy.value = options.sortBy[0]?.order || 'asc'
}

const fetchStats = async () => {
  try {
    const response = await fetchPermissionStats({
      search: searchQuery.value,
      from_date: fromDate.value,
      to_date: toDate.value,
    })

    stats.value = response.data ?? { total: 0 }
  }
  catch (err) {
    console.error('Fetch permission stats error:', err)
    showError(err, 'Khong the tai thong ke quyen han.')
  }
}

const fetchPermissions = async () => {
  loading.value = true
  try {
    const response = await fetchPermissionsRequest(buildListParams())

    permissions.value = response.data ?? []
    totalItems.value = response.meta?.total ?? response.total ?? 0
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    permissions.value = []
    totalItems.value = 0
    showError(err, 'Khong the tai danh sach quyen han.')
  }
  finally {
    loading.value = false
  }
}

const fetchTree = async () => {
  try {
    const response = await fetchPermissionTree()

    permissionTree.value = response.data ?? []
  }
  catch (err) {
    console.error('Fetch permission tree error:', err)
    permissionTree.value = []
  }
}

const refreshList = async () => {
  await Promise.all([
    fetchPermissions(),
    fetchStats(),
    fetchTree(),
  ])
}

let filterTimeout
watch([searchQuery, fromDate, toDate], () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    page.value = 1
    refreshList()
  }, 300)
})

watch([page, itemsPerPage, sortBy, orderBy], () => {
  fetchPermissions()
})

onMounted(() => {
  refreshList()
})

const clearFilters = () => {
  searchQuery.value = ''
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

const isGroupRow = item => item.name?.startsWith('group:')

const getGroupName = item => {
  if (isGroupRow(item))
    return t('permissions.permissions.page.dash')

  if (item.parent?.name)
    return item.parent.name.replace('group:', '')

  return item.name.split('.')[0]
}

const getDisplayName = item => {
  if (isGroupRow(item))
    return item.name.replace('group:', '')

  return item.name
}

const openCreateDialog = () => {
  permissionItem.value = null
  isDialogVisible.value = true
}

const openEditDialog = item => {
  permissionItem.value = { ...item }
  isDialogVisible.value = true
}

const onSaved = async () => {
  await refreshList()
}

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

const deletePermission = item => {
  openConfirmDialog({
    title: 'Xoa quyen han',
    message: `Ban co chac chan muon xoa quyen "${item.name}" khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deletePermissionRequest(item.id)
      selectedRows.value = selectedRows.value.filter(id => id !== item.id)
      showSuccess('Xoa quyen han thanh cong.')
      await refreshList()
    },
  })
}

const bulkDeletePermissions = () => {
  if (!selectedRows.value.length)
    return

  openConfirmDialog({
    title: 'Xoa hang loat quyen han',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} quyen da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeletePermissionsRequest(selectedRows.value)
      selectedRows.value = []
      showSuccess('Xoa hang loat quyen han thanh cong.')
      await refreshList()
    },
  })
}

const handleExport = async () => {
  isExporting.value = true
  try {
    if (selectedRows.value.length) {
      const selectedPermissions = permissions.value.filter(item => selectedRows.value.includes(item.id))

      exportRowsToExcel({
        rows: selectedPermissions.map(item => ({
          name: item.name || '',
          guard_name: item.guard_name || 'api',
          description: item.description || '',
          sort_order: item.sort_order ?? 0,
          parent_id: item.parent_id ?? '',
          created_at: formatAuthDateTime(item.created_at, { fallback: '' }),
        })),
        headers: ['name', 'guard_name', 'description', 'sort_order', 'parent_id', 'created_at'],
        sheetName: 'Permissions',
        fileName: `permissions_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 28 },
          { wch: 16 },
          { wch: 36 },
          { wch: 14 },
          { wch: 14 },
          { wch: 22 },
        ],
      })

      return
    }

    const response = await $api(`/permissions/export?${buildAuthQueryString(buildExportParams())}`, {
      responseType: 'blob',
    })
    const safeBlob = response instanceof Blob ? response : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `permissions_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Export permissions error:', err)
    showError(err, 'Khong the xuat du lieu quyen han.')
  }
  finally {
    isExporting.value = false
  }
}

const handleImport = async file => {
  try {
    await importPermissions(file)
    showSuccess('Import du lieu quyen han thanh cong.')
    await refreshList()
  }
  catch (err) {
    console.error('Import permissions error:', err)
    showError(err, 'Khong the import du lieu quyen han.')
    throw err
  }
}
</script>

<template>
  <div id="permissions-module-root">
    <VRow class="mb-4">
      <VCol
        cols="12"
        class="mb-2"
      >
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex align-center gap-4">
            <VAvatar
              color="info"
              variant="outlined"
              rounded="xl"
              size="54"
              class="border-opacity-100 border-info"
            >
              <VIcon
                icon="tabler-lock"
                size="28"
              />
            </VAvatar>
            <div class="d-flex flex-column">
              <h3 class="text-h3 font-weight-bold mb-1">
                {{ t('permissions.permissions.page.title') }}
              </h3>
              <span class="text-body-2 text-disabled">{{ t('permissions.permissions.page.description') }}</span>
            </div>
          </div>

          <AuthDataActions
            :show-import="$can('import', 'Permission')"
            :show-template="$can('import', 'Permission')"
            :show-export="$can('export', 'Permission')"
            :show-create="$can('create', 'Permission')"
            create-label="Them Moi"
            :import-label="t('permissions.permissions.page.import_excel')"
            :export-label="t('permissions.permissions.page.export_excel')"
            :import-dialog-title="t('permissions.permissions.page.import_dialog_title')"
            :import-hint="t('permissions.permissions.page.import_hint')"
            :select-file-label="t('permissions.permissions.page.select_excel')"
            :cancel-text="t('permissions.permissions.page.cancel')"
            :import-text="t('permissions.permissions.page.import')"
            :export-loading="isExporting"
            :import-handler="handleImport"
            :template-handler="downloadPermissionTemplate"
            :export-handler="handleExport"
            :create-handler="openCreateDialog"
          />
        </div>
      </VCol>

      <VCol
        v-for="(data, idx) in widgetData"
        :key="idx"
        cols="12"
        md="6"
      >
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                {{ data.title }}
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ data.value }}
              </h3>
              <span class="text-caption text-disabled">{{ data.subtitle }}</span>
            </div>
            <VAvatar
              :color="data.iconColor"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon
                :icon="data.icon"
                size="26"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard class="permissions-main-card">
          <VCardText class="permissions-main-card__header">
            <div class="d-flex align-center gap-2 mb-4">
              <VIcon
                icon="tabler-filter"
                size="20"
                color="info"
              />
              <span class="text-subtitle-1 font-weight-bold">{{ t('permissions.permissions.page.filter') }}</span>
            </div>

            <VRow class="permissions-filter-row">
              <VCol
                cols="12"
                md="5"
              >
                <AppTextField
                  v-model="searchQuery"
                  :placeholder="t('permissions.permissions.page.search_placeholder')"
                  :label="t('permissions.permissions.page.search_label')"
                  prepend-inner-icon="tabler-search"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppDateTimePicker
                  v-model="fromDate"
                  :label="t('permissions.permissions.page.from_date')"
                  :placeholder="t('permissions.permissions.page.from_date_placeholder')"
                  :config="{ dateFormat: 'Y-m-d' }"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppDateTimePicker
                  v-model="toDate"
                  :label="t('permissions.permissions.page.to_date')"
                  :placeholder="t('permissions.permissions.page.to_date_placeholder')"
                  :config="{ dateFormat: 'Y-m-d' }"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="1"
                class="d-flex justify-end align-center"
              >
                <VBtn
                  variant="tonal"
                  color="secondary"
                  prepend-icon="tabler-rotate-clockwise"
                  @click="clearFilters"
                >
                  {{ t('permissions.permissions.page.reset') }}
                </VBtn>
              </VCol>
            </VRow>

            <VAlert
              type="info"
              variant="tonal"
              class="mt-4"
              title="Quyen han he thong"
            >
              Danh sach quyen han duoc sinh theo cau hinh va ma nguon he thong. Man nay dung de quan ly, tim kiem va xuat du lieu.
            </VAlert>

            <div
              v-if="selectedRows.length"
              class="d-flex align-center justify-space-between flex-wrap gap-3 mt-4"
            >
              <div class="text-body-2 text-medium-emphasis">
                {{ t('permissions.permissions.page.selected_summary', { count: selectedRows.length }) }}
              </div>

              <VBtn
                v-if="$can('delete', 'Permission')"
                color="error"
                variant="tonal"
                prepend-icon="tabler-trash"
                @click="bulkDeletePermissions"
              >
                {{ t('permissions.permissions.page.bulk_delete') }}
              </VBtn>
            </div>
          </VCardText>

          <VDivider />

          <VDataTableServer
            v-model:items-per-page="itemsPerPage"
            v-model:model-value="selectedRows"
            v-model:page="page"
            :items-length="totalItems"
            :headers="headers"
            :items="permissions"
            :loading="loading"
            item-value="id"
            class="text-no-wrap permission-table"
            show-select
            @update:options="updateOptions"
          >
            <template #item.index="{ index }">
              <span class="text-body-2 text-disabled">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
            </template>

            <template #item.name="{ item }">
              <div
                v-if="isGroupRow(item)"
                class="d-flex align-center"
              >
                <h6 class="text-h6 font-weight-bold">{{ getDisplayName(item) }}</h6>
              </div>
              <div
                v-else
                class="d-flex align-center gap-2 ps-4"
              >
                <VIcon
                  icon="tabler-corner-down-right"
                  size="16"
                  class="text-disabled"
                />
                <span class="text-body-1">{{ getDisplayName(item) }}</span>
              </div>
            </template>

            <template #item.group="{ item }">
              <span class="text-body-2 text-disabled">{{ getGroupName(item) }}</span>
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

            <template #item.description="{ item }">
              <span class="text-body-2 text-disabled">{{ item.description || t('permissions.permissions.page.dash') }}</span>
            </template>

            <template #item.sort_order="{ item }">
              <span class="text-body-2">{{ item.sort_order ?? 0 }}</span>
            </template>

            <template #item.created_at="{ item }">
              <span class="text-body-2 text-disabled">{{ formatAuthDateTime(item.created_at, { fallback: t('permissions.permissions.page.dash') }) }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center">
                <IconBtn
                  v-if="$can('update', 'Permission')"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="openEditDialog(item)"
                >
                  <VIcon
                    icon="tabler-pencil"
                    size="20"
                  />
                </IconBtn>
                <IconBtn
                  v-if="$can('delete', 'Permission')"
                  variant="text"
                  color="error"
                  size="small"
                  @click="deletePermission(item)"
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
      </VCol>
    </VRow>

    <AddEditPermissionDialog
      v-model:is-dialog-visible="isDialogVisible"
      :permission-item="permissionItem"
      :parent-options="parentOptions"
      @saved="onSaved"
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
  </div>
</template>

<style lang="scss">
.permissions-main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 22px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.permissions-main-card__header {
  padding: 20px 24px 16px;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-primary), 0.04), rgba(var(--v-theme-surface), 0)),
    linear-gradient(90deg, rgba(var(--v-theme-info), 0.04), transparent 30%);
}

.permission-table {
  .v-data-table__tr {
    &:hover {
      background: rgba(var(--v-theme-primary), 0.04) !important;
    }
  }
}
</style>
