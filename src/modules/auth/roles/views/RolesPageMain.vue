<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import AuthDataActions from '../../shared/AuthDataActions.vue'
import RoleCards from '../components/RoleCards.vue'
import {
  downloadRoleTemplate,
  fetchRoleStats,
  importRoles,
} from '../services/roleService'

const { t } = useI18n()
const { snackbar, showSuccess, showError } = useActionFeedback()

const stats = ref({ total: 0 })
const roleCardsRef = ref()
const isExporting = computed(() => roleCardsRef.value?.isExporting?.value ?? roleCardsRef.value?.isExporting ?? false)

const fetchStats = async () => {
  try {
    const response = await fetchRoleStats()

    stats.value = response.data ?? { total: 0 }
  }
  catch (err) {
    console.error('Fetch role stats error:', err)
  }
}

onMounted(() => fetchStats())

const widgetData = computed(() => [
  {
    title: t('roles.roles.list.total_roles'),
    value: stats.value.total ?? 0,
    subtitle: t('roles.roles.list.total_roles_subtitle'),
    icon: 'tabler-shield-check',
    iconColor: 'primary',
  },
])

const handleExport = async () => {
  await roleCardsRef.value?.exportRoles?.()
}

const handleImport = async file => {
  try {
    await importRoles(file)
    showSuccess('Import du lieu vai tro thanh cong.')
    await fetchStats()
    await roleCardsRef.value?.refreshRoles?.()
  }
  catch (err) {
    console.error('Import roles error:', err)
    showError(err, 'Khong the import du lieu vai tro.')
    throw err
  }
}

const handleDownloadTemplate = async () => {
  try {
    await downloadRoleTemplate()
  }
  catch (err) {
    console.error('Download role template error:', err)
    showError(err, 'Khong the tai file mau vai tro.')
  }
}

const handleCreate = () => {
  roleCardsRef.value?.openCreateDialog?.()
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
              <span class="text-body-2 text-disabled">
                {{ t('roles.roles.list.description') }}
              </span>
            </div>
          </div>

          <AuthDataActions
            :show-import="$can('import', 'Role')"
            :show-template="$can('import', 'Role')"
            :show-export="$can('export', 'Role')"
            :show-create="$can('create', 'Role')"
            create-label="Them Moi"
            :import-label="t('roles.roles.import.button')"
            import-subtitle="Nap file Excel vao he thong"
            template-subtitle="Lay mau Excel dung cot ma backend dang nhan"
            :export-label="t('roles.roles.export.button')"
            export-subtitle="Xuat danh sach hien tai ra file"
            :import-dialog-title="t('roles.roles.import.dialog_title')"
            :import-hint="t('roles.roles.import.helper_text')"
            :select-file-label="t('roles.roles.import.file_label')"
            :cancel-text="t('roles.roles.import.cancel')"
            :import-text="t('roles.roles.import.confirm')"
            :export-loading="isExporting"
            :import-handler="handleImport"
            :template-handler="handleDownloadTemplate"
            :export-handler="handleExport"
            :create-handler="handleCreate"
          />
        </div>
      </VCol>

      <VCol
        v-for="(data, idx) in widgetData"
        :key="idx"
        cols="12"
        md="4"
      >
        <VCard class="roles-stat-card">
          <VCardText class="roles-stat-card__body d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 roles-stat-card__label mb-2">
                {{ data.title }}
              </p>
              <h3 class="text-h3 roles-stat-card__value mb-1">
                {{ data.value }}
              </h3>
              <span class="text-caption text-disabled">{{ data.subtitle }}</span>
            </div>

            <VAvatar
              :color="data.iconColor"
              variant="tonal"
              rounded="lg"
              size="50"
              class="roles-stat-card__icon"
            >
              <VIcon
                :icon="data.icon"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <RoleCards
          ref="roleCardsRef"
          @changed="fetchStats"
        />
      </VCol>

      <ActionSnackbar
        v-model="snackbar.show"
        :message="snackbar.message"
        :color="snackbar.color"
      />
    </VRow>
  </div>
</template>

<style scoped>
.roles-stat-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 18px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.roles-stat-card::before {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.95), rgba(var(--v-theme-info), 0.65));
  content: '';
}

.roles-stat-card__body {
  padding: 22px 24px;
}

.roles-stat-card__label {
  color: rgba(var(--v-theme-on-surface), 0.68);
  letter-spacing: 0.01em;
}

.roles-stat-card__value {
  font-weight: 700;
  line-height: 1;
}

.roles-stat-card__icon {
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-primary), 0.08);
}
</style>
