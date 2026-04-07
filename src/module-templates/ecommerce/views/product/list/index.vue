<script setup>
import AddOrganizationDrawer from '@/module-templates/ecommerce/components/AddOrganizationDrawer.vue'
import ExportOrganizationDialog from '@/module-templates/ecommerce/components/ExportOrganizationDialog.vue'
import ImportOrganizationDialog from '@/module-templates/ecommerce/components/ImportOrganizationDialog.vue'
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import {
  bulkDeleteCoreOrganizations,
  bulkUpdateCoreOrganizationStatus,
  changeCoreOrganizationStatus,
  createCoreOrganization,
  deleteCoreOrganization,
  downloadCoreOrganizationsExport,
  downloadCoreOrganizationsTemplate,
  getCoreOrganization,
  getCoreOrganizationTree,
  getCoreOrganizations,
  importCoreOrganizations,
  updateCoreOrganization,
} from '@/modules/organization/services/coreOrganizations'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const headers = computed(() => [
  {
    title: t('Index'),
    key: 'stt',
    sortable: false,
  },
  {
    title: t('Organization Name'),
    key: 'name',
  },
  {
    title: t('Parent Organization'),
    key: 'parentName',
  },
  {
    title: t('Status'),
    key: 'status',
    sortable: false,
  },
  {
    title: t('Updated'),
    key: 'updatedAt',
  },
  {
    title: t('Action'),
    key: 'actions',
    sortable: false,
  },
])

const organizationRows = ref([])
const searchQuery = ref('')
const selectedStatus = ref('all')
const fromDate = ref('')
const toDate = ref('')
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isOrganizationDrawerVisible = ref(false)
const organizationDrawerMode = ref('create')
const selectedOrganization = ref(null)
const isDeleteDialogVisible = ref(false)
const pendingDeleteOrganizationId = ref(null)
const selectedRows = ref([])
const selectedBulkAction = ref()
const isLoading = ref(false)
const totalOrganizations = ref(0)
const totalPages = ref(1)
const organizationNodeLookup = ref(new Map())
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const statusOptions = computed(() => [
  {
    title: t('All'),
    value: 'all',
  },
  {
    title: t('Active'),
    value: 'active',
  },
  {
    title: t('Inactive'),
    value: 'inactive',
  },
])

const bulkActions = computed(() => [
  {
    title: t('Activate'),
    value: 'active',
  },
  {
    title: t('Deactivate'),
    value: 'inactive',
  },
  {
    title: t('Delete'),
    value: 'delete',
  },
])

const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('created_at')
const orderBy = ref('desc')

const parentOrganizationOptions = computed(() => [
  {
    title: 'Không có',
    value: null,
  },
  ...[...organizationNodeLookup.value.values()]
    .filter(item => item.id !== selectedOrganization.value?.id)
    .map(item => ({
      title: item.name,
      value: item.id,
    })),
])

const formatDateTime = value => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime()))
    return value

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

const selectedOrganizations = computed(() => organizationRows.value.filter(item => selectedRows.value.includes(item.id)))

const updateOptions = options => {
  const sortKey = options.sortBy[0]?.key
  const sortKeyMap = {
    name: 'name',
    parentName: 'parent_id',
    status: 'status',
    updatedAt: 'updated_at',
  }

  sortBy.value = sortKey ? (sortKeyMap[sortKey] ?? sortKey) : undefined
  orderBy.value = options.sortBy[0]?.order
}

const flattenOrganizationTree = nodes => nodes.flatMap(node => [
  {
    id: node.id,
    name: node.name,
    slug: node.slug,
    parentId: node.parent_id,
    status: node.status,
  },
  ...flattenOrganizationTree(node.children ?? []),
])

