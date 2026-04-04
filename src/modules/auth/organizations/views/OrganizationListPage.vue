<script setup>
/* eslint-disable camelcase */

import AddEditOrganizationDrawer from '@/components/dialogs/AddEditOrganizationDrawer.vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { ability } from '@/plugins/casl/ability'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import AuthDataActions from '../../shared/AuthDataActions.vue'
import OrganizationDetailDialog from '../components/OrganizationDetailDialog.vue'
import {
  bulkDeleteOrganizations,
  bulkUpdateOrganizationStatus,
  changeOrganizationStatus as changeOrganizationStatusRequest,
  deleteOrganization as deleteOrganizationRequest,
  downloadOrganizationImportTemplate,
  fetchOrganizationStats,
  fetchOrganizations as fetchOrganizationsRequest,
  importOrganizations,
} from '../services/organizationService'

const { t } = useI18n()

const searchQuery = ref('')
const selectedStatus = ref()
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectionSeeds = ref([])
const selectedRows = ref([])

const organizations = ref([])
const totalOrganizations = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })

const isDialogVisible = ref(false)
const editingOrganization = ref(null)
const selectedOrganizationId = ref(null)
const isDetailDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const isExporting = ref(false)

const confirmDialog = ref({
  title: '',
  message: '',
  confirmText: 'Xac nhan',
  confirmColor: 'primary',
  action: null,
})

const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()
const currentOrganizationId = computed(() => Number(useCookie('currentOrganizationId').value) || null)

const headers = [
  { title: t('organizations.organizations.headers.index'), key: 'index', sortable: false, width: '70px' },
  { title: t('organizations.organizations.headers.name'), key: 'name' },
  { title: t('organizations.organizations.headers.parent'), key: 'parent' },
  { title: t('organizations.organizations.headers.status'), key: 'status', sortable: false, width: '140px' },
  { title: t('organizations.organizations.headers.updated_at'), key: 'updated_at' },
  { title: t('organizations.organizations.headers.actions'), key: 'actions', sortable: false, align: 'center', width: '180px' },
]

const statusOptions = [
  { title: t('organizations.organizations.status.active'), value: 'active' },
  { title: t('organizations.organizations.status.inactive'), value: 'inactive' },
]

const selectedOrganizations = computed(() => organizations.value.filter(item => selectedRows.value.includes(item.id)))

const organizationById = computed(() => {
  const map = new Map()

  organizations.value.forEach(item => {
    map.set(Number(item.id), item)
  })

  return map
})

const childIdsByParentId = computed(() => {
  const map = new Map()

  organizations.value.forEach(item => {
    const parentId = item.parent_id == null ? null : Number(item.parent_id)
    if (!map.has(parentId))
      map.set(parentId, [])

    map.get(parentId).push(Number(item.id))
  })

  return map
})

const bulkStatusOptions = computed(() => {
  if (!selectedOrganizations.value.length)
    return []

  return statusOptions.filter(option => {
    const candidateOrganizations = option.value === 'inactive'
      ? selectedOrganizations.value.filter(item => !isCurrentOrganization(item.id))
      : selectedOrganizations.value

    if (!candidateOrganizations.length)
      return false

    return candidateOrganizations.some(item => !hasInactiveParent(item) && item.status !== option.value)
  })
})

const widgetData = computed(() => [
  { title: t('organizations.organizations.widgets.total'), value: stats.value.total ?? 0, icon: 'tabler-building', iconColor: 'primary' },
  { title: t('organizations.organizations.widgets.active'), value: stats.value.active ?? 0, icon: 'tabler-building-community', iconColor: 'success' },
  { title: t('organizations.organizations.widgets.inactive'), value: stats.value.inactive ?? 0, icon: 'tabler-building-skyscraper', iconColor: 'warning' },
])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const isCurrentOrganization = organizationId => Number(organizationId) === currentOrganizationId.value
const hasInactiveParent = item => item?.parent?.status === 'inactive'

const resolveStatusVariant = status => {
  if (status === 'active')
    return { color: 'success', text: t('organizations.organizations.status.active') }

  return { color: 'error', text: t('organizations.organizations.status.inactive') }
}

const resolveEffectiveStatusVariant = item => {
  if (hasInactiveParent(item)) {
    return {
      color: 'warning',
      text: 'Phu thuoc cha dang ngung',
    }
  }

  return resolveStatusVariant(item.status)
}

