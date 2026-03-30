<script setup>
import { downloadPermissionTemplate, importPermissions } from '../services/permissionService'

const { t } = useI18n()

const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const permissions = ref([])
const totalItems = ref(0)
const stats = ref({ groups: 0, total: 0 })

const isEditDialogVisible = ref(false)
const editingPermissionName = ref('')
const editingPermissionDescription = ref('')
const editingPermissionId = ref(null)

const fetchStats = async () => {
  try {
    const res = await $api('/permissions/stats')

    stats.value = {
      groups: res.data?.groups ?? 0,
      total: res.data?.total ?? 0,
    }
  }
  catch (err) {
    console.error('Fetch permission stats error:', err)
  }
}

const fetchPermissions = async () => {
  try {
    const res = await $api('/permissions', {
      params: {
        search: search.value || undefined,
        limit: itemsPerPage.value,
        page: page.value,
        // eslint-disable-next-line camelcase
        sort_by: 'sort_order',
        // eslint-disable-next-line camelcase
        sort_order: 'asc',
      },
    })

    permissions.value = res.data ?? []
    totalItems.value = res.meta?.total ?? res.total ?? permissions.value.length
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    permissions.value = []
  }
}

onMounted(() => {
  fetchStats()
  fetchPermissions()
})

watch([search, page, itemsPerPage], () => {
  fetchPermissions()
})

const isGroupRow = perm => perm.name?.startsWith('group:')

const actionToNameMap = {
  index: t('permissions.permissions.actions.index'),
  show: t('permissions.permissions.actions.show'),
  store: t('permissions.permissions.actions.store'),
  update: t('permissions.permissions.actions.update'),
  destroy: t('permissions.permissions.actions.destroy'),
  bulkDestroy: t('permissions.permissions.actions.bulkDestroy'),
  bulkUpdateStatus: t('permissions.permissions.actions.bulkUpdateStatus'),
  stats: t('permissions.permissions.actions.stats'),
  import: t('permissions.permissions.actions.import'),
  export: t('permissions.permissions.actions.export'),
  review: t('permissions.permissions.actions.review'),
  approve: t('permissions.permissions.actions.approve'),
  download: t('permissions.permissions.actions.download'),
  tree: t('permissions.permissions.actions.tree'),
  changeStatus: t('permissions.permissions.actions.changeStatus'),
  destroyAll: t('permissions.permissions.actions.destroyAll'),
  destroyByDate: t('permissions.permissions.actions.destroyByDate'),
  reorder: t('permissions.permissions.actions.reorder'),
  setActive: t('permissions.permissions.actions.setActive'),
  checkin: t('permissions.permissions.actions.checkin'),
  open: t('permissions.permissions.actions.open'),
  close: t('permissions.permissions.actions.close'),
  vote: t('permissions.permissions.actions.vote'),
  results: t('permissions.permissions.actions.results'),
  incrementView: t('permissions.permissions.actions.incrementView'),
}

const entityToNameMap = {
  dashboard: t('permissions.permissions.entities.dashboard'),
  'business-overview': t('permissions.permissions.entities.business-overview'),
  users: t('permissions.permissions.entities.users'),
  roles: t('permissions.permissions.entities.roles'),
  organizations: t('permissions.permissions.entities.organizations'),
  settings: t('permissions.permissions.entities.settings'),
  posts: t('permissions.permissions.entities.posts'),
  'post-categories': t('permissions.permissions.entities.post-categories'),
  'log-activities': t('permissions.permissions.entities.log-activities'),
  'report-periods': t('permissions.permissions.entities.report-periods'),
  'report-templates': t('permissions.permissions.entities.report-templates'),
  reports: t('permissions.permissions.entities.reports'),
  meetings: t('permissions.permissions.entities.meetings'),
  'meeting-types': t('permissions.permissions.entities.meeting-types'),
  'attendee-groups': t('permissions.permissions.entities.attendee-groups'),
  'meeting-participants': t('permissions.permissions.entities.meeting-participants'),
  'meeting-agendas': t('permissions.permissions.entities.meeting-agendas'),
  'meeting-documents': t('permissions.permissions.entities.meeting-documents'),
  'meeting-conclusions': t('permissions.permissions.entities.meeting-conclusions'),
  'meeting-votings': t('permissions.permissions.entities.meeting-votings'),
  'meeting-speech-requests': t('permissions.permissions.entities.meeting-speech-requests'),
  documents: t('permissions.permissions.entities.documents'),
  'document-types': t('permissions.permissions.entities.document-types'),
  'issuing-agencies': t('permissions.permissions.entities.issuing-agencies'),
  'issuing-levels': t('permissions.permissions.entities.issuing-levels'),
  'document-signers': t('permissions.permissions.entities.document-signers'),
  'document-fields': t('permissions.permissions.entities.document-fields'),
}

