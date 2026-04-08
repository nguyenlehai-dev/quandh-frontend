<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { resetPasswordWithCore } from '@/modules/auth/services/coreAuth'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2ResetPasswordIllustrationDark from '@images/pages/auth-v2-reset-password-illustration-dark.png'
import authV2ResetPasswordIllustrationLight from '@images/pages/auth-v2-reset-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const form = ref({
  email: String(route.query.email ?? ''),
  newPassword: '',
  confirmPassword: '',
})

const authThemeImg = useGenerateImageVariant(authV2ResetPasswordIllustrationLight, authV2ResetPasswordIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const { isSnackbarVisible, queueSnackbar, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const submitResetPassword = async () => {
  isSubmitting.value = true

  try {
    const response = await resetPasswordWithCore({
      email: form.value.email,
      password: form.value.newPassword,
      password_confirmation: form.value.confirmPassword,
      token: String(route.query.token ?? ''),
    })

    queueSnackbar(response?.message || 'Mật khẩu đã được đặt lại thành công.')
    await router.push({ name: 'login' })
  }
  catch (error) {
    showSnackbar(error?.data?.message || 'Không thể đặt lại mật khẩu.', 'error')
  }
  finally {
    isSubmitting.value = false
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
    no-gutters
    class="auth-wrapper bg-surface"
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
            max-width="451"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
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
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Đặt lại mật khẩu
          </h4>
          <p class="mb-0">
            Mật khẩu mới phải khác với mật khẩu đã sử dụng trước đó.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="submitResetPassword">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  placeholder="user@example.com"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.newPassword"
                  label="Mật khẩu mới"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :rules="[requiredValidator]"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.confirmPassword"
                  label="Xác nhận mật khẩu"
                  autocomplete="confirm-password"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :rules="[requiredValidator, value => value === form.newPassword || 'Xác nhận mật khẩu không khớp']"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isSubmitting"
                >
                  Đặt mật khẩu mới
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
                  <span>Quay lại đăng nhập</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    timeout="2800"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
