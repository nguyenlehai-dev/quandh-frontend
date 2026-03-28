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
// 1: Đăng nhập, 2: Chọn tổ chức, 3: Chọn cuộc họp (nếu không phải admin)
const step = ref(1)
const isLoading = ref(false)

// ── Chọn tổ chức ──
const availableOrganizations = ref([])
const selectedOrgId = ref(null)

// ── Step 3: Chọn cuộc họp ──
const userRoles = ref([])
const myMeetings = ref([])
const selectedMeetingId = ref(null)
const isLoadingMeetings = ref(false)

// Kiểm tra user có phải admin không
const isAdmin = computed(() => {
  const adminRoles = ['super-admin', 'admin', 'Super Admin', 'Admin']
  return userRoles.value.some(r => adminRoles.includes(r))
})

// Lấy danh sách cuộc họp của user
const loadMyMeetings = async () => {
  isLoadingMeetings.value = true
  try {
    const { fetchMyMeetings } = await import('@/modules/meetings/services/meetingService')
    const res = await fetchMyMeetings({ limit: 50, sort_by: 'start_at', sort_order: 'desc' })

    const rawData = res.data?.data || res.data || []

    myMeetings.value = rawData.map(m => ({
      id: m.id,
      title: m.title,
      start_at: m.start_at || '',
      location: m.location || '',
      status: m.status || '',
    }))
  }
  catch (err) {
    console.error('Không thể tải danh sách cuộc họp:', err)
    myMeetings.value = []
  }
  finally {
    isLoadingMeetings.value = false
  }
}

// Xử lý sau khi xác định xong tổ chức: admin vào thẳng, user vào step 3
const handlePostOrgResolution = async roles => {
  userRoles.value = roles || []

  if (isAdmin.value) {
    // Admin → vào thẳng dashboard
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  else {
    // Không phải admin → load cuộc họp → step 3
    step.value = 3
    await loadMyMeetings()
  }
}

const login = async () => {
  isLoading.value = true
  errors.value = { email: undefined, password: undefined }

  try {
    const data = await authLogin(credentials.value.email, credentials.value.password)

    // Nếu BE trả current_organization_id = null (nhiều org) → step 2
    if (!data.current_organization_id && data.available_organizations && data.available_organizations.length > 0) {
      availableOrganizations.value = data.available_organizations
      selectedOrgId.value = null
      step.value = 2

      return
    }

    // Đã có org → kiểm tra admin hay user
    await handlePostOrgResolution(data.roles)
  }
  catch (err) {
    if (err?.errors) {
      errors.value = err.errors
    }
    else {
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
    const data = await switchOrganization(selectedOrgId.value)

    // Sau khi chọn org → kiểm tra admin hay user
    await handlePostOrgResolution(data.roles)
  }
  catch (err) {
    console.error('Switch organization failed:', err)
  }
  finally {
    isLoading.value = false
  }
}

const confirmMeeting = async () => {
  if (!selectedMeetingId.value) return

  await nextTick(() => {
    router.replace(`/my-meetings/${selectedMeetingId.value}`)
  })
}

const skipMeetingSelection = async () => {
  // Bỏ qua → vào trang danh sách cuộc họp của tôi
  await nextTick(() => {
    router.replace('/my-meetings')
  })
}

const cancelOrganization = () => {
  step.value = 1
  credentials.value.password = ''
}

const backToOrgStep = () => {
  // Quay lại bước chọn tổ chức nếu cần
  if (availableOrganizations.value.length > 0) {
    step.value = 2
  }
  else {
    step.value = 1
    credentials.value.password = ''
  }
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

// Format thời gian cho hiển thị
const formatDateTime = dateStr => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr.replace(/(\d{2}:\d{2}:\d{2}) (\d{2})\/(\d{2})\/(\d{4})/, '$4-$3-$2T$1'))

    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }
  catch {
    return dateStr
  }
}

const getStatusColor = status => {
  const map = {
    draft: 'secondary',
    scheduled: 'info',
    active: 'success',
    in_progress: 'warning',
    completed: 'primary',
  }

  return map[status] || 'default'
}

