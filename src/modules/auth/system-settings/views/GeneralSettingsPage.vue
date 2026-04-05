<script setup>
/* eslint-disable camelcase */

import { h, ref, onMounted } from 'vue'
import { cookieRef } from '@layouts/stores/config'
import { getI18n } from '@/plugins/i18n'
import { themeConfig, layoutConfig as initialLayoutConfig } from '@themeConfig'
import { layoutConfig as activeLayoutConfig } from '@layouts'
import { systemSettingsPageMeta } from '../configs/metadata'
import { useSystemSettingsPage } from '../composables/useSystemSettingsPage'
import SystemSettingsPageCard from '../components/SystemSettingsPageCard.vue'
import SettingsLayout from './SettingsLayout.vue'

const pageConfig = systemSettingsPageMeta.general

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
    },
  }))
}

const {
  snackbar,
  settings,
  loading,
  saving,
  saveSettings,
} = useSystemSettingsPage(pageConfig, {
  afterSave: async ({ settings: currentSettings }) => {
    if (currentSettings.logo) localStorage.setItem('app_logo', currentSettings.logo)
    else localStorage.removeItem('app_logo')

    if (currentSettings.icon) localStorage.setItem('app_icon', currentSettings.icon)
    else localStorage.removeItem('app_icon')

    if (currentSettings.copyright) localStorage.setItem('app_copyright', currentSettings.copyright)
    else localStorage.removeItem('app_copyright')

    cookieRef('language', 'vi').value = currentSettings.language
    getI18n().global.locale.value = currentSettings.language

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
})
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
          <span class="text-subtitle-1 text-info font-weight-medium">Favicon</span>
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
                Tải lên
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
                Đặt lại
              </VBtn>
            </div>

            <p class="text-caption text-disabled mb-0">
              Chấp nhận định dạng JPG, PNG hoặc GIF cho biểu tượng favicon.
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
          <span class="text-subtitle-1 text-info font-weight-medium">Logo</span>
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
                Tải lên
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
                Đặt lại
              </VBtn>
            </div>

            <p class="text-caption text-disabled mb-0">
              Chấp nhận định dạng JPG, PNG hoặc GIF cho logo hệ thống.
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