const mapCoreOrganizationToRow = item => {
  const parentNode = item.parent_id ? organizationNodeLookup.value.get(item.parent_id) : null

  return {
    id: item.id,
    name: item.name,
    slug: item.slug ?? '',
    description: item.description ?? '',
    parentId: item.parent_id,
    parentName: parentNode?.name ?? ' - ',
    parentSlug: parentNode?.slug ?? '',
    parentHint: '',
    status: item.status === 'active',
    createdBy: item.created_by ?? 'N/A',
    updatedBy: item.updated_by ?? 'N/A',
    updatedAt: item.updated_at ?? '',
    createdAt: item.created_at ?? '',
    createdDate: item.created_at ?? '',
    depth: item.depth ?? 0,
    sortOrder: item.sort_order ?? 0,
  }
}

const buildOrganizationFilters = (scope = 'filtered') => ({
  search: scope === 'all' ? undefined : searchQuery.value.trim() || undefined,
  status: scope === 'all' || selectedStatus.value === 'all' ? undefined : selectedStatus.value,
  fromDate: scope === 'all' ? undefined : fromDate.value || undefined,
  toDate: scope === 'all' ? undefined : toDate.value || undefined,
  sortBy: sortBy.value || undefined,
  sortOrder: orderBy.value || undefined,
})

const syncSelectedRows = () => {
  selectedRows.value = selectedRows.value.filter(id => organizationRows.value.some(item => item.id === id))
}

const fetchOrganizationTree = async () => {
  const response = await getCoreOrganizationTree()
  const flattenedTree = flattenOrganizationTree(response?.data ?? [])

  organizationNodeLookup.value = new Map(flattenedTree.map(item => [item.id, item]))
}

const fetchOrganizations = async () => {
  isLoading.value = true

  try {
    const response = await getCoreOrganizations({
      ...buildOrganizationFilters(),
      limit: itemsPerPage.value,
      page: page.value,
    })

    organizationRows.value = (response?.data ?? []).map(mapCoreOrganizationToRow)
    totalOrganizations.value = response?.meta?.total ?? organizationRows.value.length
    totalPages.value = response?.meta?.last_page ?? 1
    page.value = response?.meta?.current_page ?? page.value
    syncSelectedRows()
  }
  finally {
    isLoading.value = false
  }
}

const refreshOrganizations = async () => {
  await fetchOrganizationTree()
  await fetchOrganizations()
}

const resetOrganizationDrawer = () => {
  organizationDrawerMode.value = 'create'
  selectedOrganization.value = null
}

const toggleOrganizationStatus = async id => {
  const target = organizationRows.value.find(item => item.id === id)

  if (!target)
    return

  await changeCoreOrganizationStatus(target.id, target.status ? 'inactive' : 'active')
  await refreshOrganizations()
  showSnackbar(`Đã ${target.status ? 'tắt' : 'bật'} trạng thái tổ chức.`)
}

const openOrganizationDrawer = async (mode, organization = null) => {
  organizationDrawerMode.value = mode

  if (organization?.id && mode !== 'create') {
    const response = await getCoreOrganization(organization.id)
    const detail = response?.data ?? {}

    selectedOrganization.value = {
      ...organization,
      description: detail.description ?? organization.description ?? '',
      id: detail.id ?? organization.id,
      name: detail.name ?? organization.name,
      parentId: detail.parent_id ?? organization.parentId ?? null,
      sortOrder: detail.sort_order ?? organization.sortOrder ?? 0,
      status: (detail.status ?? (organization.status ? 'active' : 'inactive')) === 'active',
    }
  }
  else {
    selectedOrganization.value = organization ? { ...organization } : null
  }

  isOrganizationDrawerVisible.value = true
}

const saveOrganization = async organizationData => {
  const payload = {
    name: organizationData.name,
    description: organizationData.description.trim() || null,
    parent_id: organizationData.parentId ?? null,
    status: organizationData.status ? 'active' : 'inactive',
  }

  if (organizationData.id) {
    await updateCoreOrganization(organizationData.id, payload)
    showSnackbar('Đã cập nhật tổ chức thành công.')
  }
  else {
    page.value = 1
    await createCoreOrganization(payload)
    showSnackbar('Đã tạo tổ chức mới thành công.')
  }

  await refreshOrganizations()
  resetOrganizationDrawer()
}

