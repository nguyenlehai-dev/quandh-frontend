<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSystemSettingsTabs } from '../configs/metadata'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => route.name,
  set: val => {
    if (!val || val === route.name)
      return

    router.push({ name: val })
  },
})

const tabsData = computed(() => getSystemSettingsTabs())
</script>

<template>
  <div>
    <div
      class="d-flex align-center mb-6 cursor-pointer"
      @click="$router.push('/system/dashboard')"
    >
      <VIcon
        icon="tabler-arrow-left"
        class="me-2 text-disabled"
      />
      <span class="text-h5 text-disabled">{{ t('system-settings.system_settings.layout.title') }}</span>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="3"
      >
        <VTabs
          v-model="activeTab"
          direction="vertical"
          class="v-tabs-pill disable-tab-transition"
        >
          <VTab
            v-for="tab in tabsData"
            :key="tab.value"
            :value="tab.value"
          >
            <VIcon
              start
              :icon="tab.icon"
            />
            {{ tab.title }}
          </VTab>
        </VTabs>
      </VCol>

      <VCol
        cols="12"
        md="9"
      >
        <slot />
      </VCol>
    </VRow>
  </div>
</template>