const getTreeIndentStyle = item => {
  const depth = Number(item?.depth || 0)

  return {
    paddingInlineStart: `${depth * 24}px`,
  }
}

const getAncestorIds = organizationId => {
  const ancestorIds = []
  let currentId = Number(organizationId)

  while (organizationById.value.has(currentId)) {
    const currentOrganization = organizationById.value.get(currentId)
    const parentId = currentOrganization?.parent_id == null ? null : Number(currentOrganization.parent_id)

    if (parentId == null || !organizationById.value.has(parentId))
      break

    ancestorIds.push(parentId)
    currentId = parentId
  }

  return ancestorIds
}

const getDescendantIds = organizationId => {
  const descendantIds = []
  const stack = [...(childIdsByParentId.value.get(Number(organizationId)) || [])]

  while (stack.length) {
    const childId = stack.pop()

    descendantIds.push(childId)

    const nestedChildIds = childIdsByParentId.value.get(childId) || []

    nestedChildIds.forEach(nestedChildId => stack.push(nestedChildId))
  }

  return descendantIds
}

const resolveSelectedRowsFromSeeds = seedIds => {
  const selectedIdSet = new Set()

  seedIds
    .map(id => Number(id))
    .filter(id => organizationById.value.has(id))
    .forEach(id => {
      selectedIdSet.add(id)
      getAncestorIds(id).forEach(ancestorId => selectedIdSet.add(ancestorId))
      getDescendantIds(id).forEach(descendantId => selectedIdSet.add(descendantId))
    })

  return organizations.value
    .map(item => Number(item.id))
    .filter(id => selectedIdSet.has(id))
}

const syncSelectedRows = () => {
  selectionSeeds.value = selectionSeeds.value
    .map(id => Number(id))
    .filter(id => organizationById.value.has(id))

  selectedRows.value = resolveSelectedRowsFromSeeds(selectionSeeds.value)
}

const handleSelectionChange = nextSelectedIds => {
  const nextIds = (nextSelectedIds || []).map(id => Number(id))
  const currentSelectedSet = new Set(selectedRows.value.map(id => Number(id)))
  const nextSelectedSet = new Set(nextIds)
  const seedSet = new Set(selectionSeeds.value.map(id => Number(id)))

  const addedIds = nextIds.filter(id => !currentSelectedSet.has(id))
  const removedIds = [...currentSelectedSet].filter(id => !nextSelectedSet.has(id))

  addedIds.forEach(id => {
    if (organizationById.value.has(id))
      seedSet.add(id)
  })

  removedIds.forEach(id => {
    seedSet.delete(id)
    getAncestorIds(id).forEach(ancestorId => seedSet.delete(ancestorId))
    getDescendantIds(id).forEach(descendantId => seedSet.delete(descendantId))
  })

  selectionSeeds.value = [...seedSet]
  selectedRows.value = resolveSelectedRowsFromSeeds(selectionSeeds.value)
}

const clearSelectedOrganizations = () => {
  selectionSeeds.value = []
  selectedRows.value = []
}

const buildListParams = () => ({
  search: searchQuery.value,
  status: selectedStatus.value,
  limit: itemsPerPage.value,
  page: page.value,
  sort_by: sortBy.value,
  sort_order: orderBy.value,
})

const buildExportParams = () => ({
  ...buildListParams(),
})

const sortOrganizationsAsTree = items => {
  if (!Array.isArray(items) || !items.length)
    return []

  const groupedByParent = new Map()

  items.forEach(item => {
    const parentKey = item.parent_id == null ? 'root' : String(item.parent_id)

    if (!groupedByParent.has(parentKey))
      groupedByParent.set(parentKey, [])

    groupedByParent.get(parentKey).push(item)
  })

  groupedByParent.forEach(group => {
    group.sort((a, b) => {
      const depthDelta = Number(a.depth || 0) - Number(b.depth || 0)
      if (depthDelta !== 0)
        return depthDelta

      const sortDelta = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      if (sortDelta !== 0)
        return sortDelta

      return Number(a.id || 0) - Number(b.id || 0)
    })
  })

  const flattened = []

  const appendChildren = parentId => {
    const parentKey = parentId == null ? 'root' : String(parentId)
    const children = groupedByParent.get(parentKey) || []

    children.forEach(item => {
      flattened.push(item)
      appendChildren(item.id)
    })
  }

  appendChildren(null)

  return flattened
}

