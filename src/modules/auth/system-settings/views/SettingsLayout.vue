<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => route.name,
  set: val => router.push({ name: val }),
})

const tabsData = [
  { value: 'system-settings-general', icon: 'tabler-settings', title: t('system-settings.system_settings.layout.tabs.general'), disabled: false },
  { value: 'admin', icon: 'tabler-device-desktop', title: t('system-settings.system_settings.layout.tabs.admin'), disabled: true },
  { value: 'org', icon: 'tabler-building', title: t('system-settings.system_settings.layout.tabs.organization_select'), disabled: true },
  { value: 'user', icon: 'tabler-users', title: t('system-settings.system_settings.layout.tabs.user'), disabled: true },
  { value: 'social', icon: 'tabler-share', title: t('system-settings.system_settings.layout.tabs.social'), disabled: true },
  { value: 'api', icon: 'tabler-api', title: t('system-settings.system_settings.layout.tabs.api'), disabled: true },
  { value: 'shortcut', icon: 'tabler-keyboard', title: t('system-settings.system_settings.layout.tabs.shortcut'), disabled: true },
  { value: 'system-settings-notifications', icon: 'tabler-mail', title: t('system-settings.system_settings.layout.tabs.notifications'), disabled: false },
]
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6 cursor-pointer" @click="$router.push('/system/dashboard')">
      <VIcon icon="tabler-arrow-left" class="me-2 text-disabled" />
      <span class="text-h5 text-disabled">{{ t('system-settings.system_settings.layout.title') }}</span>
    </div>

    <VRow>
      <VCol cols="12" md="3">
        <VTabs v-model="activeTab" direction="vertical" class="v-tabs-pill disable-tab-transition">
          <VTab v-for="tab in tabsData" :key="tab.value" :value="tab.value" :disabled="tab.disabled">
            <VIcon start :icon="tab.icon" />
            {{ tab.title }}
          </VTab>
        </VTabs>
      </VCol>

      <VCol cols="12" md="9">
        <slot />
      </VCol>
    </VRow>
  </div>
</template>
