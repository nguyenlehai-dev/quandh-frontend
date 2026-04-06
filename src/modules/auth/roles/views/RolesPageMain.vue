<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import RoleCards from '../components/RoleCards.vue'
import {
  downloadRoleTemplate,
  importRoles,
} from '../services/roleService'

const { t } = useI18n()
const { snackbar, showSuccess, showError } = useActionFeedback()

const stats = ref({ total: 0 })
const roleCardsRef = ref()
const isImporting = ref(false)

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
  isImporting.value = true
  try {
    await importRoles(file)
    showSuccess(t('roles.roles.messages.import_success'))
    await roleCardsRef.value?.refreshRoles?.()
  }
  catch (err) {
    console.error('Import roles error:', err)
    showError(err, t('roles.roles.messages.import_error'))
    throw err
  }
  finally {
    isImporting.value = false
  }
}

const handleDownloadTemplate = async () => {
  try {
    await downloadRoleTemplate()
  }
  catch (err) {
    console.error('Download role template error:', err)
    showError(err, t('roles.roles.messages.template_error'))
  }
}

const handleCreate = () => {
  roleCardsRef.value?.openCreateDialog?.()
}

const handleStatsChanged = value => {
  stats.value = value ?? { total: 0 }
}
</script>

<template>
  <div class="roles-page-wrapper">
    <VRow>
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
          :can-import="$can('import', 'Role')"
          :can-export="$can('export', 'Role')"
          :can-create="$can('create', 'Role')"
          :can-bulk-destroy="$can('delete', 'Role')"
          :is-importing="isImporting"
          :download-template-handler="handleDownloadTemplate"
          @import="handleImport"
          @export="handleExport"
          @add="handleCreate"
          @stats-changed="handleStatsChanged"
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
  border: 1px solid rgba(var(--v-theme-primary-darken-1), 0.08);
  border-radius: 18px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.roles-stat-card::before {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary-darken-1), 0.95), rgba(var(--v-theme-info), 0.65));
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
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-primary-darken-1), 0.08);
}
</style>
