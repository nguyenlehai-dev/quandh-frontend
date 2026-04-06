<script setup>
/* eslint-disable camelcase */

import { h, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setAppLanguage } from '@/plugins/i18n'
import { themeConfig, layoutConfig as initialLayoutConfig } from '@themeConfig'
import { layoutConfig as activeLayoutConfig } from '@layouts'
import { getSystemSettingsPageMeta } from '../configs/metadata'
import { useSystemSettingsPage } from '../composables/useSystemSettingsPage'
import SystemSettingsPageCard from '../components/SystemSettingsPageCard.vue'
import SettingsLayout from './SettingsLayout.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const pageConfig = computed(() => getSystemSettingsPageMeta().general)
const generalManagedFields = [
  { key: 'icon', group: 'general', type: 'text', defaultValue: '' },
  { key: 'logo', group: 'general', type: 'text', defaultValue: '' },
]

const refFaviconInput = ref()
const refLogoInput = ref()

const buildLogoNode = logo => h('img', {
  src: logo || '/src/assets/logo.svg',
  style: 'height: 38px; max-width: 100%; object-fit: contain; margin-left: -5px;',
})

const syncFavicon = icon => {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  link.href = icon || '/favicon.ico'
}

const syncLogo = logo => {
  const imgNode = buildLogoNode(logo)

  themeConfig.app.logo = imgNode
  initialLayoutConfig.app.logo = imgNode
  activeLayoutConfig.app.logo = imgNode
}

const syncCopyright = copyright => {
  window.dispatchEvent(new CustomEvent('app-settings-updated', {
    detail: {
      icon: settings.value.icon || '',
      logo: settings.value.logo || '',
      language: settings.value.language || 'vi',
      copyright: copyright || '',
      designed_by: settings.value.designed_by || '',
    },
  }))
}

const syncLanguageField = nextLanguage => {
  if (!nextLanguage || settings.value.language === nextLanguage)
    return

  settings.value.language = nextLanguage
}

const {
  snackbar,
  settings,
  loading,
  saving,
  saveSettings,
} = useSystemSettingsPage(pageConfig, {
  extraFields: generalManagedFields,
  afterSave: async ({ settings: currentSettings }) => {
    if (currentSettings.logo) localStorage.setItem('app_logo', currentSettings.logo)
    else localStorage.removeItem('app_logo')

    if (currentSettings.icon) localStorage.setItem('app_icon', currentSettings.icon)
    else localStorage.removeItem('app_icon')

    if (currentSettings.copyright) localStorage.setItem('app_copyright', currentSettings.copyright)
    else localStorage.removeItem('app_copyright')

    if (currentSettings.designed_by) localStorage.setItem('app_designed_by', currentSettings.designed_by)
    else localStorage.removeItem('app_designed_by')

    setAppLanguage(currentSettings.language)

    syncFavicon(currentSettings.icon)
    syncLogo(currentSettings.logo)
    syncCopyright(currentSettings.copyright)
  },
})

const changeFavicon = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        settings.value.icon = fileReader.result
    }
  }
}

const resetFavicon = () => {
  settings.value.icon = ''
}

const changeLogo = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        settings.value.logo = fileReader.result
    }
  }
}

const resetLogo = () => {
  settings.value.logo = ''
}

onMounted(() => {
  syncFavicon(settings.value.icon)
  syncLogo(settings.value.logo)
  window.addEventListener('app-language-updated', handleLanguageUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('app-language-updated', handleLanguageUpdated)
})

watch(() => loading.value, isLoading => {
  if (!isLoading) {
    syncFavicon(settings.value.icon)
    syncLogo(settings.value.logo)
    syncCopyright(settings.value.copyright)
  }
})

watch(() => locale.value, nextLanguage => {
  syncLanguageField(nextLanguage)
})

function handleLanguageUpdated(event) {
  syncLanguageField(event?.detail?.language)
}
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
    >
      <VDivider class="my-6" />

      <div class="mb-6">
        <div class="d-flex align-center mb-4">
          <VIcon
            icon="tabler-photo"
            color="info"
            size="20"
            class="me-2"
          />
          <span class="text-subtitle-1 text-info font-weight-medium">{{ t('system-settings.system_settings.general.favicon.title') }}</span>
        </div>

        <div class="d-flex align-center">
          <VAvatar
            rounded="circle"
            size="70"
            class="me-6"
            color="primary"
            variant="tonal"
          >
            <VImg
              v-if="settings.icon"
              :src="settings.icon"
            />
            <VIcon
              v-else
              icon="tabler-photo"
              size="30"
            />
          </VAvatar>

          <div class="d-flex flex-column justify-center gap-2">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="tabler-cloud-upload"
                @click="refFaviconInput?.click()"
              >
                {{ t('system-settings.system_settings.general.favicon.upload') }}
              </VBtn>

              <input
                ref="refFaviconInput"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @change="changeFavicon"
              >

              <VBtn
                type="reset"
                color="secondary"
                variant="tonal"
                size="small"
                prepend-icon="tabler-refresh"
                @click="resetFavicon"
              >
                {{ t('system-settings.system_settings.general.favicon.reset') }}
              </VBtn>
            </div>

            <p class="text-caption text-disabled mb-0">
              {{ t('system-settings.system_settings.general.favicon.hint') }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div class="d-flex align-center mb-4">
          <VIcon
            icon="tabler-photo"
            color="info"
            size="20"
            class="me-2"
          />
          <span class="text-subtitle-1 text-info font-weight-medium">{{ t('system-settings.system_settings.general.logo.title') }}</span>
        </div>

        <div class="d-flex align-center">
          <div
            class="d-flex justify-center align-center me-6 rounded"
            style="background-color: rgba(var(--v-theme-primary-darken-1), 0.08); border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity)); block-size: 70px; inline-size: 150px;"
          >
            <VImg
              v-if="settings.logo"
              :src="settings.logo"
              contain
              class="w-100 h-100"
            />
            <VIcon
              v-else
              icon="tabler-photo"
              size="30"
              color="primary"
            />
          </div>

          <div class="d-flex flex-column justify-center gap-2">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="tabler-cloud-upload"
                @click="refLogoInput?.click()"
              >
                {{ t('system-settings.system_settings.general.logo.upload') }}
              </VBtn>

              <input
                ref="refLogoInput"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @change="changeLogo"
              >

              <VBtn
                type="reset"
                color="secondary"
                variant="tonal"
                size="small"
                prepend-icon="tabler-refresh"
                @click="resetLogo"
              >
                {{ t('system-settings.system_settings.general.logo.reset') }}
              </VBtn>
            </div>

            <p class="text-caption text-disabled mb-0">
              {{ t('system-settings.system_settings.general.logo.hint') }}
            </p>
          </div>
        </div>
      </div>
    </SystemSettingsPageCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </SettingsLayout>
</template>
