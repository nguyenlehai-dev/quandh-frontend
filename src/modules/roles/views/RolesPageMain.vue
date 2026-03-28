<script setup>
import RoleCards from '../components/RoleCards.vue'
import { exportRoles, importRoles } from '../services/roleService'

// ─── Stats ──────────────────────────────────────
const stats = ref({ total: 0, active: 0, inactive: 0 })

const fetchStats = async () => {
  try {
    const res = await $api('/roles/stats')

    stats.value = res.data ?? { total: 0, active: 0, inactive: 0 }
  }
  catch (err) {
    console.error('Fetch role stats error:', err)
  }
}

onMounted(() => fetchStats())

const widgetData = computed(() => [
  { title: 'Tổng vai trò', value: stats.value.total ?? 0, icon: 'tabler-shield', iconColor: 'primary' },
  { title: 'Đang hoạt động', value: stats.value.active ?? 0, icon: 'tabler-shield-check', iconColor: 'success' },
  { title: 'Không hoạt động', value: stats.value.inactive ?? 0, icon: 'tabler-shield-off', iconColor: 'warning' },
])

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportRoles()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `roles_${new Date().toISOString().slice(0, 10)}.xlsx`
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
    await importRoles(importFile.value)
    isImportDialogVisible.value = false
    importFile.value = null
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
  <div class="roles-page-wrapper">
    <VRow>
      <VCol
        cols="12"
        class="mb-4"
      >
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <!-- Tiêu đề & Icon Header -->
          <div class="d-flex align-center gap-4">
            <VAvatar
              color="info"
              variant="outlined"
              rounded="xl"
              size="54"
              class="border-opacity-100 border-info"
            >
              <VIcon
                icon="tabler-shield-check"
                size="28"
              />
            </VAvatar>
            <div class="d-flex flex-column">
              <h3 class="text-h3 font-weight-bold mb-1">
                Danh sách vai trò
              </h3>
              <span class="text-body-2 text-disabled">Phân quyền vai trò cho menu và tính năng</span>
            </div>
          </div>

          <!-- Các Nút Hành Động -->
          <div class="d-flex gap-2">
            <!-- 👉 Export -->
            <VBtn
              v-if="$can('export', 'Role')"
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
              v-if="$can('import', 'Role')"
              variant="tonal"
              color="info"
              prepend-icon="tabler-download"
              @click="isImportDialogVisible = true"
            >
              Nhập Excel
            </VBtn>
          </div>
        </div>
      </VCol>

      <!-- 👉 Roles Cards -->
      <VCol cols="12">
        <RoleCards />
      </VCol>



      <!-- 👉 Import Dialog -->
      <VDialog
        v-model="isImportDialogVisible"
        max-width="500"
      >
        <VCard title="Nhập vai trò từ Excel">
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
  </div>
</template>
