<script setup>
import RoleCards from '../components/RoleCards.vue'
import { downloadRoleTemplate, exportRoles, importRoles } from '../services/roleService'

const { t } = useI18n()

// ─── Stats ──────────────────────────────────────
const stats = ref({ total: 0, admin: 0, user: 0 })
const roleCardsRef = ref()

const fetchStats = async () => {
  try {
    const res = await $api('/roles/stats')

    stats.value = res.data ?? { total: 0, admin: 0, user: 0 }
  }
  catch (err) {
    console.error('Fetch role stats error:', err)
  }
}

onMounted(() => fetchStats())

const widgetData = computed(() => [
  { title: t('roles.roles.list.total_roles'), value: stats.value.total ?? 0, icon: 'tabler-shield', iconColor: 'primary' },
  { title: t('roles.roles.list.admin_roles'), value: stats.value.admin ?? 0, icon: 'tabler-shield-check', iconColor: 'success' },
  { title: t('roles.roles.list.user_roles'), value: stats.value.user ?? 0, icon: 'tabler-users-group', iconColor: 'warning' },
])

// ─── Export ─────────────────────────────────────
const isExporting = ref(false)

const handleExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportRoles()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = `roles_${new Date().toISOString().slice(0, 10)}.xlsx`
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
    const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

    await importRoles(file)
    isImportDialogVisible.value = false
    importFile.value = null
    await fetchStats()
    await roleCardsRef.value?.refreshRoles?.()
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
    const blob = await downloadRoleTemplate()
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'roles_template.xlsx'
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
                {{ t('roles.roles.list.title') }}
              </h3>
              <span class="text-body-2 text-disabled">{{ t('roles.roles.list.description') }}</span>
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
              {{ t('roles.roles.export.button') }}
            </VBtn>

            <!-- 👉 Import -->
            <VBtn
              v-if="$can('import', 'Role')"
              variant="tonal"
              color="info"
              prepend-icon="tabler-download"
              @click="isImportDialogVisible = true"
            >
              {{ t('roles.roles.import.button') }}
            </VBtn>
          </div>
        </div>
      </VCol>

      <!-- 👉 Roles Cards -->
      <VCol cols="12">
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
        <RoleCards
          ref="roleCardsRef"
          @changed="fetchStats"
        />
      </VCol>



      <!-- 👉 Import Dialog -->
      <VDialog
        v-model="isImportDialogVisible"
        max-width="500"
      >
        <VCard :title="t('roles.roles.import.dialog_title')">
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
                {{ t('roles.roles.import.download_template') }}
              </VBtn>
              <div class="text-caption mt-1 text-disabled">
                {{ t('roles.roles.import.helper_text') }}
              </div>
            </div>
            
            <VFileInput
              v-model="importFile"
              :label="t('roles.roles.import.file_label')"
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
              {{ t('roles.roles.import.cancel') }}
            </VBtn>
            <VBtn
              color="primary"
              :loading="isImporting"
              :disabled="!importFile"
              @click="handleImport"
            >
              {{ t('roles.roles.import.confirm') }}
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VRow>
  </div>
</template>
