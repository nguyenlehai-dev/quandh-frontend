<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import SystemSettingsGroupPane from '@/modules/system-settings/components/SystemSettingsGroupPane.vue'
import { coreSettingGroups, createEmptySettingState } from '@/modules/system-settings/configs/setting-groups'
import { getCoreSetting, getCoreSettings, updateCoreSettings } from '@/modules/system-settings/services/coreSettings'

const activeTab = ref(0)
const isSaving = ref(false)
const isLoading = ref(false)
const settingsState = ref(createEmptySettingState())
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const tabsData = coreSettingGroups
const activeGroup = computed(() => tabsData[activeTab.value] ?? tabsData[0])

const normalizeIncomingGroup = group => Object.fromEntries(
  group.fields.map(field => {
    const rawValue = settingsState.value[group.key]?.[field.key]

    return [field.key, field.type === 'switch' ? Boolean(rawValue) : rawValue ?? '']
  }),
)

const applyCoreSettings = payload => {
  settingsState.value = coreSettingGroups.reduce((accumulator, group) => {
    accumulator[group.key] = Object.fromEntries(
      group.fields.map(field => {
        const rawValue = payload?.[group.key]?.[field.key]

        return [field.key, field.type === 'switch' ? Boolean(rawValue) : rawValue ?? '']
      }),
    )

    return accumulator
  }, {})
}

const loadSettings = async () => {
  isLoading.value = true

  try {
    const response = await getCoreSettings()

    applyCoreSettings(response?.data ?? {})
  }
  finally {
    isLoading.value = false
  }
}

const refreshActiveGroupLeadField = async () => {
  const leadFieldKey = activeGroup.value?.fields?.[0]?.key

  if (!leadFieldKey)
    return

  try {
    const response = await getCoreSetting(leadFieldKey)
    const settingData = response?.data

    if (settingData?.group && settingData?.key)
      settingsState.value[settingData.group][settingData.key] = settingData.value ?? ''
  }
  catch {
    // Ignore if the backend does not expose this key in current environment.
  }
}

const buildGroupPayload = group => Object.fromEntries(
  group.fields.map(field => {
    const value = settingsState.value[group.key]?.[field.key]

    if (field.type === 'switch')
      return [field.key, Boolean(value)]

    if (field.type === 'number')
      return [field.key, value === '' || value === null ? null : Number(value)]

    return [field.key, value === '' ? null : value]
  }),
)

const saveSystemSettings = async () => {
  isSaving.value = true

  try {
    const response = await updateCoreSettings(buildGroupPayload(activeGroup.value))

    showSnackbar(response?.message || 'Đã lưu cấu hình hệ thống thành công.')
    await loadSettings()
  }
  catch (error) {
    showSnackbar(error?.data?.message || 'Không thể lưu cấu hình hệ thống.', 'error')
  }
  finally {
    isSaving.value = false
  }
}

onMounted(() => {
  hydratePendingSnackbar()
  loadSettings()
})

watch(activeTab, () => {
  refreshActiveGroupLeadField()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          {{ $t('System Settings') }}
        </h4>
      </div>

      <VBtn
        color="success"
        prepend-icon="tabler-device-floppy"
        :loading="isSaving"
        @click="saveSystemSettings"
      >
        {{ $t('Save') }}
      </VBtn>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="3"
      >
        <VCard>
          <VCardItem>
            <VCardTitle>{{ $t('Settings Categories') }}</VCardTitle>
          </VCardItem>

          <VCardText class="pt-2">
            <VTabs
              v-model="activeTab"
              direction="vertical"
              class="v-tabs-pill disable-tab-transition"
            >
              <VTab
                v-for="(tabItem, index) in tabsData"
                :key="tabItem.key"
                :value="index"
                :prepend-icon="tabItem.icon"
                class="justify-start"
              >
                {{ tabItem.title }}
              </VTab>
            </VTabs>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="9"
      >
        <VWindow
          v-model="activeTab"
          class="disable-tab-transition"
          :touch="false"
        >
          <VWindowItem
            v-for="(tabItem, index) in tabsData"
            :key="tabItem.key"
            :value="index"
          >
            <SystemSettingsGroupPane
              :group="tabItem"
              :is-loading="isLoading"
              :model-value="normalizeIncomingGroup(tabItem)"
              @update:model-value="settingsState[tabItem.key] = $event"
            />
          </VWindowItem>
        </VWindow>
      </VCol>
    </VRow>

    <VSnackbar
      v-model="isSnackbarVisible"
      location="top end"
      :color="snackbarColor"
      timeout="2400"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>