const getDisplayName = perm => {
  if (isGroupRow(perm)) {
    const groupName = perm.name.replace('group:', '')

    return entityToNameMap[groupName] || groupName
  }

  const parts = perm.name.split('.')
  if (parts.length === 2) {
    const entity = entityToNameMap[parts[0]] || parts[0]
    const action = actionToNameMap[parts[1]] || parts[1]

    return `${entity} - ${action}`
  }

  return perm.name
}

const getGroupName = perm => {
  if (isGroupRow(perm)) return t('permissions.permissions.page.dash')
  if (perm.parent?.name) return perm.parent.name.replace('group:', '')

  return perm.name.split('.')[0]
}

const roleBadgeColor = name => {
  const map = {
    admin: 'error',
    'super-admin': 'primary',
    editor: 'warning',
    user: 'info',
  }

  return map[name?.toLowerCase()] || 'info'
}

const editPermission = perm => {
  editingPermissionName.value = perm.name
  editingPermissionDescription.value = perm.description
  editingPermissionId.value = perm.id
  isEditDialogVisible.value = true
}

const onPermissionSaved = () => {
  fetchPermissions()
  fetchStats()
}

const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const res = await $api('/permissions/export', { responseType: 'blob' })
    const safeBlob = res instanceof Blob ? res : new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `permissions_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Export permissions error:', err)
  }
  finally {
    isExporting.value = false
  }
}

const isImportDialogVisible = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

const handleImport = async () => {
  if (!importFile.value) return
  isImporting.value = true
  try {
    await importPermissions(importFile.value)
    isImportDialogVisible.value = false
    importFile.value = null
    fetchPermissions()
    fetchStats()
  }
  catch (err) {
    console.error('Import error:', err)
  }
  finally {
    isImporting.value = false
  }
}

const isDownloadingTemplate = ref(false)

const handleDownloadTemplate = async () => {
  isDownloadingTemplate.value = true
  try {
    const blob = await downloadPermissionTemplate()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'permissions_template.xlsx'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }
  catch (err) {
    console.error('Download template error:', err)
  }
  finally {
    isDownloadingTemplate.value = false
  }
}

const headers = [
  { title: t('permissions.permissions.headers.index'), key: 'index', sortable: false, width: '70px' },
  { title: t('permissions.permissions.headers.name'), key: 'name', sortable: false },
  { title: t('permissions.permissions.headers.group'), key: 'group', sortable: false },
  { title: t('permissions.permissions.headers.roles'), key: 'roles', sortable: false },
  { title: t('permissions.permissions.headers.created_at'), key: 'created_at', sortable: false, width: '160px' },
  { title: t('permissions.permissions.headers.actions'), key: 'actions', sortable: false, width: '100px', align: 'center' },
]
</script>

<template>
  <div id="permissions-module-root">
    <VRow class="mb-4">
      <VCol cols="12" class="mb-2">
        <div class="d-flex align-center gap-4">
          <VAvatar color="info" variant="outlined" rounded="xl" size="54" class="border-opacity-100 border-info">
            <VIcon icon="tabler-lock" size="28" />
          </VAvatar>
          <div class="d-flex flex-column">
            <h3 class="text-h3 font-weight-bold mb-1">{{ t('permissions.permissions.page.title') }}</h3>
            <span class="text-body-2 text-disabled">{{ t('permissions.permissions.page.description') }}</span>
          </div>
        </div>
      </VCol>

      <VCol cols="12" md="6">
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">{{ t('permissions.permissions.page.groups_count') }}</p>
              <h3 class="text-h3 font-weight-bold">{{ stats.groups }}</h3>
              <span class="text-caption text-disabled">{{ t('permissions.permissions.page.groups_total') }}</span>
            </div>
            <VAvatar color="info" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-category" size="26" />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">{{ t('permissions.permissions.page.permissions_count') }}</p>
              <h3 class="text-h3 font-weight-bold">{{ stats.total }}</h3>
              <span class="text-caption text-disabled">{{ t('permissions.permissions.page.permissions_total') }}</span>
            </div>
            <VAvatar color="warning" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-key" size="26" />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard>
          <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4 pb-2">
            <div class="d-flex align-center gap-2">
              <VIcon icon="tabler-filter" size="20" class="text-disabled" />
              <span class="text-h6 font-weight-bold">{{ t('permissions.permissions.page.filter') }}</span>
            </div>
            <div class="d-flex align-center gap-2">
              <VBtn v-if="$can('import', 'Permission')" variant="tonal" color="info" prepend-icon="tabler-download" @click="isImportDialogVisible = true">
                {{ t('permissions.permissions.page.import_excel') }}
              </VBtn>
              <VBtn v-if="$can('export', 'Permission')" variant="tonal" color="secondary" prepend-icon="tabler-upload" :loading="isExporting" @click="handleExport">
                {{ t('permissions.permissions.page.export_excel') }}
              </VBtn>
            </div>
          </VCardText>

          <VCardText class="pt-0 pb-4">
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField v-model="search" :placeholder="t('permissions.permissions.page.search_placeholder')" :label="t('permissions.permissions.page.search_label')" prepend-inner-icon="tabler-search" clearable />
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />

          <VDataTableServer v-model:items-per-page="itemsPerPage" v-model:page="page" :items-length="totalItems" :headers="headers" :items="permissions" class="text-no-wrap permission-table">
            <template #item.index="{ index }">
              <span class="text-body-2 text-disabled">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
            </template>

            <template #item.name="{ item }">
              <div v-if="isGroupRow(item)" class="d-flex align-center">
                <h6 class="text-h6 font-weight-bold">{{ getDisplayName(item) }}</h6>
              </div>
              <div v-else class="d-flex align-center gap-2 ps-4">
                <VIcon icon="tabler-corner-down-right" size="16" class="text-disabled" />
                <span class="text-body-1">{{ getDisplayName(item) }}</span>
              </div>
            </template>

            <template #item.group="{ item }">
              <span class="text-body-2 text-disabled">{{ getGroupName(item) }}</span>
            </template>

            <template #item.roles="{ item }">
              <div v-if="item.roles && item.roles.length" class="d-flex gap-1 flex-wrap">
                <VChip v-for="r in item.roles" :key="r.id || r" :color="roleBadgeColor(r.name || r)" size="small" label class="font-weight-medium">
                  {{ r.name || r }}
                </VChip>
              </div>
              <VChip v-else-if="!isGroupRow(item)" color="secondary" size="small" label class="font-weight-medium">
                {{ t('permissions.permissions.page.unassigned_role') }}
              </VChip>
              <span v-else class="text-disabled">{{ t('permissions.permissions.page.dash') }}</span>
            </template>

            <template #item.created_at="{ item }">
              <span class="text-body-2 text-disabled">{{ item.created_at || t('permissions.permissions.page.dash') }}</span>
            </template>

            <template #item.actions="{ item }">
              <IconBtn v-if="!isGroupRow(item) && $can('update', 'Permission')" size="small" color="info" @click="editPermission(item)">
                <VIcon icon="tabler-pencil" size="18" />
              </IconBtn>
              <span v-else class="text-disabled">{{ t('permissions.permissions.page.dash') }}</span>
            </template>

            <template #bottom>
              <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalItems" />
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>

    <AddEditPermissionDialog v-model:is-dialog-visible="isEditDialogVisible" :permission-name="editingPermissionName" :permission-id="editingPermissionId" :permission-description="editingPermissionDescription" @saved="onPermissionSaved" />

    <VDialog v-model="isImportDialogVisible" max-width="500">
      <VCard :title="t('permissions.permissions.page.import_dialog_title')">
        <VCardText>
          <div class="mb-5">
            <VBtn variant="tonal" color="success" size="small" prepend-icon="tabler-download" :loading="isDownloadingTemplate" @click="handleDownloadTemplate">
              {{ t('permissions.permissions.page.download_template') }}
            </VBtn>
            <div class="text-caption mt-1 text-disabled">{{ t('permissions.permissions.page.import_hint') }}</div>
          </div>

          <VFileInput v-model="importFile" :label="t('permissions.permissions.page.select_excel')" accept=".xlsx,.xls,.csv" prepend-icon="tabler-file-spreadsheet" />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="tonal" @click="isImportDialogVisible = false">{{ t('permissions.permissions.page.cancel') }}</VBtn>
          <VBtn color="primary" :loading="isImporting" :disabled="!importFile" @click="handleImport">{{ t('permissions.permissions.page.import') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
.permission-table {
  .v-data-table__tr {
    &:hover {
      background: rgba(var(--v-theme-primary), 0.04) !important;
    }
  }
}
</style>
