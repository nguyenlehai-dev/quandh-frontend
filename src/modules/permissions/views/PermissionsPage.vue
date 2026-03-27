<script setup>
import { exportPermissions, importPermissions } from '../services/permissionService'

const search = ref('')
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
  { title: 'Tên quyền', key: 'name' },
  { title: 'Mô tả', key: 'description', sortable: false },
  { title: 'Ngày tạo', key: 'created_at', sortable: false },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// ─── Data ──────────────────────────────────────
const permissions = ref([])
const totalPermissions = ref(0)
const loading = ref(false)
const stats = ref({ total: 0, active: 0, inactive: 0 })

const fetchPermissions = async () => {
  loading.value = true
  try {
    const res = await $api('/permissions', {
      params: {
        search: search.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    permissions.value = res.data ?? []
    totalPermissions.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    permissions.value = []
    totalPermissions.value = 0
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await $api('/permissions/stats', {
      params: { search: search.value },
    })

    stats.value = res.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (err) {
    console.error('Fetch permission stats error:', err)
  }
}

// Debounce search
watchDebounced(search, () => {
  page.value = 1
  fetchPermissions()
  fetchStats()
}, { debounce: 500 })

// Pagination/sort changes
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchPermissions()
})

onMounted(() => {
  fetchPermissions()
  fetchStats()
})

// ─── Stats Widgets ──────────────────────────────
const widgetData = computed(() => [
  { title: 'Tổng quyền', value: stats.value.total ?? 0, icon: 'tabler-shield', iconColor: 'primary' },
  { title: 'Đang hoạt động', value: stats.value.active ?? 0, icon: 'tabler-shield-check', iconColor: 'success' },
  { title: 'Không hoạt động', value: stats.value.inactive ?? 0, icon: 'tabler-shield-off', iconColor: 'warning' },
])

// ─── CRUD Dialogs ───────────────────────────────
const isPermissionDialogVisible = ref(false)
const isAddPermissionDialogVisible = ref(false)
const permissionName = ref('')
const editingPermissionId = ref(null)

const editPermission = item => {
  isPermissionDialogVisible.value = true
  permissionName.value = item.name
  editingPermissionId.value = item.id
}

const deletePermission = async id => {
  try {
    await $api(`/permissions/${id}`, { method: 'DELETE' })
    fetchPermissions()
    fetchStats()
  }
  catch (err) {
    console.error('Delete permission error:', err)
  }
}

const onPermissionSaved = () => {
  fetchPermissions()
  fetchStats()
}

// ─── Bulk Operations ────────────────────────────
const bulkDeletePermissions = async () => {
  if (!selectedRows.value.length) return
  try {
    await $api('/permissions/bulk-delete', { method: 'POST', body: { ids: selectedRows.value } })
    selectedRows.value = []
    fetchPermissions()
    fetchStats()
  }
  catch (err) {
    console.error('Bulk delete error:', err)
  }
}

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportPermissions({
      search: search.value,
      sort_by: sortBy.value,
      sort_order: orderBy.value,
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `permissions_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  catch (err) {
    console.error('Export error:', err)
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
</script>

<template>
  <VRow>
    <!-- 👉 Stats Widgets -->
    <VCol
      v-for="(data, id) in widgetData"
      :key="id"
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

    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex gap-2 align-center">
            <p class="text-body-1 mb-0">
              Hiển thị
            </p>
            <AppSelect
              :model-value="itemsPerPage"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              style="inline-size: 5.5rem;"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
            />
          </div>

          <div class="d-flex align-center gap-4 flex-wrap">
            <AppTextField
              v-model="search"
              placeholder="Tìm kiếm quyền..."
              style="inline-size: 15.625rem;"
            />

            <!-- 👉 Export -->
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

            <!-- 👉 Import -->
            <VBtn
              v-if="$can('import', 'Permission')"
              variant="tonal"
              color="info"
              prepend-icon="tabler-download"
              @click="isImportDialogVisible = true"
            >
              Nhập Excel
            </VBtn>

            <!-- 👉 Add -->
            <VBtn
              v-if="$can('create', 'Permission')"
              density="default"
              prepend-icon="tabler-plus"
              @click="isAddPermissionDialogVisible = true"
            >
              Thêm quyền
            </VBtn>
          </div>
        </VCardText>

        <!-- 👉 Bulk Action Bar -->
        <template v-if="selectedRows.length > 0">
          <VDivider />
          <VCardText class="d-flex align-center gap-3">
            <span class="text-body-1 font-weight-medium">
              Đã chọn {{ selectedRows.length }} mục
            </span>
            <VSpacer />
            <VBtn
              v-if="$can('bulkDestroy', 'Permission')"
              variant="tonal"
              color="error"
              size="small"
              prepend-icon="tabler-trash"
              @click="bulkDeletePermissions"
            >
              Xóa hàng loạt
            </VBtn>
            <VBtn
              variant="text"
              size="small"
              @click="selectedRows = []"
            >
              Bỏ chọn
            </VBtn>
          </VCardText>
        </template>

        <VDivider />

        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:model-value="selectedRows"
          v-model:page="page"
          :items-length="totalPermissions"
          :headers="headers"
          :items="permissions"
          :loading="loading"
          item-value="id"
          class="text-no-wrap"
          show-select
          @update:options="updateOptions"
        >
          <!-- Name -->
          <template #item.name="{ item }">
            <div class="text-high-emphasis text-body-1">
              {{ item.name }}
            </div>
          </template>

          <!-- Description -->
          <template #item.description="{ item }">
            <div class="text-body-2">
              {{ item.description || '—' }}
            </div>
          </template>

          <!-- Created At -->
          <template #item.created_at="{ item }">
            <div class="text-body-2">
              {{ item.created_at || '—' }}
            </div>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn
              v-if="$can('update', 'Permission')"
              @click="editPermission(item)"
            >
              <VIcon
                size="22"
                icon="tabler-edit"
              />
            </IconBtn>
            <IconBtn
              v-if="$can('delete', 'Permission')"
              @click="deletePermission(item.id)"
            >
              <VIcon
                size="22"
                icon="tabler-trash"
              />
            </IconBtn>
          </template>

          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalPermissions"
            />
          </template>
        </VDataTableServer>
      </VCard>

      <AddEditPermissionDialog
        v-model:is-dialog-visible="isPermissionDialogVisible"
        v-model:permission-name="permissionName"
        :permission-id="editingPermissionId"
        @saved="onPermissionSaved"
      />
      <AddEditPermissionDialog
        v-model:is-dialog-visible="isAddPermissionDialogVisible"
        @saved="onPermissionSaved"
      />
    </VCol>

    <!-- 👉 Import Dialog -->
    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập quyền từ Excel">
        <VCardText>
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
  </VRow>
</template>
