<script setup>
import RoleCards from '../components/RoleCards.vue'
import UserList from '../components/UserList.vue'
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
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h4 class="text-h4 mb-1">
            Danh sách vai trò
          </h4>
          <p class="text-body-1 mb-0">
            Vai trò cung cấp quyền truy cập vào menu và tính năng đã xác định trước
          </p>
        </div>
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

    <VCol cols="12">
      <h4 class="text-h4 mb-1 mt-6">
        Danh sách người dùng theo vai trò
      </h4>
      <p class="text-body-1 mb-0">
        Tìm tất cả tài khoản quản trị viên và các vai trò liên quan.
      </p>
    </VCol>

    <VCol cols="12">
      <!-- 👉 User List  -->
      <UserList />
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
</template>
