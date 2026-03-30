<script setup>
import { downloadPermissionTemplate, importPermissions } from '../services/permissionService'
/* eslint-disable-next-line lines-around-comment */
// ─── State ──────────────────────────────────────
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const permissions = ref([])
const totalItems = ref(0)
const stats = ref({ groups: 0, total: 0 })

// ─── Dialogs ────────────────────────────────────
const isEditDialogVisible = ref(false)
const editingPermissionName = ref('')
const editingPermissionDescription = ref('')
const editingPermissionId = ref(null)

// ─── Fetch stats ────────────────────────────────
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

// ─── Fetch list ─────────────────────────────────
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

// Fetch on mount
onMounted(() => {
  fetchStats()
  fetchPermissions()
})

// Watch search & pagination
watch([search, page, itemsPerPage], () => {
  fetchPermissions()
})

// ─── Helpers ────────────────────────────────────
const isGroupRow = perm => perm.name?.startsWith('group:')

const actionToNameMap = {
  index: 'Truy cập danh sách',
  show: 'Xem chi tiết',
  store: 'Tạo mới',
  update: 'Cập nhật',
  destroy: 'Xóa',
  bulkDestroy: 'Xóa hàng loạt',
  bulkUpdateStatus: 'Cập nhật trạng thái hàng loạt',
  stats: 'Thống kê',
  import: 'Nhập dữ liệu',
  export: 'Xuất dữ liệu',
  review: 'Xem xét',
  approve: 'Phê duyệt',
  download: 'Tải xuống',
}

const entityToNameMap = {
  users: 'Người dùng',
  roles: 'Vai trò',
  organizations: 'Tổ chức',
  posts: 'Bài viết/Tin tức',
  'post-categories': 'Danh mục bài viết',
  'log-activities': 'Nhật ký',
  'report-periods': 'Đợt báo cáo',
  'report-templates': 'Mẫu báo cáo',
  reports: 'Báo cáo',
  meetings: 'Cuộc họp',
  documents: 'Tài liệu',
  'document-types': 'Loại tài liệu',
  'issuing-agencies': 'Cơ quan ban hành',
  'issuing-levels': 'Cấp ban hành',
  'document-signers': 'Người ký',
  'document-fields': 'Lĩnh vực văn bản',
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
  if (isGroupRow(perm)) {
    return '—'
  }

  if (perm.parent?.name) {
    return perm.parent.name.replace('group:', '')
  }

  return perm.name.split('.')[0]
}

// ─── Role badge colors ──────────────────────────
const roleBadgeColor = name => {
  const map = {
    admin: 'error',
    'super-admin': 'primary',
    editor: 'warning',
    user: 'info',
  }

  return map[name?.toLowerCase()] || 'info'
}

// ─── Edit ───────────────────────────────────────
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

// ─── Export ──────────────────────────────────────
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

// ─── Import ─────────────────────────────────────
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

// ─── Download Template ──────────────────────────
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

// ─── Table headers ──────────────────────────────
const headers = [
  { title: 'STT', key: 'index', sortable: false, width: '70px' },
  { title: 'TÊN QUYỀN HẠN', key: 'name', sortable: false },
  { title: 'NHÓM QUYỀN HẠN', key: 'group', sortable: false },
  { title: 'THUỘC VAI TRÒ', key: 'roles', sortable: false },
  { title: 'NGÀY TẠO', key: 'created_at', sortable: false, width: '160px' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, width: '100px', align: 'center' },
]
</script>

