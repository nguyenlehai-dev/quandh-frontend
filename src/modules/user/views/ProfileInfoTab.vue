<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const userCookie = useCookie('userData')
const snackbar = ref({ show: false, text: '', color: 'success' })

const userDetail = ref({
  name: '',
  user_name: '',
  email: '',
})

const assignments = ref([])
const currentPassword = ref('')
const newPassword = ref('')
const passwordConfirmation = ref('')

const showMessage = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const resetPasswordFields = () => {
  currentPassword.value = ''
  newPassword.value = ''
  passwordConfirmation.value = ''
}

const fetchInitialData = async () => {
  isLoading.value = true

  try {
    const profileRes = await useApi('/user', { method: 'GET' })
    const payload = profileRes.data.value?.data || profileRes.data.value || {}
    const user = payload.user || payload || userCookie.value || {}

    userDetail.value = {
      name: user.name || '',
      user_name: user.user_name || '',
      email: user.email || '',
    }
    assignments.value = Array.isArray(user.assignments) ? user.assignments : []
  }
  catch (err) {
    console.error('Fetch user detail error:', err)
    showMessage('Không thể tải thông tin hồ sơ.', 'error')
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

const saveUser = async () => {
  if ((currentPassword.value || newPassword.value || passwordConfirmation.value) &&
    (!currentPassword.value || !newPassword.value || !passwordConfirmation.value)) {
    showMessage('Nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.', 'error')

    return
  }

  if (newPassword.value && newPassword.value !== passwordConfirmation.value) {
    showMessage('Xác nhận mật khẩu không khớp.', 'error')

    return
  }

  isSaving.value = true

  try {
    await useApi('/user/profile', {
      method: 'PUT',
      body: {
        name: userDetail.value.name,
        email: userDetail.value.email,
      },
    })

    if (currentPassword.value && newPassword.value) {
      await useApi('/user/change-password', {
        method: 'PUT',
        body: {
          current_password: currentPassword.value,
          password: newPassword.value,
          password_confirmation: passwordConfirmation.value,
        },
      })
    }

    if (userCookie.value) {
      userCookie.value = {
        ...userCookie.value,
        name: userDetail.value.name,
        fullName: userDetail.value.name,
        email: userDetail.value.email,
      }
    }

    resetPasswordFields()
    showMessage('Cập nhật hồ sơ thành công!')
  }
  catch (err) {
    console.error('Save error', err)
    showMessage(err?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu.', 'error')
  }
  finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div>
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
    >
      {{ snackbar.text }}
    </VSnackbar>

    <div v-if="!isLoading">
      <VRow>
        <VCol
          cols="12"
          md="7"
        >
          <VCard class="h-100">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon
                    icon="tabler-user"
                    size="26"
                  />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Hồ sơ cá nhân
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      Chỉ cập nhật thông tin cơ bản theo đúng core API.
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <VForm>
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="userDetail.name"
                      label="Tên người dùng"
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="userDetail.user_name"
                      label="Tên đăng nhập"
                      disabled
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="userDetail.email"
                      label="Email"
                      type="email"
                    />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="5"
        >
          <VCard class="mb-6">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon
                    icon="tabler-lock"
                    size="26"
                  />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Đổi mật khẩu
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      Core yêu cầu xác thực bằng mật khẩu hiện tại.
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="currentPassword"
                    label="Mật khẩu hiện tại"
                    type="password"
                    placeholder="••••••••"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="newPassword"
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="passwordConfirmation"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <VCard>
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon
                    icon="tabler-id-badge-2"
                    size="26"
                  />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Phân quyền hiện tại
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      Chỉ hiển thị để tham chiếu. Việc gán vai trò phải làm ở màn quản trị user.
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <div
                v-if="assignments.length"
                class="d-flex flex-wrap gap-2"
              >
                <VChip
                  v-for="assignment in assignments"
                  :key="`${assignment.role_id}-${assignment.role_name}`"
                  color="primary"
                  variant="tonal"
                >
                  {{ assignment.role_name }}
                </VChip>
              </div>

              <div
                v-else
                class="text-body-2 text-disabled"
              >
                Chưa có thông tin phân quyền hiển thị trên hồ sơ.
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-3 mt-6">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="goBack"
        >
          Quay lại
        </VBtn>

        <VBtn
          color="primary"
          :loading="isSaving"
          @click="saveUser"
        >
          Lưu thay đổi
        </VBtn>
      </div>
    </div>

    <div
      v-else
      class="d-flex justify-center align-center h-100 py-12"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="40"
      />
    </div>
  </div>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}

.h-100 {
  block-size: 100%;
}
</style>
