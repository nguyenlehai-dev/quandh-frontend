<!-- ❗Errors in the form are set on line 60 -->
<script setup>
import { VForm } from 'vuetify/components/VForm'
import { login as authLogin, switchOrganization } from '@/services/auth'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

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

const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref()
const refOrgForm = ref()

const credentials = ref({
  email: 'admin@example.com',
  password: 'quandcore**11',
})

const rememberMe = ref(false)

// ── Các bước đăng nhập ──
const step = ref(1) // 1: Đăng nhập, 2: Chọn tổ chức
const isLoading = ref(false)

// ── Chọn tổ chức ──
const availableOrganizations = ref([])
const selectedOrgId = ref(null)

const login = async () => {
  isLoading.value = true
  errors.value = { email: undefined, password: undefined }
  
  try {
    const data = await authLogin(credentials.value.email, credentials.value.password)

    // Nếu BE trả current_organization_id = null HOẶC user có nhiều orgs → chuyển qua bước chọn tổ chức
    if (!data.current_organization_id && data.available_organizations && data.available_organizations.length > 0) {
      availableOrganizations.value = data.available_organizations
      selectedOrgId.value = null
      step.value = 2 // Chuyển sang form chọn tổ chức nội tuyến

      return
    }

    // Đã có org (Admin vào thẳng hoặc User chỉ có 1 org) → redirect bình thường
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  catch (err) {
    if (err?.errors) {
      errors.value = err.errors // Lỗi validation từ backend (VD: mảng errors={email:[]})
    }
    else {
      // Bắt lỗi 401, 403, 500 từ exception trả về message chung
      const msg = err?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.'

      errors.value.email = msg
    }
  }
  finally {
    isLoading.value = false
  }
}

const confirmOrganization = async () => {
  if (!selectedOrgId.value) return

  isLoading.value = true
  try {
    await switchOrganization(selectedOrgId.value)
    
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  catch (err) {
    console.error('Switch organization failed:', err)
  }
  finally {
    isLoading.value = false
  }
}

const cancelOrganization = () => {
  // Đăng xuất / Quay lại bước 1
  step.value = 1
  credentials.value.password = ''
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}

const onOrgSubmit = () => {
  refOrgForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      confirmOrganization()
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
        <!-- BƯỚC 1: ĐĂNG NHẬP -->
        <template v-if="step === 1">
          <VCardText>
            <h4 class="text-h4 mb-1">
              Welcome to <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
            </h4>
            <p class="mb-0">
              Vui lòng đăng nhập vào tài khoản của bạn để quản lý hệ thống
            </p>
          </VCardText>
          <VCardText>
            <VAlert
              color="primary"
              variant="tonal"
            >
              <p class="text-sm mb-2">
                Admin Email: <strong>admin@example.com</strong> / Mật khẩu: <strong>quandcore**11</strong>
              </p>
              <p class="text-sm mb-0">
                Basic Email: <strong>basic@example.com</strong> / Mật khẩu: <strong>quandcore**11</strong>
              </p>
            </VAlert>
          </VCardText>
          <VCardText>
            <VForm
              ref="refVForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <AppTextField
                    v-model="credentials.email"
                    label="Tên đăng nhập hoặc Email"
                    placeholder="johndoe@email.com"
                    type="email"
                    autofocus
                    :rules="[requiredValidator, emailValidator]"
                    :error-messages="errors.email"
                  />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <AppTextField
                    v-model="credentials.password"
                    label="Mật khẩu"
                    placeholder="············"
                    :rules="[requiredValidator]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    autocomplete="password"
                    :error-messages="errors.password"
                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <div class="d-flex align-center flex-wrap justify-space-between my-6">
                    <VCheckbox
                      v-model="rememberMe"
                      label="Ghi nhớ đăng nhập"
                    />
                    <RouterLink
                      class="text-primary ms-2 mb-1"
                      :to="{ name: 'forgot-password' }"
                    >
                      Quên mật khẩu?
                    </RouterLink>
                  </div>

                  <VBtn
                    block
                    type="submit"
                    :loading="isLoading"
                  >
                    Đăng Nhập
                  </VBtn>
                </VCol>

                <!-- create account -->
                <VCol
                  cols="12"
                  class="text-center"
                >
                  <span>Có gì mới trên nền tảng không?</span>
                  <RouterLink
                    class="text-primary ms-1"
                    :to="{ name: 'register' }"
                  >
                    Đăng ký tài khoản
                  </RouterLink>
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex align-center"
                >
                  <VDivider />
                  <span class="mx-4">hoặc</span>
                  <VDivider />
                </VCol>

                <!-- auth providers -->
                <VCol
                  cols="12"
                  class="text-center"
                >
                  <AuthProvider />
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </template>

        <!-- BƯỚC 2: CHỌN TỔ CHỨC LÀM VIỆC -->
        <template v-else-if="step === 2">
          <VCardText class="text-center mt-6">
            <h4 class="text-h4 mb-2 text-primary">
              CHỌN TỔ CHỨC LÀM VIỆC
            </h4>
            <p class="mb-6 text-body-1 text-medium-emphasis">
              Tài khoản của bạn thuộc nhiều tổ chức. Vui lòng chọn một tổ chức để làm việc.
            </p>
          </VCardText>
          <VCardText>
            <VForm
              ref="refOrgForm"
              @submit.prevent="onOrgSubmit"
            >
              <VRow>
                <VCol cols="12">
                  <AppSelect
                    v-model="selectedOrgId"
                    :items="availableOrganizations"
                    item-title="name"
                    item-value="id"
                    label="Chọn tổ chức làm việc"
                    placeholder="-- Chọn tổ chức --"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="mt-4"
                >
                  <VBtn
                    block
                    color="primary"
                    type="submit"
                    :loading="isLoading"
                    class="mb-3"
                  >
                    Tiếp Tục
                  </VBtn>
                  <VBtn
                    block
                    color="error"
                    variant="tonal"
                    :disabled="isLoading"
                    @click="cancelOrganization"
                  >
                    Đăng Xuất
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </template>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>

