<script setup>
import { ref, onMounted } from 'vue'
import SettingsLayout from './SettingsLayout.vue'

const settings = ref({
  email_protocol: 'smtp',
  email_sender_name: '',
  email_sender_address: '',
  email_smtp_host: '',
  email_smtp_port: '587',
  email_smtp_username: '',
  email_smtp_password: '',
  email_smtp_encryption: 'tls',
  email_test_address: '',
})
const loading = ref(false)
const saving = ref(false)

const protocolOptions = [
  { title: 'SMTP', value: 'smtp' },
]

const encryptionOptions = [
  { title: 'TLS', value: 'tls' },
  { title: 'SSL', value: 'ssl' },
  { title: 'Không dùng mã hóa', value: 'none' },
]

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/settings')

    settings.value = {
      ...settings.value,
      ...(res.data?.email ?? res?.email ?? {}),
    }
  }
  catch (err) {
    console.error('Fetch notification settings error:', err)
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
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.email_protocol"
              :items="protocolOptions"
              label="Giao thức gửi mail"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.email_sender_name"
              label="Tên người gửi"
              placeholder="Hệ thống"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.email_sender_address"
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
              v-model="settings.email_smtp_host"
              label="SMTP Host"
              placeholder="smtp.gmail.com"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.email_smtp_port"
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
              v-model="settings.email_smtp_username"
              label="SMTP Username"
              placeholder="Email tài khoản"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.email_smtp_password"
              label="SMTP Password"
              placeholder="Mật khẩu"
              type="password"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="settings.email_smtp_encryption"
              :items="encryptionOptions"
              label="Mã hóa SMTP"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="settings.email_test_address"
              label="Email kiểm thử"
              placeholder="test@example.com"
              type="email"
            />
          </VCol>
          <VCol cols="12">
            <VAlert
              type="info"
              variant="tonal"
            >
              Trang này đang cấu hình nhóm settings `email` của backend. Chỉ các key tồn tại trong hệ thống mới được lưu.
            </VAlert>
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
