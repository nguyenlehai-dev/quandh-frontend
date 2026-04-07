<!-- ❗Errors in the form are set on line 60 -->
<script setup>
import { VForm } from 'vuetify/components/VForm'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { applyCoreAuthSession, loginWithCore, normalizeCoreAuthPayload, switchOrganizationWithCore } from '@/modules/auth/services/coreAuth'
import { getPublicCoreSettings } from '@/modules/system-settings/services/coreSettings'
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

const isPasswordVisible = ref(false)
const isSubmitting = ref(false)
const isSwitchingOrganization = ref(false)
const isOrganizationDialogVisible = ref(false)
const pendingAuthPayload = ref(null)
const selectedOrganizationId = ref(null)
const route = useRoute()
const router = useRouter()
const ability = useAbility()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()
const publicSettings = ref({
  admin_page: {
    admin_app_name: themeConfig.app.title,
    admin_welcome_title: '',
    admin_app_description: '',
  },
  org_select_page: {
    org_select_title: '',
    org_select_description: '',
  },
})

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

const availableOrganizations = computed(() => pendingAuthPayload.value?.availableOrganizations ?? [])

const getErrorMessage = error => {
  const responseData = error?.data ?? {}
  const errorBag = responseData?.errors ?? {}
  const firstError = Object.values(errorBag).flat().find(Boolean)

  errors.value = {
    email: errorBag.email ?? errorBag.login ?? undefined,
    password: errorBag.password ?? undefined,
  }

  return responseData?.message || firstError || 'Không thể đăng nhập. Vui lòng thử lại.'
}

const redirectAfterLogin = async () => {
  const targetPath = route.query.to ? String(route.query.to) : '/'

  await router.replace(targetPath)

  if (router.currentRoute.value.name === 'login')
    window.location.assign(targetPath)
}

const finalizeLogin = async payload => {
  applyCoreAuthSession(payload, ability)
  await redirectAfterLogin()
}

const closeOrganizationDialog = () => {
  isOrganizationDialogVisible.value = false
  pendingAuthPayload.value = null
  selectedOrganizationId.value = null
}

const handleOrganizationSelection = async () => {
  if (!pendingAuthPayload.value?.accessToken || !selectedOrganizationId.value)
    return

  isSwitchingOrganization.value = true

  try {
    const response = await switchOrganizationWithCore(selectedOrganizationId.value, pendingAuthPayload.value.accessToken)
    const responseData = response?.data ?? {}
    const nextRoles = responseData.roles ?? pendingAuthPayload.value.roles
    const nextPermissions = responseData.permissions ?? pendingAuthPayload.value.permissions
    const nextAbilityRules = responseData.abilities ?? pendingAuthPayload.value.userAbilityRules
    const currentOrganization = responseData.current_organization ?? pendingAuthPayload.value.availableOrganizations.find(item => item.id === selectedOrganizationId.value) ?? null
    const finalizedPayload = {
      ...pendingAuthPayload.value,
      currentOrganization,
      currentOrganizationId: responseData.current_organization_id ?? selectedOrganizationId.value,
      permissions: nextPermissions,
      roles: nextRoles,
      userAbilityRules: nextAbilityRules,
      userData: {
        ...pendingAuthPayload.value.userData,
        currentOrganization,
        currentOrganizationId: responseData.current_organization_id ?? selectedOrganizationId.value,
        permissions: nextPermissions,
        role: nextRoles?.[0] ?? pendingAuthPayload.value.userData.role,
        roles: nextRoles,
      },
    }

    await finalizeLogin(finalizedPayload)
  }
  catch (error) {
    showSnackbar(error?.data?.message || 'Không thể chuyển tổ chức làm việc.', 'error')
  }
  finally {
    isSwitchingOrganization.value = false
  }
}

const login = async () => {
  isSubmitting.value = true
  errors.value = {
    email: undefined,
    password: undefined,
  }

  try {
    const response = await loginWithCore({
      email: credentials.value.email,
      password: credentials.value.password,
    })
    const authPayload = normalizeCoreAuthPayload(response)

    if (!authPayload.accessToken) {
      showSnackbar('Phản hồi đăng nhập không hợp lệ.', 'error')

      return
    }

    if (authPayload.availableOrganizations.length > 1 && !authPayload.currentOrganizationId) {
      pendingAuthPayload.value = authPayload
      selectedOrganizationId.value = authPayload.availableOrganizations[0]?.id ?? null
      isOrganizationDialogVisible.value = true

      return
    }

    await finalizeLogin(authPayload)
  }
  catch (error) {
    showSnackbar(getErrorMessage(error), 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}

onMounted(() => {
  hydratePendingSnackbar()

  getPublicCoreSettings()
    .then(response => {
      publicSettings.value = {
        ...publicSettings.value,
        ...response?.data,
      }
    })
    .catch(() => {})
})
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
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            {{ publicSettings.admin_page.admin_welcome_title || $t('Sign in to {app}', { app: themeConfig.app.title }) }}
          </h4>
          <p class="mb-0">
            {{ publicSettings.admin_page.admin_app_description || $t('Use your Core account to access the system with the current working organization.') }}
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
                  :label="$t('Email or username')"
                  placeholder="admin@example.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  :label="$t('Password')"
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
                    :label="$t('Remember me')"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    {{ $t('Forgot password?') }}
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="isSubmitting"
                >
                  {{ $t('Sign In') }}
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <span>{{ $t('Sign in with Core API') }}</span>
              </VCol>
              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">{{ $t('Or') }}</span>
                <VDivider />
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog
    v-model="isOrganizationDialogVisible"
    max-width="520"
    persistent
  >
    <VCard :title="publicSettings.org_select_page.org_select_title || $t('Select working organization')">
      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ publicSettings.org_select_page.org_select_description || $t('This account has multiple available organizations. Choose one to continue.') }}
        </p>

        <AppSelect
          v-model="selectedOrganizationId"
          :label="$t('Organization field')"
          :placeholder="$t('Choose organization')"
          :items="availableOrganizations.map(item => ({ title: item.name, value: item.id }))"
          :rules="[requiredValidator]"
        />
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap pt-0">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeOrganizationDialog"
        >
          {{ $t('Cancel') }}
        </VBtn>

        <VBtn
          :loading="isSwitchingOrganization"
          @click="handleOrganizationSelection"
        >
          {{ $t('Continue') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

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