const fetchOrganizations = async () => {
  loading.value = true
  try {
    const response = await fetchOrganizationsRequest(buildListParams())

    organizations.value = sortOrganizationsAsTree(response.data ?? [])
    totalOrganizations.value = response.meta?.total ?? response.total ?? 0
  }
  catch (error) {
    console.error('Fetch organizations error:', error)
    organizations.value = []
    totalOrganizations.value = 0
  }
  finally {
    loading.value = false
    syncSelectedRows()
  }
}

const fetchStats = async () => {
  try {
    const response = await fetchOrganizationStats({
      search: searchQuery.value,
      status: selectedStatus.value,
    })

    stats.value = response.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (error) {
    console.error('Fetch organization stats error:', error)
  }
}

watchDebounced([searchQuery, selectedStatus], () => {
  page.value = 1
  fetchOrganizations()
  fetchStats()
}, { debounce: 500 })

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchOrganizations()
})

watch(organizations, () => {
  syncSelectedRows()
})

onMounted(() => {
  fetchOrganizations()
  fetchStats()
})

const openAddDialog = () => {
  if (!ability.can('create', 'Organization')) return
  editingOrganization.value = null
  isDialogVisible.value = true
}

const openEditDialog = item => {
  if (!ability.can('update', 'Organization')) return
  editingOrganization.value = { ...item }
  isDialogVisible.value = true
}

const openDetailDialog = item => {
  if (!ability.can('read', 'Organization')) return
  selectedOrganizationId.value = item.id
  isDetailDialogVisible.value = true
}

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
  catch (error) {
    showError(error, 'Khong the thuc hien thao tac nay.')
  }
  finally {
    isConfirming.value = false
  }
}

const refreshList = () => {
  fetchOrganizations()
  fetchStats()
}

const deleteOrganization = id => {
  if (!ability.can('delete', 'Organization')) return

  openConfirmDialog({
    title: 'Xoa to chuc',
    message: 'Ban co chac chan muon xoa to chuc nay khong?',
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteOrganizationRequest(id)

      const index = selectedRows.value.indexOf(id)
      if (index !== -1)
        selectedRows.value.splice(index, 1)

      selectionSeeds.value = selectionSeeds.value.filter(seedId => Number(seedId) !== Number(id))

      showSuccess('Xoa to chuc thanh cong.')
      refreshList()
    },
  })
}

const onSaved = payload => {
  if (payload?.message)
    showSuccess(payload.message)

  refreshList()
}

const bulkDeleteOrgs = () => {
  if (!ability.can('delete', 'Organization')) return
  if (!selectedRows.value.length) return

  openConfirmDialog({
    title: 'Xoa hang loat to chuc',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} to chuc da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteOrganizations(selectedRows.value)
      selectionSeeds.value = []
      selectedRows.value = []
      showSuccess('Xoa hang loat to chuc thanh cong.')
      refreshList()
    },
  })
}

const bulkChangeStatus = newStatus => {
  if (!ability.can('update', 'Organization')) return
  if (!selectedRows.value.length) return

  let targetIds = [...selectedRows.value]
  const skippedCurrentOrganization = newStatus === 'inactive' && targetIds.some(isCurrentOrganization)

  const skippedInactiveParentIds = targetIds.filter(id => {
    const organization = selectedOrganizations.value.find(item => item.id === id)

    return hasInactiveParent(organization)
  })

  if (skippedCurrentOrganization)
    targetIds = targetIds.filter(id => !isCurrentOrganization(id))

  if (skippedInactiveParentIds.length)
    targetIds = targetIds.filter(id => !skippedInactiveParentIds.includes(id))

  targetIds = targetIds.filter(id => {
    const organization = selectedOrganizations.value.find(item => item.id === id)

    return organization && organization.status !== newStatus
  })

  if (!targetIds.length) {
    showSnackbar('Khong co to chuc hop le de cap nhat trang thai. To chuc con dang phu thuoc cha ngung hoat dong se khong doi rieng le.', 'warning')

    return
  }

  const nextLabel = statusOptions.find(status => status.value === newStatus)?.title || newStatus

  openConfirmDialog({
    title: 'Doi trang thai hang loat',
    message: skippedCurrentOrganization
      ? `Ban co chac chan muon chuyen ${targetIds.length} to chuc da chon sang "${nextLabel}" khong? To chuc dang lam viec hien tai se duoc giu nguyen.`
      : `Ban co chac chan muon chuyen ${targetIds.length} to chuc da chon sang "${nextLabel}" khong?`,
    confirmText: 'Doi trang thai',
    confirmColor: 'warning',
    action: async () => {
      await bulkUpdateOrganizationStatus(targetIds, newStatus)
      selectionSeeds.value = []
      selectedRows.value = []
      showSuccess('Cap nhat trang thai hang loat thanh cong.')
      refreshList()
    },
  })
}