<template>
  <div id="permissions-module-root">
    <VRow class="mb-4">
      <!-- ─── Header ──────────────────────── -->
      <VCol
        cols="12"
        class="mb-2"
      >
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
              Quản lý quyền hạn
            </h3>
            <span class="text-body-2 text-disabled">Danh sách tất cả quyền hạn trong hệ thống</span>
          </div>
        </div>
      </VCol>

      <!-- ─── Stat cards ─────────────────── -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Số nhóm quyền hạn
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ stats.groups }}
              </h3>
              <span class="text-caption text-disabled">Tổng số nhóm quyền hạn</span>
            </div>
            <VAvatar
              color="info"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon
                icon="tabler-category"
                size="26"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VCard class="border">
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Số quyền hạn
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ stats.total }}
              </h3>
              <span class="text-caption text-disabled">Tổng số quyền hạn</span>
            </div>
            <VAvatar
              color="warning"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon
                icon="tabler-key"
                size="26"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <!-- ─── Table card ─────────────────── -->
      <VCol cols="12">
        <VCard>
          <!-- Filter bar -->
          <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4 pb-2">
            <div class="d-flex align-center gap-2">
              <VIcon
                icon="tabler-filter"
                size="20"
                class="text-disabled"
              />
              <span class="text-h6 font-weight-bold">Bộ lọc</span>
            </div>
            <div class="d-flex align-center gap-2">
              <VBtn
                v-if="$can('import', 'Permission')"
                variant="tonal"
                color="info"
                prepend-icon="tabler-download"
                @click="isImportDialogVisible = true"
              >
                Nhập Excel
              </VBtn>

              <VBtn
                v-if="$can('export', 'Permission')"
                variant="tonal"
                color="secondary"
                prepend-icon="tabler-upload"
                :loading="isExporting"
                @click="handleExport"
              >
                Xuất Excel
              </VBtn>
            </div>
          </VCardText>

          <VCardText class="pt-0 pb-4">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="search"
                  placeholder="Nhập quyền hạn"
                  label="Tìm kiếm quyền hạn"
                  prepend-inner-icon="tabler-search"
                  clearable
                />
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />

          <!-- Data table -->
          <VDataTableServer
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            :items-length="totalItems"
            :headers="headers"
            :items="permissions"
            class="text-no-wrap permission-table"
          >
            <!-- STT -->
            <template #item.index="{ index }">
              <span class="text-body-2 text-disabled">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
            </template>

            <!-- Permission name -->
            <template #item.name="{ item }">
              <div
                v-if="isGroupRow(item)"
                class="d-flex align-center"
              >
                <h6 class="text-h6 font-weight-bold">
                  {{ getDisplayName(item) }}
                </h6>
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

            <!-- Group column -->
            <template #item.group="{ item }">
              <span class="text-body-2 text-disabled">{{ getGroupName(item) }}</span>
            </template>

            <!-- Roles column -->
            <template #item.roles="{ item }">
              <div
                v-if="item.roles && item.roles.length"
                class="d-flex gap-1 flex-wrap"
              >
                <VChip
                  v-for="r in item.roles"
                  :key="r.id || r"
                  :color="roleBadgeColor(r.name || r)"
                  size="small"
                  label
                  class="font-weight-medium"
                >
                  {{ r.name || r }}
                </VChip>
              </div>
              <VChip
                v-else-if="!isGroupRow(item)"
                color="info"
                size="small"
                label
                class="font-weight-medium"
              >
                Quản trị viên hệ thống
              </VChip>
              <span
                v-else
                class="text-disabled"
              >—</span>
            </template>

            <!-- Created date -->
            <template #item.created_at="{ item }">
              <span class="text-body-2 text-disabled">{{ item.created_at || '—' }}</span>
            </template>

            <!-- Actions -->
            <template #item.actions="{ item }">
              <IconBtn
                v-if="!isGroupRow(item) && $can('update', 'Permission')"
                size="small"
                color="info"
                @click="editPermission(item)"
              >
                <VIcon
                  icon="tabler-pencil"
                  size="18"
                />
              </IconBtn>
              <span
                v-else
                class="text-disabled"
              >—</span>
            </template>

            <!-- Pagination -->
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

    <!-- Edit Dialog -->
    <AddEditPermissionDialog
      v-model:is-dialog-visible="isEditDialogVisible"
      :permission-name="editingPermissionName"
      :permission-id="editingPermissionId"
      :permission-description="editingPermissionDescription"
      @saved="onPermissionSaved"
    />

    <!-- 👉 Import Dialog -->
    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập quyền hạn từ Excel">
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
              Tải File Mẫu
            </VBtn>
            <div class="text-caption mt-1 text-disabled">
              * Vui lòng tải file mẫu về, điền dữ liệu và upload lại hệ thống.
            </div>
          </div>
          
          <VFileInput
            v-model="importFile"
            label="Chọn file Excel"
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
            Hủy
          </VBtn>
          <VBtn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            @click="handleImport"
          >
            Nhập
          </VBtn>
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