const requestDeleteOrganization = id => {
  pendingDeleteOrganizationId.value = id
  isDeleteDialogVisible.value = true
}

const triggerWorkbookDownload = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map((item, index) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    status: item.status ? 'active' : 'inactive',
    parent_id: item.parentId ?? '',
    parent_slug: item.parentSlug ?? '',
    sort_order: item.sortOrder ?? 0,
    depth: item.depth ?? 0,
    created_by: item.createdBy,
    updated_by: item.updatedBy,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  })))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations')
  XLSX.writeFileXLSX(workbook, fileName)
}

const handleExportOrganizations = async scope => {
  if (scope === 'selected') {
    triggerWorkbookDownload(selectedOrganizations.value, `organizations-selected-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  else {
    await downloadCoreOrganizationsExport(buildOrganizationFilters(scope))
  }

  showSnackbar('Đã xuất dữ liệu tổ chức thành công.')
}

const handleImportOrganizations = async file => {
  page.value = 1
  await importCoreOrganizations(file)
  await refreshOrganizations()
  showSnackbar('Đã nhập dữ liệu tổ chức thành công.')
}

const handleDownloadOrganizationTemplate = async () => {
  await downloadCoreOrganizationsTemplate()
}

const confirmDeleteOrganization = async isConfirmed => {
  if (!isConfirmed || pendingDeleteOrganizationId.value === null)
    return

  await deleteCoreOrganization(pendingDeleteOrganizationId.value)
  await refreshOrganizations()
  pendingDeleteOrganizationId.value = null
  showSnackbar('Đã xóa tổ chức thành công.')
}

const handleBulkAction = async action => {
  if (!action || !selectedRows.value.length)
    return

  if (action === 'delete') {
    await bulkDeleteCoreOrganizations(selectedRows.value)
    showSnackbar('Đã xóa các tổ chức đã chọn.')
  }
  else {
    await bulkUpdateCoreOrganizationStatus(selectedRows.value, action)
    showSnackbar(`Đã ${action === 'active' ? 'bật' : 'tắt'} trạng thái cho các tổ chức đã chọn.`)
  }

  await refreshOrganizations()
  selectedRows.value = []
  selectedBulkAction.value = undefined
}

watch([searchQuery, selectedStatus, fromDate, toDate, itemsPerPage], () => {
  page.value = 1
})

watch([searchQuery, selectedStatus, fromDate, toDate, itemsPerPage, page, sortBy, orderBy], () => {
  fetchOrganizations()
})

watch(isOrganizationDrawerVisible, isOpen => {
  if (!isOpen)
    resetOrganizationDrawer()
})

onMounted(() => {
  hydratePendingSnackbar()
  refreshOrganizations()
})
</script>

<template>
  <VCard class="mb-6">
    <VCardItem class="pb-4">
      <VCardTitle>{{ $t('Filters') }}</VCardTitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppTextField
            v-model="searchQuery"
            :label="$t('Search')"
            :placeholder="$t('Enter organization name')"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppSelect
            v-model="selectedStatus"
            :label="$t('Status')"
            :placeholder="$t('All')"
            :items="statusOptions"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppDateTimePicker
            v-model="fromDate"
            :label="$t('From Date')"
            :placeholder="$t('From Date')"
            :config="{ dateFormat: 'Y-m-d' }"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppDateTimePicker
            v-model="toDate"
            :label="$t('To Date')"
            :placeholder="$t('To Date')"
            :config="{ dateFormat: 'Y-m-d' }"
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

      <div class="d-flex gap-4 flex-wrap align-center">
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-download"
          @click="isImportDialogVisible = true"
        >
          {{ $t('Import') }}
        </VBtn>

        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-upload"
          @click="isExportDialogVisible = true"
        >
          {{ $t('Export') }}
        </VBtn>

        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openOrganizationDrawer('create')"
        >
          {{ $t('Add New Organization') }}
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :headers="headers"
      :items="organizationRows"
      :items-length="totalOrganizations"
      item-value="id"
      :loading="isLoading"
      class="text-no-wrap"
      show-select
      @update:options="updateOptions"
    >
      <template #item.stt="{ index }">
        <span class="text-body-1 text-high-emphasis">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </span>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center gap-x-3">
          <VAvatar
            size="32"
            rounded
            variant="tonal"
            color="secondary"
          >
            <VIcon
              icon="tabler-building"
              size="18"
            />
          </VAvatar>

          <div class="d-flex flex-column">
            <span class="text-body-1 font-weight-medium text-high-emphasis">{{ item.name }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ item.description }}</span>
          </div>
        </div>
      </template>

      <template #item.parentName="{ item }">
        <div class="text-body-1 text-high-emphasis">
          {{ item.parentName }}
        </div>
      </template>

      <template #item.status="{ item }">
        <VSwitch
          :model-value="item.status"
          color="primary"
          hide-details
          inset
          @update:model-value="toggleOrganizationStatus(item.id)"
        />
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

      <template #item.actions="{ item }">
        <IconBtn @click="openOrganizationDrawer('view', item)">
          <VIcon icon="tabler-eye" />
        </IconBtn>

        <IconBtn @click="openOrganizationDrawer('edit', item)">
          <VIcon icon="tabler-edit" />
        </IconBtn>

        <IconBtn>
          <VIcon icon="tabler-dots-vertical" />
          <VMenu activator="parent">
            <VList>
              <VListItem
                prepend-icon="tabler-eye"
                @click="openOrganizationDrawer('view', item)"
              >
                {{ $t('View') }}
              </VListItem>

              <VListItem
                prepend-icon="tabler-pencil"
                @click="openOrganizationDrawer('edit', item)"
              >
                {{ $t('Edit') }}
              </VListItem>

              <VListItem
                prepend-icon="tabler-trash"
                @click="requestDeleteOrganization(item.id)"
              >
                {{ $t('Delete') }}
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </template>

      <template #bottom>
        <VDivider />

        <div class="d-flex flex-wrap align-center justify-space-between gap-4 px-6 py-4">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 5, title: '5' },
              { value: 10, title: '10' },
              { value: 20, title: '20' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
            ]"
            style="inline-size: 6rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />

          <div class="d-flex flex-wrap align-center justify-end gap-4 ms-auto">
                <p class="text-disabled mb-0">
                  {{ paginationMeta({ page, itemsPerPage }, totalOrganizations) }}
                </p>

                <VPagination
                  :model-value="page"
                  active-color="primary"
                  :length="Math.max(totalPages, 1)"
                  :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(totalPages, 1), 5)"
                  @update:model-value="page = $event"
                />
              </div>
        </div>
      </template>
    </VDataTableServer>
  </VCard>

  <AddOrganizationDrawer
    v-model:is-drawer-open="isOrganizationDrawerVisible"
    :mode="organizationDrawerMode"
    :organization="selectedOrganization"
    :parent-options="parentOrganizationOptions"
    @organization-data="saveOrganization"
  />

  <ImportOrganizationDialog
    v-model:is-dialog-visible="isImportDialogVisible"
    @download-template="handleDownloadOrganizationTemplate"
    @import="handleImportOrganizations"
  />

  <ExportOrganizationDialog
    v-model:is-dialog-visible="isExportDialogVisible"
    :selected-count="selectedRows.length"
    @export="handleExportOrganizations"
  />

  <ConfirmDialog
    v-model:is-dialog-visible="isDeleteDialogVisible"
    :confirmation-question="$t('Are you sure you want to delete this organization?')"
    :confirm-title="$t('Deleted')"
    :confirm-msg="$t('The organization has been removed from the list.')"
    :cancel-title="$t('Cancelled')"
    :cancel-msg="$t('The organization remains unchanged.')"
    @confirm="confirmDeleteOrganization"
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