const changeOrganizationStatus = (item, newStatus) => {
  if (hasInactiveParent(item)) {
    showSnackbar('To chuc con dang phu thuoc to chuc cha ngung hoat dong, khong the doi trang thai rieng le.', 'warning')

    return
  }

  if (newStatus === 'inactive' && isCurrentOrganization(item.id)) {
    showSnackbar('Khong the chuyen to chuc dang lam viec hien tai sang ngung hoat dong.', 'warning')

    return
  }

  const nextLabel = statusOptions.find(status => status.value === newStatus)?.title || newStatus

  openConfirmDialog({
    title: 'Doi trang thai to chuc',
    message: `Ban co chac chan muon chuyen "${item.name}" sang "${nextLabel}" khong?`,
    confirmText: 'Doi trang thai',
    confirmColor: 'warning',
    action: async () => {
      await changeOrganizationStatusRequest(item.id, newStatus)
      showSuccess('Cap nhat trang thai to chuc thanh cong.')
      refreshList()
    },
  })
}

const handleExport = async () => {
  if (!ability.can('export', 'Organization')) return

  isExporting.value = true
  try {
    if (selectedOrganizations.value.length) {
      exportRowsToExcel({
        rows: selectedOrganizations.value.map(item => ({
          name: item.name || '',
          slug: item.slug || '',
          parent_name: item.parent?.name || '',
          status: item.status || '',
          sort_order: item.sort_order ?? '',
          updated_at: formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
        })),
        headers: ['name', 'slug', 'parent_name', 'status', 'sort_order', 'updated_at'],
        sheetName: 'Organizations',
        fileName: `organizations_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
        columns: [
          { wch: 28 },
          { wch: 24 },
          { wch: 28 },
          { wch: 14 },
          { wch: 14 },
          { wch: 22 },
        ],
      })

      return
    }

    const blob = await $api(`/organizations/export?${buildAuthQueryString(buildExportParams())}`, {
      responseType: 'blob',
    })

    const safeBlob = blob instanceof Blob
      ? blob
      : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = window.URL.createObjectURL(safeBlob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `organizations_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()

    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (error) {
    showError(error, 'Khong the xuat du lieu to chuc.')
    console.error('Export organizations error:', error)
  }
  finally {
    isExporting.value = false
  }
}

const handleImport = async file => {
  if (!ability.can('import', 'Organization')) return

  try {
    await importOrganizations(file)
    showSuccess('Import du lieu to chuc thanh cong.')
    refreshList()
  }
  catch (error) {
    showError(error, 'Khong the import du lieu to chuc.')
    console.error('Import organizations error:', error)
  }
}
</script>

<template>
  <div class="organization-page">
    <div class="organization-stats mb-6">
      <VRow>
        <VCol
          v-for="(data, idx) in widgetData"
          :key="idx"
          cols="12"
          md="4"
          sm="6"
        >
          <VCard class="organization-stat-card">
            <VCardText class="organization-stat-card__body">
              <div class="d-flex justify-space-between align-start">
                <div class="d-flex flex-column gap-y-2">
                  <div class="text-body-1 text-high-emphasis organization-stat-card__label">
                    {{ data.title }}
                  </div>
                  <h4 class="text-h3 organization-stat-card__value">
                    {{ data.value }}
                  </h4>
                </div>
                <VAvatar
                  :color="data.iconColor"
                  variant="tonal"
                  rounded
                  size="42"
                  class="organization-stat-card__icon"
                >
                  <VIcon :icon="data.icon" size="26" />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard class="organization-main-card">
      <VCardItem class="pb-4 organization-main-card__header">
        <template #prepend>
          <div class="d-flex align-center organization-toolbar-title">
            <VIcon icon="tabler-filter" color="primary" size="24" class="me-2" />
            <h5 class="text-h5 text-primary mb-0 font-weight-medium">
              {{ t('organizations.organizations.list.filter') }}
            </h5>
          </div>
        </template>

        <template #append>
          <AuthDataActions
            :show-import="$can('import', 'Organization')"
            :show-template="$can('import', 'Organization')"
            :show-export="$can('export', 'Organization')"
            :show-create="$can('create', 'Organization')"
            :create-label="t('organizations.organizations.list.add_new')"
            :import-label="t('organizations.organizations.list.import_data')"
            import-subtitle="Nap file Excel vao he thong"
            template-label="Tai file mau import"
            template-subtitle="Lay mau Excel dung cot ma backend dang nhan"
            :export-label="t('organizations.organizations.list.export_data')"
            export-subtitle="Xuat danh sach hien tai ra file"
            :import-dialog-title="t('organizations.organizations.list.import_dialog_title')"
            import-hint="Import ho tro file `.xlsx`, `.xls`, `.csv` theo contract backend hien tai."
            :select-file-label="t('organizations.organizations.list.select_excel')"
            :cancel-text="t('organizations.organizations.list.cancel')"
            :import-text="t('organizations.organizations.list.import')"
            :export-loading="isExporting"
            :import-handler="handleImport"
            :template-handler="downloadOrganizationImportTemplate"
            :export-handler="handleExport"
            :create-handler="openAddDialog"
          />
        </template>
      </VCardItem>

      <VCardText class="pb-6 organization-filter-panel">
        <VRow class="organization-filter-row">
          <VCol cols="12" md="8" class="organization-filter-col">
            <AppTextField
              v-model="searchQuery"
              class="organization-filter-input"
              :label="t('organizations.organizations.list.search_label')"
              :placeholder="t('organizations.organizations.list.search_placeholder')"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="4" class="organization-filter-col">
            <AppSelect
              v-model="selectedStatus"
              class="organization-filter-input"
              label="Trang thai"
              clearable
              :items="statusOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <template v-if="selectedRows.length > 0">
        <VCardText class="d-flex align-center gap-3 flex-wrap">
          <span class="text-body-1 font-weight-medium">
            {{ t('organizations.organizations.list.selected_count', { count: selectedRows.length }) }}
          </span>
          <VSpacer />
          <VBtn
            v-if="$can('bulkDestroy', 'Organization')"
            variant="tonal"
            color="error"
            size="small"
            prepend-icon="tabler-trash"
            @click="bulkDeleteOrgs"
          >
            {{ t('organizations.organizations.list.bulk_delete') }}
          </VBtn>
          <VMenu>
            <template #activator="{ props }">
              <VBtn
                v-if="$can('bulkUpdateStatus', 'Organization')"
                v-bind="props"
                variant="tonal"
                color="warning"
                size="small"
                prepend-icon="tabler-toggle-left"
                :disabled="!bulkStatusOptions.length"
              >
                {{ t('organizations.organizations.list.change_status') }}
              </VBtn>
            </template>
            <VList>
              <VListItem
                v-for="status in bulkStatusOptions"
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
            @click="clearSelectedOrganizations"
          >
            {{ t('organizations.organizations.list.clear_selection') }}
          </VBtn>
        </VCardText>
      </template>

      <VDivider />

      <VDataTableServer
        class="organization-table text-no-wrap"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :model-value="selectedRows"
        :items="organizations"
        :items-length="totalOrganizations"
        :headers="headers"
        :loading="loading"
        item-value="id"
        show-select
        hover
        @update:model-value="handleSelectionChange"
        @update:options="updateOptions"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center" :style="getTreeIndentStyle(item)">
            <VIcon
              v-if="item.parent_id"
              icon="tabler-arrow-back-up"
              size="16"
              class="me-2 text-disabled"
              style="transform: scaleX(-1);"
            />
            <VIcon
              v-else
              icon="tabler-building-bank"
              size="16"
              class="me-2 text-disabled"
            />
            <div class="d-flex flex-column gap-y-1">
              <span class="text-body-1 text-high-emphasis font-weight-medium">{{ item.name }}</span>
              <span
                v-if="!item.parent_id"
                class="text-caption text-disabled"
              >{{ t('organizations.organizations.list.root_tree') }}</span>
              <span
                v-else
                class="text-caption text-medium-emphasis"
              >Nam trong: {{ item.parent?.name || 'To chuc cha' }}</span>
            </div>
          </div>
        </template>

        <template #item.parent="{ item }">
          <div class="text-body-2">
            {{ item.parent?.name || t('organizations.organizations.list.empty') }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            label
            size="small"
            variant="tonal"
            :color="resolveEffectiveStatusVariant(item).color"
          >
            {{ resolveEffectiveStatusVariant(item).text }}
          </VChip>
        </template>

        <template #item.updated_at="{ item }">
          <div class="d-flex flex-column gap-y-1">
            <span class="text-body-2 font-weight-medium text-primary">
              {{ item.updated_by || t('organizations.organizations.list.system_admin') }}
            </span>
            <span class="text-caption text-disabled">{{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('organizations.organizations.list.empty') }) }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <IconBtn
              v-if="$can('read', 'Organization')"
              color="secondary"
              @click="openDetailDialog(item)"
            >
              <VIcon icon="tabler-eye" size="20" />
            </IconBtn>
            <IconBtn
              v-if="$can('update', 'Organization')"
              color="info"
              @click="openEditDialog(item)"
            >
              <VIcon icon="tabler-pencil" size="20" />
            </IconBtn>
            <VMenu v-if="$can('update', 'Organization')">
              <template #activator="{ props }">
                <IconBtn
                  color="warning"
                  v-bind="props"
                  :disabled="hasInactiveParent(item)"
                >
                  <VIcon icon="tabler-toggle-right" size="20" />
                </IconBtn>
              </template>
              <VList>
                <VListItem
                  v-for="status in statusOptions.filter(option => option.value !== item.status && !(option.value === 'inactive' && isCurrentOrganization(item.id)))"
                  :key="status.value"
                  @click="changeOrganizationStatus(item, status.value)"
                >
                  <VListItemTitle>{{ status.title }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <IconBtn
              v-if="$can('delete', 'Organization')"
              color="error"
              @click="deleteOrganization(item.id)"
            >
              <VIcon icon="tabler-trash" size="20" />
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalOrganizations"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <AddEditOrganizationDrawer
      v-model:is-drawer-open="isDialogVisible"
      :organization="editingOrganization"
      @saved="onSaved"
    />

    <OrganizationDetailDialog
      v-model="isDetailDialogVisible"
      :organization-id="selectedOrganizationId"
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

<style scoped>
.organization-page {
  --organization-accent: rgb(var(--v-theme-primary));
  --organization-accent-soft: rgba(var(--v-theme-primary), 0.08);
  --organization-border: rgba(var(--v-border-color), var(--v-border-opacity));
}

.organization-stat-card,
.organization-main-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.organization-stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
}

.organization-stat-card::before {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.95), rgba(var(--v-theme-info), 0.65));
  content: '';
}

.organization-stat-card__body {
  padding: 22px 24px;
}

.organization-stat-card__label {
  color: rgba(var(--v-theme-on-surface), 0.68);
  letter-spacing: 0.01em;
}

.organization-stat-card__value {
  font-weight: 700;
  line-height: 1;
}

.organization-stat-card__icon {
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-primary), 0.08);
}

