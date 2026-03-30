<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2ResetPasswordIllustrationDark from '@images/pages/auth-v2-reset-password-illustration-dark.png'
import authV2ResetPasswordIllustrationLight from '@images/pages/auth-v2-reset-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const { t } = useI18n()

const form = ref({
  email: String(route.query.email || ''),
  token: String(route.query.token || ''),
  password: '',
  password_confirmation: '',
})

const authThemeImg = useGenerateImageVariant(authV2ResetPasswordIllustrationLight, authV2ResetPasswordIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const submitResetPassword = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const res = await $api('/auth/reset-password', {
      method: 'POST',
      body: form.value,
    })

    successMessage.value = res?.message || t('auth.auth.reset_password.success')

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  }
  catch (err) {
    errorMessage.value = err?.data?.message || err?.message || t('auth.auth.reset_password.failed')
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 150px;"
        >
          <VImg
            max-width="468"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            {{ t('auth.auth.reset_password.title') }}
          </h4>
          <p class="mb-0">
            {{ t('auth.auth.reset_password.description') }}
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="submitResetPassword">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  :label="t('auth.auth.reset_password.email')"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.token"
                  :label="t('auth.auth.reset_password.token')"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :label="t('auth.auth.reset_password.new_password')"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password_confirmation"
                  :label="t('auth.auth.reset_password.password_confirmation')"
                  :rules="[requiredValidator]"
                  :type="isPasswordConfirmVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordConfirmVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
                />
              </VCol>

              <VCol
                v-if="successMessage"
                cols="12"
              >
                <VAlert
                  type="success"
                  variant="tonal"
                >
                  {{ successMessage }}
                </VAlert>
              </VCol>

              <VCol
                v-if="errorMessage"
                cols="12"
              >
                <VAlert
                  type="error"
                  variant="tonal"
                >
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  {{ t('auth.auth.reset_password.submit') }}
                </VBtn>
              </VCol>

              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    size="20"
                    class="me-1 flip-in-rtl"
                  />
                  <span>{{ t('auth.auth.reset_password.back_to_login') }}</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
