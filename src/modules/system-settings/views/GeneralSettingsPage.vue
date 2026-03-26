<script setup>
const settings = ref({})
const loading = ref(false)
const saving = ref(false)

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/settings')

    settings.value = res.data?.general ?? res?.general ?? {}
  }
  catch (err) {
    console.error('Fetch general settings error:', err)
    settings.value = {}
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
  }
  catch (err) {
    console.error('Save general settings error:', err)
  }
  finally {
    saving.value = false
  }
}

onMounted(() => fetchSettings())
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Cấu hình chung
        </h5>
      </VCardText>
      <VDivider />

      <VCardText v-if="loading">
        <div class="text-center py-4">
          <VProgressCircular indeterminate />
        </div>
      </VCardText>

      <VCardText v-else>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.app_name"
              label="Tên ứng dụng"
              placeholder="Nhập tên ứng dụng"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.app_url"
              label="URL ứng dụng"
              placeholder="https://example.com"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.admin_email"
              label="Email quản trị"
              placeholder="admin@example.com"
              type="email"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.timezone"
              label="Múi giờ"
              :items="['Asia/Ho_Chi_Minh', 'UTC', 'Asia/Bangkok', 'Asia/Tokyo']"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.language"
              label="Ngôn ngữ mặc định"
              :items="[
                { title: 'Tiếng Việt', value: 'vi' },
                { title: 'English', value: 'en' },
              ]"
            />
          </VCol>
          <VCol cols="12">
            <AppTextarea
              v-model="settings.description"
              label="Mô tả hệ thống"
              placeholder="Mô tả ngắn về hệ thống"
              rows="3"
            />
          </VCol>
          <VCol cols="12">
            <VBtn
              :loading="saving"
              @click="saveSettings"
            >
              Lưu cấu hình
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>
