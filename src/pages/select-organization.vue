<script setup>
import {
  clearCurrentOrganization,
  getOrganizationSessionState,
  setStoredOrganizations,
  switchOrganization,
  logout as authLogout,
  fetchMe,
} from '@/services/auth'
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
  },
})

const route = useRoute()
const router = useRouter()
const refOrgForm = ref()
const isLoading = ref(false)
const availableOrganizations = ref([])
const selectedOrgId = ref(null)
const { t } = useI18n()

onMounted(() => {
  try {
    const {
      organizations,
      currentOrganizationId,
      hasValidCurrentOrganization,
    } = getOrganizationSessionState()

    const requestedOrgId = Number(route.query.current_org)

    availableOrganizations.value = organizations

    if (hasValidCurrentOrganization) {
      router.replace(route.query.to ? String(route.query.to) : '/')

      return
    }

    if (currentOrganizationId)
      clearCurrentOrganization()

    const hasRequestedOrg = availableOrganizations.value.some(org => org.id === requestedOrgId)

    selectedOrgId.value = hasRequestedOrg
      ? requestedOrgId
      : availableOrganizations.value[0]?.id
  }
  catch (err) {
    console.warn(err)
  }

  if (!availableOrganizations.value || availableOrganizations.value.length === 0)
    router.replace('/login')
})

const handlePostOrgResolution = async () => {
  await nextTick(() => {
    router.replace(route.query.to ? String(route.query.to) : '/')
  })
}

const confirmOrganization = async () => {
  if (!selectedOrgId.value) return

  isLoading.value = true
  try {
    await switchOrganization(selectedOrgId.value)
    await fetchMe()
    await handlePostOrgResolution()
  }
  catch (err) {
    console.error('Switch organization failed:', err)

    if (err?.code === 403) {
      clearCurrentOrganization()

      const freshOrganizations = availableOrganizations.value.filter(org => org.id !== Number(selectedOrgId.value))

      availableOrganizations.value = freshOrganizations
      setStoredOrganizations(freshOrganizations)
      selectedOrgId.value = freshOrganizations[0]?.id ?? null
    }
  }
  finally {
    isLoading.value = false
  }
}

const cancelOrganization = async () => {
  await authLogout(router)
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
        <div>
          <VCardText class="text-center pt-8">
            <h4 class="text-h5 mb-1">
              {{ t('auth.auth.app.agency') }}
            </h4>
            <h5 class="text-h6 font-weight-bold mb-1 text-uppercase">
              {{ t('auth.auth.app.system_name') }}
            </h5>
            <p class="mb-6 text-sm text-disabled">
              {{ t('auth.auth.app.description') }}
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
                    :label="t('auth.auth.select_organization.title')"
                    :placeholder="t('auth.auth.select_organization.placeholder')"
                    :rules="[requiredValidator]"
                  />
                </VCol>

                <VCol
                  cols="12"
                  class="mt-4"
                >
                  <VBtn
                    block
                    type="submit"
                    :loading="isLoading"
                    color="info"
                    class="mb-3"
                  >
                    {{ t('auth.auth.select_organization.continue') }}
                  </VBtn>

                  <VBtn
                    block
                    color="error"
                    variant="tonal"
                    @click="cancelOrganization"
                  >
                    {{ t('auth.auth.select_organization.logout') }}
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
