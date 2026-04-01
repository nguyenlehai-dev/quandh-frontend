<script setup>
/* eslint-disable camelcase */

import { ref, onMounted } from 'vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import SettingsLayout from './SettingsLayout.vue'

const { t } = useI18n()

const { snackbar, showSuccess, showError } = useActionFeedback()

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
  { title: t('system-settings.system_settings.notifications.protocol_options.smtp'), value: 'smtp' },
]

const encryptionOptions = [
  { title: t('system-settings.system_settings.notifications.encryption_options.tls'), value: 'tls' },
  { title: t('system-settings.system_settings.notifications.encryption_options.ssl'), value: 'ssl' },
  { title: t('system-settings.system_settings.notifications.encryption_options.none'), value: 'none' },
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

    showSuccess('Lưu cấu hình thông báo thành công.')
  }
  catch (err) {
    console.error('Save notification settings error:', err)
    showError(err, 'Không thể lưu cấu hình thông báo.')
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
          {{ t('system-settings.system_settings.notifications.title') }}
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
          <VCol cols="12" md="6">
            <AppSelect
              v-model="settings.email_protocol"
              :items="protocolOptions"
              :label="t('system-settings.system_settings.notifications.fields.email_protocol')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_sender_name"
              :label="t('system-settings.system_settings.notifications.fields.email_sender_name')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_sender_name_placeholder')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_sender_address"
              :label="t('system-settings.system_settings.notifications.fields.email_sender_address')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_sender_address_placeholder')"
              type="email"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_smtp_host"
              :label="t('system-settings.system_settings.notifications.fields.email_smtp_host')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_smtp_host_placeholder')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_smtp_port"
              :label="t('system-settings.system_settings.notifications.fields.email_smtp_port')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_smtp_port_placeholder')"
              type="number"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_smtp_username"
              :label="t('system-settings.system_settings.notifications.fields.email_smtp_username')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_smtp_username_placeholder')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_smtp_password"
              :label="t('system-settings.system_settings.notifications.fields.email_smtp_password')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_smtp_password_placeholder')"
              type="password"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="settings.email_smtp_encryption"
              :items="encryptionOptions"
              :label="t('system-settings.system_settings.notifications.fields.email_smtp_encryption')"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="settings.email_test_address"
              :label="t('system-settings.system_settings.notifications.fields.email_test_address')"
              :placeholder="t('system-settings.system_settings.notifications.fields.email_test_address_placeholder')"
              type="email"
            />
          </VCol>
          <VCol cols="12">
            <VAlert type="info" variant="tonal">
              {{ t('system-settings.system_settings.notifications.info') }}
            </VAlert>
          </VCol>
          <VCol cols="12">
            <VBtn :loading="saving" @click="saveSettings">
              {{ t('system-settings.system_settings.notifications.save') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </SettingsLayout>
</template>