const getStatusLabel = status => {
  const map = {
    draft: 'Bản nháp',
    scheduled: 'Đã lên lịch',
    active: 'Đang kích hoạt',
    in_progress: 'Đang diễn ra',
    completed: 'Đã kết thúc',
  }

  return map[status] || status
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
        <!-- ══════════════════════════════════════════════ -->
        <!-- BƯỚC 1: ĐĂNG NHẬP -->
        <!-- ══════════════════════════════════════════════ -->
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
              class="text-sm"
            >
              <div class="font-weight-medium mb-1">
                Tài khoản trải nghiệm (Mật khẩu: <strong>quandcore**11</strong>)
              </div>
              <ul style="padding-inline-start: 1.5rem;">
                <li>Super Admin: <strong>admin@example.com</strong></li>
                <li>Admin: <strong>admin2@example.com</strong></li>
                <li>Editor: <strong>editor@example.com</strong></li>
                <li>Vai trò mẫu: <strong>basic@example.com</strong></li>
              </ul>
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

        <!-- ══════════════════════════════════════════════ -->
        <!-- BƯỚC 2: CHỌN TỔ CHỨC LÀM VIỆC -->
        <!-- ══════════════════════════════════════════════ -->
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

        <!-- ══════════════════════════════════════════════ -->
        <!-- BƯỚC 3: CHỌN CUỘC HỌP THAM DỰ -->
        <!-- ══════════════════════════════════════════════ -->
        <template v-else-if="step === 3">
          <VCardText class="text-center mt-4">
            <VAvatar
              color="primary"
              variant="tonal"
              size="60"
              class="mb-4"
            >
              <VIcon icon="tabler-calendar-event" size="32" />
            </VAvatar>
            <h4 class="text-h4 mb-2 text-primary">
              CHỌN CUỘC HỌP THAM DỰ
            </h4>
            <p class="mb-2 text-body-1 text-medium-emphasis">
              Chào mừng bạn! Hãy chọn cuộc họp bạn muốn tham gia.
            </p>
          </VCardText>

          <VCardText>
            <!-- Loading -->
            <div
              v-if="isLoadingMeetings"
              class="d-flex flex-column align-center pa-8"
            >
              <VProgressCircular
                indeterminate
                color="primary"
                size="40"
                class="mb-3"
              />
              <span class="text-body-2 text-medium-emphasis">Đang tải cuộc họp...</span>
            </div>

            <!-- Danh sách cuộc họp -->
            <template v-else-if="myMeetings.length > 0">
              <div class="meeting-select-list">
                <div
                  v-for="meeting in myMeetings"
                  :key="meeting.id"
                  class="meeting-select-item"
                  :class="{ 'meeting-select-item--active': selectedMeetingId === meeting.id }"
                  @click="selectedMeetingId = meeting.id"
                >
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="selectedMeetingId === meeting.id ? 'primary' : 'default'"
                      :variant="selectedMeetingId === meeting.id ? 'flat' : 'tonal'"
                      size="40"
                      class="flex-shrink-0"
                    >
                      <VIcon
                        icon="tabler-calendar-event"
                        size="20"
                        :color="selectedMeetingId === meeting.id ? 'white' : undefined"
                      />
                    </VAvatar>
                    <div class="flex-grow-1" style="min-width: 0;">
                      <div class="text-body-1 font-weight-bold text-truncate" style="color: #334155;">
                        {{ meeting.title }}
                      </div>
                      <div class="d-flex align-center gap-2 mt-1 flex-wrap">
                        <VChip
                          size="x-small"
                          variant="flat"
                          :color="getStatusColor(meeting.status)"
                        >
                          {{ getStatusLabel(meeting.status) }}
                        </VChip>
                        <span
                          v-if="meeting.start_at"
                          class="text-caption text-medium-emphasis"
                        >
                          <VIcon icon="tabler-clock" size="12" class="me-1" />
                          {{ formatDateTime(meeting.start_at) }}
                        </span>
                      </div>
                      <div
                        v-if="meeting.location"
                        class="text-caption text-medium-emphasis mt-1"
                      >
                        <VIcon icon="tabler-map-pin" size="12" class="me-1" />
                        {{ meeting.location }}
                      </div>
                    </div>
                    <VIcon
                      v-if="selectedMeetingId === meeting.id"
                      icon="tabler-circle-check-filled"
                      color="primary"
                      size="24"
                      class="flex-shrink-0"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <VBtn
                  block
                  color="primary"
                  :disabled="!selectedMeetingId"
                  class="mb-3"
                  prepend-icon="tabler-door-enter"
                  @click="confirmMeeting"
                >
                  Vào Cuộc Họp
                </VBtn>
                <VBtn
                  block
                  color="secondary"
                  variant="tonal"
                  prepend-icon="tabler-list"
                  class="mb-3"
                  @click="skipMeetingSelection"
                >
                  Xem Tất Cả Cuộc Họp
                </VBtn>
                <VBtn
                  block
                  color="error"
                  variant="text"
                  size="small"
                  @click="backToOrgStep"
                >
                  <VIcon start icon="tabler-arrow-left" size="16" />
                  Quay lại
                </VBtn>
              </div>
            </template>

            <!-- Không có cuộc họp -->
            <template v-else>
              <div class="d-flex flex-column align-center pa-8">
                <VAvatar
                  color="warning"
                  variant="tonal"
                  size="60"
                  class="mb-4"
                >
                  <VIcon icon="tabler-calendar-off" size="30" />
                </VAvatar>
                <div class="text-body-1 font-weight-bold mb-2" style="color: #475569;">
                  Không có cuộc họp nào
                </div>
                <div class="text-body-2 text-medium-emphasis text-center mb-6">
                  Bạn chưa được mời tham dự cuộc họp nào. Vui lòng liên hệ quản trị viên.
                </div>
                <VBtn
                  block
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-list"
                  class="mb-3"
                  @click="skipMeetingSelection"
                >
                  Vào Xem Danh Sách
                </VBtn>
                <VBtn
                  block
                  color="error"
                  variant="text"
                  size="small"
                  @click="backToOrgStep"
                >
                  <VIcon start icon="tabler-arrow-left" size="16" />
                  Quay lại
                </VBtn>
              </div>
            </template>
          </VCardText>
        </template>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>

<style scoped>
.meeting-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-block-size: 380px;
  overflow-y: auto;
  padding-inline-end: 4px;
}

.meeting-select-item {
  padding: 14px 16px;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.meeting-select-item:hover {
  border-color: #c7d2fe;
  background-color: #f8fafc;
}

.meeting-select-item--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: #eff6ff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
}

/* Scrollbar */
.meeting-select-list::-webkit-scrollbar {
  inline-size: 6px;
}

.meeting-select-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.meeting-select-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.meeting-select-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
