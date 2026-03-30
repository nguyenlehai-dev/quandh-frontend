<script setup>
import { register as authRegister } from '@/services/auth'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const imageVariant = useGenerateImageVariant(authV2RegisterIllustrationLight, authV2RegisterIllustrationDark, authV2RegisterIllustrationBorderedLight, authV2RegisterIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const router = useRouter()
const refVForm = ref()
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const successMessage = ref('')
const generalError = ref('')
const errors = ref({
  name: undefined,
  user_name: undefined,
  email: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const form = ref({
  name: '',
  user_name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleRegister = async () => {
  isLoading.value = true
  successMessage.value = ''
  generalError.value = ''
  errors.value = {
    name: undefined,
    user_name: undefined,
    email: undefined,
    password: undefined,
    password_confirmation: undefined,
  }

  try {
    const res = await authRegister(form.value)

    successMessage.value = res?.message || 'Đăng ký thành công. Vui lòng đăng nhập.'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  }
  catch (err) {
    if (err?.code === 404)
      generalError.value = 'API hiện chưa mở endpoint /auth/register.'
    else if (err?.errors) {
      errors.value = { ...errors.value, ...err.errors }
      generalError.value = err?.message || 'Dữ liệu đăng ký chưa hợp lệ.'
    }
    else
      generalError.value = err?.data?.message || err?.message || 'Không thể đăng ký tài khoản.'
  }
  finally {
    isLoading.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      handleRegister()
  })
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
          style="padding-inline: 100px;"
        >
          <VImg
            max-width="500"
            :src="imageVariant"
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
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Tạo tài khoản mới
          </h4>
          <p class="mb-0">
            FE sẽ gọi `POST /auth/register`. Nếu API của anh chưa mở endpoint này, màn hình sẽ trả lỗi rõ ràng.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Họ và tên"
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.user_name"
                  label="Tên đăng nhập"
                  :rules="[requiredValidator]"
                  :error-messages="errors.user_name"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Mật khẩu"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password_confirmation"
                  label="Xác nhận mật khẩu"
                  :rules="[requiredValidator]"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password_confirmation"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
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
                v-if="generalError"
                cols="12"
              >
                <VAlert
                  type="error"
                  variant="tonal"
                >
                  {{ generalError }}
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  Đăng ký
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <span class="text-disabled">Đã có tài khoản?</span>
                <RouterLink
                  class="text-primary ms-1"
                  :to="{ name: 'login' }"
                >
                  Quay lại đăng nhập
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
@use "@core/scss/template/pages/page-auth";
</style>
