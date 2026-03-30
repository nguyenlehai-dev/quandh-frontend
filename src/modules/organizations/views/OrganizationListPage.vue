<script setup>
import AddEditOrganizationDrawer from '@/components/dialogs/AddEditOrganizationDrawer.vue'
import { downloadOrganizationTemplate, exportOrganizations, importOrganizations } from '../services/organizationService'

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
  { title: 'STT', key: 'index', sortable: false, width: '70px' },
  { title: 'TÊN TỔ CHỨC', key: 'name' },
  { title: 'TỔ CHỨC CẤP CAO', key: 'parent' },
  { title: 'CẬP NHẬT', key: 'updated_at' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, align: 'center', width: '120px' },
]

// ─── Data ──────────────────────────────────────
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

// ─── Status Options ─────────────────────────────
const statusOptions = [
  { title: 'Hoạt động', value: 'active' },
  { title: 'Ngừng', value: 'inactive' },
]

const resolveStatusVariant = status => {
  if (status === 'active') return { color: 'success', text: 'Hoạt động' }

  return { color: 'error', text: 'Ngừng' }
}

// ─── Stats Widgets ──────────────────────────────
const widgetData = computed(() => [
  { title: 'Tổng tổ chức', value: stats.value.total ?? 0, icon: 'tabler-building', iconColor: 'primary' },
  { title: 'Đang hoạt động', value: stats.value.active ?? 0, icon: 'tabler-building-community', iconColor: 'success' },
  { title: 'Ngừng hoạt động', value: stats.value.inactive ?? 0, icon: 'tabler-building-skyscraper', iconColor: 'warning' },
])

// ─── CRUD dialog ────────────────────────────────
const isDialogVisible = ref(false)
const editingOrganization = ref(null)

const openAddDialog = () => {
  editingOrganization.value = null
  isDialogVisible.value = true
}

const openEditDialog = item => {
  editingOrganization.value = { ...item }
  isDialogVisible.value = true
}

const deleteOrganization = async id => {
  await $api(`/organizations/${id}`, { method: 'DELETE' })

  const idx = selectedRows.value.indexOf(id)
  if (idx !== -1) selectedRows.value.splice(idx, 1)
  fetchOrganizations()
  fetchStats()
}

const onSaved = () => {
  fetchOrganizations()
  fetchStats()
}

// ─── Bulk Operations ────────────────────────────
const bulkDeleteOrgs = async () => {
  if (!selectedRows.value.length) return
  try {
    await $api('/organizations/bulk-delete', { method: 'POST', body: { ids: selectedRows.value } })
    selectedRows.value = []
    fetchOrganizations()
    fetchStats()
  }
  catch (err) {
    console.error('Bulk delete error:', err)
  }
}

const bulkChangeStatus = async newStatus => {
  if (!selectedRows.value.length) return
  try {
    await $api('/organizations/bulk-status', { method: 'PATCH', body: { ids: selectedRows.value, status: newStatus } })
    selectedRows.value = []
    fetchOrganizations()
    fetchStats()
  }
  catch (err) {
    console.error('Bulk status error:', err)
  }
}

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
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
    await importOrganizations(importFile.value)
    isImportDialogVisible.value = false
    importFile.value = null
    fetchOrganizations()
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
    console.error('Download template error:', err)
  }
  finally {
    isDownloadingTemplate.value = false
  }
}
</script>

<template>
  <div>
    <!-- 👉 Stats Widgets -->
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

    <!-- 👉 Organization Data Table -->
    <VCard>
      <!-- 👉 Header with Filter Title & Actions -->
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
              Bộ lọc
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
              Nhập Dữ Liệu
            </VBtn>
            
            <VBtn
              v-if="$can('read', 'Organization')"
              variant="outlined"
              color="info"
              prepend-icon="tabler-file-export"
              :loading="isExporting"
              @click="handleExport"
            >
              Xuất Dữ Liệu
            </VBtn>

            <VBtn
              v-if="$can('create', 'Organization')"
              color="primary"
              prepend-icon="tabler-plus"
              @click="openAddDialog"
            >
              Thêm Mới
            </VBtn>
          </div>
        </template>
      </VCardItem>

      <!-- 👉 Search Filter -->
      <VCardText class="pb-6">
        <AppTextField
          v-model="searchQuery"
          label="Tìm kiếm tổ chức"
          placeholder="Nhập tên tổ chức"
          density="compact"
          class="w-100"
        />
      </VCardText>

      <VDivider />

      <!-- 👉 Bulk Action Bar -->
      <template v-if="selectedRows.length > 0">
        <VCardText class="d-flex align-center gap-3">
          <span class="text-body-1 font-weight-medium">
            Đã chọn {{ selectedRows.length }} mục
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
            Xóa hàng loạt
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
              >
                Đổi trạng thái
              </VBtn>
            </template>
            <VList>
              <VListItem
                v-for="s in statusOptions"
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
            Bỏ chọn
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
              <span class="text-body-1 text-high-emphasis font-weight-medium">
                {{ item.name }}
              </span>
              <span
                v-if="!item.parent_id"
                class="text-caption text-disabled"
              >
                Cây tổ chức gốc trong hệ thống
              </span>
            </div>
          </div>
        </template>

        <template #item.parent="{ item }">
          <div class="text-body-2">
            {{ item.parent?.name || '—' }}
          </div>
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
                  v-if="item.editor?.role === 'Quản trị hệ thống'"
                  size="14"
                  icon="tabler-shield-check"
                />
                <VIcon
                  v-else
                  size="14"
                  icon="tabler-user"
                />
              </VAvatar>
              {{ item.editor?.name || 'Quản trị hệ thống' }}
            </span>
            <span class="text-caption text-disabled">
              {{ item.updated_at || '—' }}
            </span>
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

    <!-- 👉 Import Dialog -->
    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập tổ chức từ Excel">
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
