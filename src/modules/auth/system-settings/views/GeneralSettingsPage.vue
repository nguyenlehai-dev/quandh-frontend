<script setup>
/* eslint-disable camelcase */

import { h, ref, onMounted } from 'vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { cookieRef } from '@layouts/stores/config'
import { getI18n } from '@/plugins/i18n'
import { themeConfig, layoutConfig as initialLayoutConfig } from '@themeConfig'
import { layoutConfig as activeLayoutConfig } from '@layouts'
import SettingsLayout from './SettingsLayout.vue'

const { t } = useI18n()
const { snackbar, showSuccess, showError } = useActionFeedback()
const loading = ref(false)
const saving = ref(false)

const settings = ref({
  copyright: '',
  designed_by: '',
  language: 'vi',
  time_format: 'H:i:s d/m/Y',
  icon: '',
  logo: '',
})

const languageOptions = [
  { title: t('system-settings.system_settings.general.language_options.vi'), value: 'vi' },
  { title: t('system-settings.system_settings.general.language_options.en'), value: 'en' },
]

const timeFormatOptions = [
  { title: t('system-settings.system_settings.general.time_format_options.full_24h'), value: 'H:i:s d/m/Y' },
  { title: t('system-settings.system_settings.general.time_format_options.short_24h'), value: 'Y-m-d H:i' },
  { title: t('system-settings.system_settings.general.time_format_options.full_12h'), value: 'h:i A d/m/Y' },
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
    },
  }))
}

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/settings')
    if (res.data?.general || res?.general)
      settings.value = { ...settings.value, ...(res.data?.general ?? res?.general) }
  }
  catch (err) {
    console.error('Fetch general settings error:', err)
  }
  finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await $api('/settings', {
      method: 'PUT',
      body: settings.value,
    })

    if (settings.value.logo) localStorage.setItem('app_logo', settings.value.logo)
    else localStorage.removeItem('app_logo')

    if (settings.value.icon) localStorage.setItem('app_icon', settings.value.icon)
    else localStorage.removeItem('app_icon')

    if (settings.value.copyright) localStorage.setItem('app_copyright', settings.value.copyright)
    else localStorage.removeItem('app_copyright')

    cookieRef('language', 'vi').value = settings.value.language
    getI18n().global.locale.value = settings.value.language

    syncFavicon(settings.value.icon)
    syncLogo(settings.value.logo)
    syncCopyright(settings.value.copyright)
    showSuccess('Lưu cấu hình chung thành công.')
  }
  catch (err) {
    console.error('Save general settings error:', err)
    showError(err, 'Không thể lưu cấu hình chung.')
  }
  finally {
    saving.value = false
  }
}

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

onMounted(() => fetchSettings())
</script>

<template>
  <SettingsLayout>
    <VCard :loading="loading">
      <VCardItem class="pb-2">
        <template #prepend>
          <VIcon icon="tabler-settings" size="32" color="primary" class="me-1" />
        </template>
        <VCardTitle class="text-h5 text-primary">
          {{ t('system-settings.system_settings.general.title') }}
        </VCardTitle>
        <VCardSubtitle>{{ t('system-settings.system_settings.general.subtitle') }}</VCardSubtitle>
        <template #append>
          <VBtn
            variant="outlined"
            color="info"
            prepend-icon="tabler-device-floppy"
            :loading="saving"
            @click="saveSettings"
          >
            {{ t('system-settings.system_settings.general.save') }}
          </VBtn>
        </template>
      </VCardItem>

      <VCardText class="pt-2">
        <VRow>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.copyright"
              :label="t('system-settings.system_settings.general.fields.copyright')"
              :placeholder="t('system-settings.system_settings.general.fields.copyright_placeholder')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.designed_by"
              :label="t('system-settings.system_settings.general.fields.designed_by')"
              :placeholder="t('system-settings.system_settings.general.fields.designed_by_placeholder')"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppSelect
              v-model="settings.language"
              :label="t('system-settings.system_settings.general.fields.language')"
              :items="languageOptions"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="settings.time_format"
              :label="t('system-settings.system_settings.general.fields.time_format')"
              :items="timeFormatOptions"
            />
          </VCol>
        </VRow>

        <VDivider class="my-6" />

        <div class="mb-6">
          <div class="d-flex align-center mb-4">
            <VIcon icon="tabler-photo" color="info" size="20" class="me-2" />
            <span class="text-subtitle-1 text-info font-weight-medium">{{ t('system-settings.system_settings.general.favicon.title') }}</span>
          </div>

          <div class="d-flex align-center">
            <VAvatar rounded="circle" size="70" class="me-6" color="primary" variant="tonal">
              <VImg v-if="settings.icon" :src="settings.icon" />
              <VIcon v-else icon="tabler-photo" size="30" />
            </VAvatar>

            <div class="d-flex flex-column justify-center gap-2">
              <div class="d-flex flex-wrap gap-2">
                <VBtn color="info" variant="outlined" size="small" prepend-icon="tabler-cloud-upload" @click="refFaviconInput?.click()">
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

                <VBtn type="reset" color="secondary" variant="tonal" size="small" prepend-icon="tabler-refresh" @click="resetFavicon">
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
            <VIcon icon="tabler-photo" color="info" size="20" class="me-2" />
            <span class="text-subtitle-1 text-info font-weight-medium">{{ t('system-settings.system_settings.general.logo.title') }}</span>
          </div>

          <div class="d-flex align-center">
            <div
              class="d-flex justify-center align-center me-6 rounded"
              style="background-color: rgba(var(--v-theme-primary), 0.08); border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity)); block-size: 70px; inline-size: 150px;"
            >
              <VImg v-if="settings.logo" :src="settings.logo" contain class="w-100 h-100" />
              <VIcon v-else icon="tabler-photo" size="30" color="primary" />
            </div>

            <div class="d-flex flex-column justify-center gap-2">
              <div class="d-flex flex-wrap gap-2">
                <VBtn color="info" variant="outlined" size="small" prepend-icon="tabler-cloud-upload" @click="refLogoInput?.click()">
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

                <VBtn type="reset" color="secondary" variant="tonal" size="small" prepend-icon="tabler-refresh" @click="resetLogo">
                  {{ t('system-settings.system_settings.general.logo.reset') }}
                </VBtn>
              </div>

              <p class="text-caption text-disabled mb-0">
                {{ t('system-settings.system_settings.general.logo.hint') }}
              </p>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </SettingsLayout>
</template>
