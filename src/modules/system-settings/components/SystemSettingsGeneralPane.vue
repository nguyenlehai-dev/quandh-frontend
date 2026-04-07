<script setup>
import { getCoreSettings, updateCoreSettings } from '@/modules/system-settings/services/coreSettings'

const appLogo = '/src/assets/logo.svg'

const defaultSettings = {
  copyright: 'Bản quyền thuộc về Sở Nội vụ thành phố',
  designedBy: 'Danatech',
  language: 'Tiếng Việt',
  timeFormat: '24h (HH:MM)',
  favicon: '/favicon.ico',
  logo: appLogo,
}

const settings = ref({
  ...defaultSettings,
})
const isLoading = ref(false)
const faviconInputRef = ref()
const logoInputRef = ref()

const normalizeLanguageLabel = value => {
  if (value === 'en')
    return 'English'

  return 'Tiếng Việt'
}

const normalizeLanguageValue = value => value === 'English' ? 'en' : 'vi'

const applyCoreSettings = payload => {
  settings.value = {
    copyright: payload.copyright ?? defaultSettings.copyright,
    designedBy: payload.designed_by ?? defaultSettings.designedBy,
    language: normalizeLanguageLabel(payload.language),
    timeFormat: payload.time_format ?? defaultSettings.timeFormat,
    favicon: payload.icon || defaultSettings.favicon,
    logo: payload.logo || defaultSettings.logo,
  }
}

const loadSettings = async () => {
  isLoading.value = true

  try {
    const response = await getCoreSettings()

    applyCoreSettings(response?.data?.general ?? {})
  }
  finally {
    isLoading.value = false
  }
}

const readPreviewFile = (file, targetKey) => {
  const files = file?.target?.files

  if (!files?.length)
    return

  const fileReader = new FileReader()

  fileReader.readAsDataURL(files[0])
  fileReader.onload = () => {
    if (typeof fileReader.result === 'string')
      settings.value[targetKey] = fileReader.result
  }
}

const resetAsset = targetKey => {
  settings.value[targetKey] = defaultSettings[targetKey]
}

const saveSettings = async () => {
  const response = await updateCoreSettings({
    copyright: settings.value.copyright,
    designed_by: settings.value.designedBy,
    language: normalizeLanguageValue(settings.value.language),
    time_format: settings.value.timeFormat,
    icon: settings.value.favicon,
    logo: settings.value.logo,
  })

  return response?.message || 'Cấu hình đã được cập nhật!'
}

defineExpose({
  loadSettings,
  saveSettings,
})

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="d-flex flex-column gap-y-6">
    <VCard>
      <VCardItem>
        <template #title>
          <div class="d-flex align-center gap-x-2">
            <VIcon icon="tabler-settings-cog" />
            <span>Cấu hình chung</span>
          </div>
        </template>
        <template #subtitle>
          Cấu hình chung hệ thống hiện tại
        </template>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.copyright"
              label="Bản quyền"
              :loading="isLoading"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.designedBy"
              label="Thiết kế bởi"
              :loading="isLoading"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.language"
              label="Ngôn ngữ"
              :items="['Tiếng Việt', 'English']"
              :loading="isLoading"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.timeFormat"
              label="Định dạng thời gian"
              :items="['24h (HH:MM)', '12h (hh:mm A)']"
              :loading="isLoading"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard>
      <VCardItem>
        <template #title>
          <div class="d-flex align-center gap-x-2">
            <VIcon icon="tabler-photo" />
            <span>Biểu tượng trang</span>
          </div>
        </template>
      </VCardItem>

      <VCardText class="d-flex flex-column gap-y-6">
        <div class="asset-uploader">
          <div class="d-flex align-center gap-4 flex-wrap">
            <VAvatar
              size="72"
              rounded
              color="info"
              variant="tonal"
              :image="settings.favicon"
            />

            <div class="d-flex flex-column gap-y-2">
              <div class="text-body-1 font-weight-medium">
                Favicon
              </div>

              <div class="d-flex gap-3 flex-wrap">
                <VBtn
                  size="small"
                  color="info"
                  variant="tonal"
                  prepend-icon="tabler-upload"
                  @click="faviconInputRef?.click()"
                >
                  Tải Lên Ảnh Mới
                </VBtn>

                <VBtn
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="tabler-refresh"
                  @click="resetAsset('favicon')"
                >
                  Đặt Lại
                </VBtn>
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Được phép: ICO, GIF hoặc PNG. Kích thước tối đa 3MB.
              </div>
            </div>
          </div>

          <input
            ref="faviconInputRef"
            type="file"
            accept=".ico,.gif,.png,.jpg,.jpeg"
            hidden
            @input="readPreviewFile($event, 'favicon')"
          >
        </div>

        <div class="asset-uploader">
          <div class="d-flex align-center gap-4 flex-wrap">
            <VAvatar
              size="72"
              rounded
              color="primary"
              variant="tonal"
              :image="settings.logo"
            />

            <div class="d-flex flex-column gap-y-2">
              <div class="text-body-1 font-weight-medium">
                Logo
              </div>

              <div class="d-flex gap-3 flex-wrap">
                <VBtn
                  size="small"
                  color="info"
                  variant="tonal"
                  prepend-icon="tabler-upload"
                  @click="logoInputRef?.click()"
                >
                  Tải Lên Ảnh Mới
                </VBtn>

                <VBtn
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="tabler-refresh"
                  @click="resetAsset('logo')"
                >
                  Đặt Lại
                </VBtn>
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Định dạng cho phép: JPG, PNG, SVG. Kích thước tối đa 3MB.
              </div>
            </div>
          </div>

          <input
            ref="logoInputRef"
            type="file"
            accept=".svg,.png,.jpg,.jpeg"
            hidden
            @input="readPreviewFile($event, 'logo')"
          >
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.asset-uploader {
  padding: 1rem;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 0.75rem;
}
</style>
