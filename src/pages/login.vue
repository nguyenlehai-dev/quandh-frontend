<script setup>
import { login as authLogin, resolvePostLoginRoute } from '@/services/auth'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref()

const credentials = ref({
  email: '',
  password: '',
})

const rememberMe = ref(false)
const isLoading = ref(false)

const login = async () => {
  isLoading.value = true
  errors.value = { email: undefined, password: undefined }

  try {
    const data = await authLogin(credentials.value.email, credentials.value.password)

    const nextRoute = resolvePostLoginRoute({
      loginData: data,
      preferredRoute: route.query.to ? String(route.query.to) : '/',
    })

    await nextTick(() => {
      router.replace(nextRoute)
    })
  }
  catch (err) {
    if (err?.errors) {
      errors.value = err.errors
    }
    else {
      const msg = err?.data?.message || err?.message || t('auth.auth.login.invalid_credentials')

      errors.value.email = msg
    }
  }
  finally {
    isLoading.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
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
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
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
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
        width="100%"
      >
        <VCardText class="text-center">
          <h4 class="text-h5 mb-1">
            {{ t('auth.auth.app.agency') }}
          </h4>
          <h5 class="text-h6 font-weight-bold mb-1 text-uppercase">
            {{ t('auth.auth.app.system_name') }}
          </h5>
          <p class="text-sm text-disabled mb-0">
            {{ t('auth.auth.app.description') }}
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
                  v-model="credentials.email"
                  :label="t('auth.auth.login.username_or_email')"
                  placeholder="johndoe@email.com"
                  type="text"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  :label="t('auth.auth.login.password')"
                  placeholder="........"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex align-center flex-wrap justify-space-between mb-6">
                  <VCheckbox
                    v-model="rememberMe"
                    :label="t('auth.auth.login.remember_me')"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    {{ t('auth.auth.login.forgot_password') }}
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  {{ t('auth.auth.login.submit') }}
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <span class="text-disabled">{{ t('auth.auth.login.no_account') }}</span>
                <RouterLink
                  class="text-primary ms-1"
                  :to="{ name: 'register' }"
                >
                  {{ t('auth.auth.login.register_now') }}
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
