<script setup>
import { ref, onMounted } from 'vue'
import SettingsLayout from './SettingsLayout.vue'

const settings = ref({})
const loading = ref(false)
const saving = ref(false)

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/settings')

    settings.value = res.data?.email ?? res?.email ?? {}
  }
  catch (err) {
    console.error('Fetch notification settings error:', err)
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
    console.error('Save notification settings error:', err)
  }
  finally {
    saving.value = false
  }
}

onMounted(() => fetchSettings())
</script>

<template>
  <SettingsLayout>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Cấu hình thông báo
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
          <VCol cols="12">
            <VSwitch
              v-model="settings.email_enabled"
              label="Bật thông báo Email"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.smtp_host"
              label="SMTP Host"
              placeholder="smtp.gmail.com"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.smtp_port"
              label="SMTP Port"
              placeholder="587"
              type="number"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.smtp_username"
              label="SMTP Username"
              placeholder="Email tài khoản"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.smtp_password"
              label="SMTP Password"
              placeholder="Mật khẩu"
              type="password"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.from_email"
              label="Email gửi"
              placeholder="noreply@example.com"
              type="email"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.from_name"
              label="Tên người gửi"
              placeholder="Hệ thống"
            />
          </VCol>
          <VCol cols="12">
            <VSwitch
              v-model="settings.push_enabled"
              label="Bật thông báo đẩy (Push Notification)"
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
  </SettingsLayout>
</template>
