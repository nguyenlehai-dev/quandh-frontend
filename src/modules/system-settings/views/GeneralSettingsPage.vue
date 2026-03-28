<script setup>
import { ref, onMounted } from 'vue'


const loading = ref(false)
const saving = ref(false)

const settings = ref({
  copyright: 'Bản quyền thuộc về Sở Nội vụ thành phố Đà Nẵng',
  designed_by: 'Danatec',
  language: 'Tiếng Việt',
  time_format: '24h (HH:MM)',
  icon: '',
  logo: '',
})

// Avatar file upload references
const refFaviconInput = ref()
const refLogoInput = ref()

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/settings')
    if (res.data?.general || res?.general) {
      settings.value = { ...settings.value, ...(res.data?.general ?? res?.general) }
    }
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
    
    if (settings.value.logo) {
      localStorage.setItem('app_logo', settings.value.logo)
    }
    
    if (settings.value.icon) {
      localStorage.setItem('app_icon', settings.value.icon)
    }
    
    // Tải lại trang sau nửa giây để app render lại toàn bộ logo & favicon từ cache
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }
  catch (err) {
    console.error('Save general settings error:', err)
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
  <div>
    <!-- Back Header -->
    <div
      class="d-flex align-center mb-6 cursor-pointer"
      @click="$router.push('/system/settings')"
    >
      <VIcon
        icon="tabler-arrow-left"
        class="me-2 text-disabled"
      />
      <span class="text-h5 text-disabled">Cấu hình hệ thống</span>
    </div>

    <!-- 👉 Content -->
    <VCard :loading="loading">
      <VCardItem class="pb-2">
        <template #prepend>
          <VIcon
            icon="tabler-settings"
            size="32"
            color="primary"
            class="me-1"
          />
        </template>
        <VCardTitle class="text-h5 text-primary">
          Cấu hình chung
        </VCardTitle>
        <VCardSubtitle>Cấu hình chung hệ thống</VCardSubtitle>
        <template #append>
          <VBtn
            variant="outlined"
            color="info"
            prepend-icon="tabler-device-floppy"
            :loading="saving"
            @click="saveSettings"
          >
            Lưu
          </VBtn>
        </template>
      </VCardItem>

      <VCardText class="pt-2">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.copyright"
              label="Bản quyền"
              placeholder="Nhập thông tin bản quyền"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.designed_by"
              label="Thiết kế bởi"
              placeholder="Nhập đơn vị thiết kế"
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
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.time_format"
              label="Định Dạng Thời Gian"
              :items="['24h (HH:MM)', '12h (hh:mm A)']"
            />
          </VCol>
        </VRow>

        <VDivider class="my-6" />

        <!-- 👉 Biểu tượng trang -->
        <div class="mb-6">
          <div class="d-flex align-center mb-4">
            <VIcon
              icon="tabler-photo"
              color="info"
              size="20"
              class="me-2"
            />
            <span class="text-subtitle-1 text-info font-weight-medium">Biểu Tượng Trang</span>
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
                  Tải Lên Ảnh Mới
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
                  Đặt Lại
                </VBtn>
              </div>

              <p class="text-caption text-disabled mb-0">
                Định dạng JPG, GIF hoặc PNG. Kích thước tối đa 3MB
              </p>
            </div>
          </div>
        </div>

        <!-- 👉 Logo -->
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
              style="background-color: rgba(var(--v-theme-primary), 0.08); border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity)); block-size: 70px; inline-size: 150px;"
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
                  Tải Lên Ảnh Mới
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
                  Đặt Lại
                </VBtn>
              </div>

              <p class="text-caption text-disabled mb-0">
                Định dạng cho phép: PNG, JPG. Kích thước tối đa 3MB
              </p>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