.organization-main-card {
  overflow: hidden;
  border-radius: 22px;
}

.organization-main-card__header {
  padding-block: 20px 16px;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-primary), 0.04), rgba(var(--v-theme-surface), 0)),
    linear-gradient(90deg, rgba(var(--v-theme-info), 0.04), transparent 30%);
}

.organization-toolbar-title {
  min-height: 42px;
}

.organization-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.organization-toolbar-actions__button {
  min-inline-size: 164px;
}

.organization-filter-panel {
  padding-block-start: 8px;
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-primary), 0.015));
}

.organization-filter-row {
  align-items: center;
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

.organization-table :deep(.v-data-table-header__content) {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.organization-table :deep(tbody tr) {
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.organization-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03);
}

.organization-table :deep(td),
.organization-table :deep(th) {
  border-color: rgba(var(--v-border-color), 0.6);
}

.organization-table :deep(.v-chip) {
  font-weight: 600;
}

@media (max-width: 959px) {
  .organization-main-card__header {
    padding-block-end: 8px;
  }

  .organization-toolbar-actions {
    justify-content: stretch;
    inline-size: 100%;
    margin-block-start: 12px;
  }

  .organization-filter-row {
    row-gap: 4px;
  }
}

@media (max-width: 600px) {
  .organization-toolbar-title {
    min-height: auto;
    align-items: center;
  }

  .organization-toolbar-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    inline-size: 100%;
  }

  .organization-toolbar-actions__button {
    min-inline-size: 0;
  }

  .organization-toolbar-actions :deep(.v-btn) {
    inline-size: 100%;
    justify-content: center;
  }

  .organization-filter-col {
    inline-size: 100%;
  }
}
</style>
