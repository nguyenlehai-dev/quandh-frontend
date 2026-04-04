<script setup>
import { systemSettingsPageMeta } from '../configs/metadata'
import { useSystemSettingsPage } from '../composables/useSystemSettingsPage'
import SystemSettingsPageCard from '../components/SystemSettingsPageCard.vue'
import SettingsLayout from './SettingsLayout.vue'

const pageConfig = systemSettingsPageMeta.publicChannels
const { snackbar, settings, loading, saving, saveSettings } = useSystemSettingsPage(pageConfig)
</script>

<template>
  <SettingsLayout>
    <SystemSettingsPageCard
      :config="pageConfig"
      :settings="settings"
      :loading="loading"
      :saving="saving"
      @save="saveSettings"
      @update-field="({ key, value }) => (settings[key] = value)"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </SettingsLayout>
</template>
