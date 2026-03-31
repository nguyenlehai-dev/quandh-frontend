<script setup>
/* eslint-disable camelcase */

import AddEditOrganizationDrawer from '@/components/dialogs/AddEditOrganizationDrawer.vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { ability } from '@/plugins/casl/ability'
import { downloadOrganizationTemplate, exportOrganizations, importOrganizations } from '../services/organizationService'

const { t } = useI18n()

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
  { title: t('organizations.organizations.headers.index'), key: 'index', sortable: false, width: '70px' },
  { title: t('organizations.organizations.headers.name'), key: 'name' },
  { title: t('organizations.organizations.headers.parent'), key: 'parent' },
  { title: t('organizations.organizations.headers.status'), key: 'status', sortable: false, width: '140px' },
  { title: t('organizations.organizations.headers.updated_at'), key: 'updated_at' },
  { title: t('organizations.organizations.headers.actions'), key: 'actions', sortable: false, align: 'center', width: '120px' },
]

const organizations = ref([])
const totalOrganizations = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })

const fetchOrganizations = async () => {
  loading.value = true
  try {
    const res = await $api('/organizations', {
      params: {
        search: searchQuery.value,
        status: selectedStatus.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    organizations.value = res.data ?? []
    totalOrganizations.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch organizations error:', err)
    organizations.value = []
    totalOrganizations.value = 0
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await $api('/organizations/stats', {
      params: {
        search: searchQuery.value,
        status: selectedStatus.value,
      },
    })

    stats.value = res.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (err) {
    console.error('Fetch org stats error:', err)
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

onMounted(() => {
  fetchOrganizations()
  fetchStats()
})

const statusOptions = [
  { title: t('organizations.organizations.status.active'), value: 'active' },
  { title: t('organizations.organizations.status.inactive'), value: 'inactive' },
]

const resolveStatusVariant = status => {
  if (status === 'active')
    return { color: 'success', text: t('organizations.organizations.status.active') }

  return { color: 'error', text: t('organizations.organizations.status.inactive') }
}

const widgetData = computed(() => [
  { title: t('organizations.organizations.widgets.total'), value: stats.value.total ?? 0, icon: 'tabler-building', iconColor: 'primary' },
  { title: t('organizations.organizations.widgets.active'), value: stats.value.active ?? 0, icon: 'tabler-building-community', iconColor: 'success' },
  { title: t('organizations.organizations.widgets.inactive'), value: stats.value.inactive ?? 0, icon: 'tabler-building-skyscraper', iconColor: 'warning' },
])

const isDialogVisible = ref(false)
const editingOrganization = ref(null)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()
const currentOrganizationId = computed(() => Number(useCookie('currentOrganizationId').value) || null)

const isCurrentOrganization = organizationId => Number(organizationId) === currentOrganizationId.value

const selectedOrganizations = computed(() => organizations.value.filter(item => selectedRows.value.includes(item.id)))

const bulkStatusOptions = computed(() => {
  if (!selectedOrganizations.value.length)
    return []

  return statusOptions.filter(option => {
    const candidateOrganizations = option.value === 'inactive'
      ? selectedOrganizations.value.filter(item => !isCurrentOrganization(item.id))
      : selectedOrganizations.value

    if (!candidateOrganizations.length)
      return false

    return candidateOrganizations.some(item => item.status !== option.value)
  })
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
    showError(err, 'Không thể thực hiện thao tác này.')
  }
  finally {
    isConfirming.value = false
  }
}

const deleteOrganization = async id => {
  if (!ability.can('delete', 'Organization')) return
  openConfirmDialog({
    title: 'Xóa tổ chức',
    message: 'Bạn có chắc chắn muốn xóa tổ chức này không?',
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await $api(`/organizations/${id}`, { method: 'DELETE' })

      const idx = selectedRows.value.indexOf(id)
      if (idx !== -1) selectedRows.value.splice(idx, 1)
      showSuccess('Xóa tổ chức thành công.')
      fetchOrganizations()
      fetchStats()
    },
  })
}

const onSaved = payload => {
  if (payload?.message)
    showSuccess(payload.message)

  fetchOrganizations()
  fetchStats()
}

const bulkDeleteOrgs = async () => {
  if (!ability.can('delete', 'Organization')) return
  if (!selectedRows.value.length) return
  openConfirmDialog({
    title: 'Xóa hàng loạt tổ chức',
    message: `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} tổ chức đã chọn không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await $api('/organizations/bulk-delete', { method: 'POST', body: { ids: selectedRows.value } })
      selectedRows.value = []
      showSuccess('Xóa hàng loạt tổ chức thành công.')
      fetchOrganizations()
      fetchStats()
    },
  })
}

const bulkChangeStatus = async newStatus => {
  if (!ability.can('update', 'Organization')) return
  if (!selectedRows.value.length) return

  let targetIds = [...selectedRows.value]
  const skippedCurrentOrganization = newStatus === 'inactive' && targetIds.some(isCurrentOrganization)

  if (skippedCurrentOrganization) {
    targetIds = targetIds.filter(id => !isCurrentOrganization(id))
  }

  targetIds = targetIds.filter(id => {
    const organization = selectedOrganizations.value.find(item => item.id === id)

    return organization && organization.status !== newStatus
  })

  if (!targetIds.length) {
    showSnackbar('Không có tổ chức hợp lệ để cập nhật trạng thái.', 'warning')

    return
  }

  const nextLabel = statusOptions.find(s => s.value === newStatus)?.title || newStatus

  const confirmMessage = skippedCurrentOrganization
    ? `Bạn có chắc chắn muốn chuyển ${targetIds.length} tổ chức đã chọn sang "${nextLabel}" không? Tổ chức đang làm việc hiện tại sẽ được giữ nguyên.`
    : `Bạn có chắc chắn muốn chuyển ${targetIds.length} tổ chức đã chọn sang "${nextLabel}" không?`

  openConfirmDialog({
    title: 'Đổi trạng thái hàng loạt',
    message: confirmMessage,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await $api('/organizations/bulk-status', { method: 'PATCH', body: { ids: targetIds, status: newStatus } })
      selectedRows.value = []
      showSuccess(skippedCurrentOrganization
        ? 'Cập nhật trạng thái hàng loạt thành công. Tổ chức đang làm việc hiện tại đã được giữ nguyên.'
        : 'Cập nhật trạng thái hàng loạt thành công.')
      fetchOrganizations()
      fetchStats()
    },
  })
}

const changeOrganizationStatus = (item, newStatus) => {
  if (newStatus === 'inactive' && isCurrentOrganization(item.id)) {
    showSnackbar('Không thể chuyển tổ chức đang làm việc hiện tại sang ngừng hoạt động.', 'warning')

    return
  }

  const nextLabel = statusOptions.find(s => s.value === newStatus)?.title || newStatus

  openConfirmDialog({
    title: 'Đổi trạng thái tổ chức',
    message: `Bạn có chắc chắn muốn chuyển "${item.name}" sang "${nextLabel}" không?`,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await $api(`/organizations/${item.id}/status`, { method: 'PATCH', body: { status: newStatus } })
      showSuccess('Cập nhật trạng thái tổ chức thành công.')
      fetchOrganizations()
      fetchStats()
    },
  })
}

const isExporting = ref(false)

const handleExport = async () => {
  if (!ability.can('export', 'Organization')) return
  isExporting.value = true
  try {
    const blob = await exportOrganizations({
      search: searchQuery.value,
      status: selectedStatus.value,
      sort_by: sortBy.value,
      sort_order: orderBy.value,
      page: page.value,
      limit: itemsPerPage.value,
    })

    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `organizations_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    showError(err, 'Không thể xuất dữ liệu tổ chức.')
    console.error('Export error:', err)
  }
  finally {
    isExporting.value = false
  }
}

const isImportDialogVisible = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

const handleImport = async () => {
  if (!ability.can('import', 'Organization')) return
  if (!importFile.value) return
  isImporting.value = true
  try {
    await importOrganizations(importFile.value)
    isImportDialogVisible.value = false
    importFile.value = null
    showSuccess('Import dữ liệu tổ chức thành công.')
    fetchOrganizations()
    fetchStats()
  }
  catch (err) {
    showError(err, 'Không thể import dữ liệu tổ chức.')
    console.error('Import error:', err)
  }
  finally {
    isImporting.value = false
  }
}

const isDownloadingTemplate = ref(false)

const handleDownloadTemplate = async () => {
  if (!ability.can('import', 'Organization')) return
  isDownloadingTemplate.value = true
  try {
    const blob = await downloadOrganizationTemplate()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'organizations_template.xlsx'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    showError(err, 'Không thể tải file mẫu.')
    console.error('Download template error:', err)
  }
  finally {
    isDownloadingTemplate.value = false
  }
}
</script>

<template>
  <div>
    <div class="d-flex mb-6">
      <VRow>
        <VCol
          v-for="(data, idx) in widgetData"
          :key="idx"
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

    <VCard>
      <VCardItem class="pb-4">
        <template #prepend>
          <div class="d-flex align-center">
            <VIcon
              icon="tabler-filter"
              color="primary"
              size="24"
              class="me-2"
            />
            <h5 class="text-h5 text-primary mb-0 font-weight-medium">
              {{ t('organizations.organizations.list.filter') }}
            </h5>
          </div>
        </template>

        <template #append>
          <div class="d-flex gap-4 align-center flex-wrap">
            <VBtn
              v-if="$can('create', 'Organization')"
              variant="outlined"
              color="info"
              prepend-icon="tabler-cloud-upload"
              @click="isImportDialogVisible = true"
            >
              {{ t('organizations.organizations.list.import_data') }}
            </VBtn>
            <VBtn
              v-if="$can('read', 'Organization')"
              variant="outlined"
              color="info"
              prepend-icon="tabler-file-export"
              :loading="isExporting"
              @click="handleExport"
            >
              {{ t('organizations.organizations.list.export_data') }}
            </VBtn>
            <VBtn
              v-if="$can('create', 'Organization')"
              color="primary"
              prepend-icon="tabler-plus"
              @click="openAddDialog"
            >
              {{ t('organizations.organizations.list.add_new') }}
            </VBtn>
          </div>
        </template>
      </VCardItem>

      <VCardText class="pb-6">
        <AppTextField
          v-model="searchQuery"
          :label="t('organizations.organizations.list.search_label')"
          :placeholder="t('organizations.organizations.list.search_placeholder')"
          density="compact"
          class="w-100"
        />
      </VCardText>

      <VDivider />

      <template v-if="selectedRows.length > 0">
        <VCardText class="d-flex align-center gap-3">
          <span class="text-body-1 font-weight-medium">{{ t('organizations.organizations.list.selected_count', { count: selectedRows.length }) }}</span>
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
                v-for="s in bulkStatusOptions"
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
            {{ t('organizations.organizations.list.clear_selection') }}
          </VBtn>
        </VCardText>
      </template>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="organizations"
        :items-length="totalOrganizations"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="text-no-wrap"
        show-select
        hover
        @update:options="updateOptions"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <template v-if="item.parent_id">
              <VIcon
                icon="tabler-arrow-back-up"
                size="16"
                class="me-2 text-disabled"
                style="transform: scaleX(-1);"
              />
            </template>
            <div class="d-flex flex-column gap-y-1">
              <span class="text-body-1 text-high-emphasis font-weight-medium">{{ item.name }}</span>
              <span
                v-if="!item.parent_id"
                class="text-caption text-disabled"
              >{{ t('organizations.organizations.list.root_tree') }}</span>
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
            :color="resolveStatusVariant(item.status).color"
          >
            {{ resolveStatusVariant(item.status).text }}
          </VChip>
        </template>

        <template #item.updated_at="{ item }">
          <div class="d-flex flex-column gap-y-1">
            <span class="text-body-2 font-weight-medium text-primary">
              <VAvatar
                color="primary"
                size="24"
                class="me-1"
              >
                <VIcon
                  v-if="item.editor?.role === t('organizations.organizations.list.system_admin')"
                  size="14"
                  icon="tabler-shield-check"
                />
                <VIcon
                  v-else
                  size="14"
                  icon="tabler-user"
                />
              </VAvatar>
              {{ item.editor?.name || t('organizations.organizations.list.system_admin') }}
            </span>
            <span class="text-caption text-disabled">{{ item.updated_at || t('organizations.organizations.list.empty') }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-center gap-2">
            <IconBtn
              v-if="$can('update', 'Organization')"
              color="info"
              @click="openEditDialog(item)"
            >
              <VIcon
                icon="tabler-pencil"
                size="20"
              />
            </IconBtn>
            <VMenu v-if="$can('update', 'Organization')">
              <template #activator="{ props }">
                <IconBtn
                  color="warning"
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
                  v-for="s in statusOptions.filter(s => s.value !== item.status && !(s.value === 'inactive' && isCurrentOrganization(item.id)))"
                  :key="s.value"
                  @click="changeOrganizationStatus(item, s.value)"
                >
                  <VListItemTitle>{{ s.title }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <IconBtn
              v-if="$can('delete', 'Organization')"
              color="error"
              @click="deleteOrganization(item.id)"
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
      <VCard :title="t('organizations.organizations.list.import_dialog_title')">
        <VCardText>
          <div class="mb-5">
            <VBtn
              variant="tonal"
              color="success"
              size="small"
              prepend-icon="tabler-download"
              :loading="isDownloadingTemplate"
              @click="handleDownloadTemplate"
            >
              {{ t('organizations.organizations.list.download_template') }}
            </VBtn>
            <div class="text-caption mt-1 text-disabled">
              {{ t('organizations.organizations.list.import_hint') }}
            </div>
          </div>

          <VFileInput
            v-model="importFile"
            :label="t('organizations.organizations.list.select_excel')"
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
            {{ t('organizations.organizations.list.cancel') }}
          </VBtn>
          <VBtn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            @click="handleImport"
          >
            {{ t('organizations.organizations.list.import') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
