<script setup>
import { switchOrganization, logout as authLogout, fetchMe } from '@/services/auth'
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

    // Page này yêu cầu đã đăng nhập nhưng chưa chọn org
    // Guard sẽ xử lý redirect
  },
})

const route = useRoute()
const router = useRouter()
const refOrgForm = ref()
const isLoading = ref(false)
const availableOrganizations = ref([])
const selectedOrgId = ref(null)

onMounted(() => {
  try {
    const raw = localStorage.getItem('availableOrganizations')
    if (raw) {
      availableOrganizations.value = JSON.parse(raw)

      const currentIdCookie = useCookie('currentOrganizationId').value

      selectedOrgId.value = currentIdCookie ? Number(currentIdCookie) : availableOrganizations.value[0]?.id
    }
  } catch (err) {
    console.warn(err)
  }

  // If there are no orgs available, redirect to login or dashboard
  if (!availableOrganizations.value || availableOrganizations.value.length === 0) {
    router.replace('/')
  }
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

    // Fetch lại user + abilities theo org mới
    await fetchMe()

    await handlePostOrgResolution()
  }
  catch (err) {
    console.error('Switch organization failed:', err)
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
          <!-- BƯỚC 2: CHỌN TỔ CHỨC -->
          <VCardText class="text-center pt-8">
            <h4 class="text-h5 mb-1">
              Sở nội vụ Đà Nẵng
            </h4>
            <h5 class="text-h6 font-weight-bold mb-1 text-uppercase">
              HỆ THỐNG THÔNG TIN NGHIỆP VỤ
            </h5>
            <p class="mb-6 text-sm text-disabled">
              Hệ thống thông tin nghiệp vụ giữa Sở Nội vụ và UBND xã, phường, đặc khu
            </p>
          </VCardText>
          
          <VCardText>
            <VForm
              ref="refOrgForm"
              @submit.prevent="onOrgSubmit"
            >
              <VRow>
                <!-- organization select -->
                <VCol cols="12">
                  <AppSelect
                    v-model="selectedOrgId"
                    :items="availableOrganizations"
                    item-title="name"
                    item-value="id"
                    label="Chọn tổ chức làm việc"
                    placeholder="-- Vui lòng chọn --"
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
                    Tiếp Tục
                  </VBtn>
                  
                  <VBtn
                    block
                    color="error"
                    variant="tonal"
                    @click="cancelOrganization"
                  >
                    Đăng Xuất
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
