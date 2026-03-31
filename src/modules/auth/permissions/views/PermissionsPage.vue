<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'

const { t } = useI18n()

const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const permissions = ref([])
const totalItems = ref(0)
const stats = ref({ groups: 0, total: 0 })

const { snackbar, showError } = useActionFeedback()

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
    showError(err, 'Không thể tải thống kê quyền hạn.')
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
    showError(err, 'Không thể tải danh sách quyền hạn.')
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
    showError(err, 'Không thể xuất dữ liệu quyền hạn.')
  }
  finally {
    isExporting.value = false
  }
}

const headers = [
  { title: t('permissions.permissions.headers.index'), key: 'index', sortable: false, width: '70px' },
  { title: t('permissions.permissions.headers.name'), key: 'name', sortable: false },
  { title: t('permissions.permissions.headers.group'), key: 'group', sortable: false },
  { title: t('permissions.permissions.headers.roles'), key: 'roles', sortable: false },
  { title: t('permissions.permissions.headers.created_at'), key: 'created_at', sortable: false, width: '160px' },
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
              <VCol cols="12">
                <VAlert
                  type="info"
                  variant="tonal"
                  title="Quyền hạn hệ thống"
                >
                  Danh sách quyền hạn được sinh theo cấu hình và mã nguồn hệ thống. Màn này chỉ dùng để tra cứu, tìm kiếm và xuất dữ liệu.
                </VAlert>
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
            <template #bottom>
              <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalItems" />
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
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
