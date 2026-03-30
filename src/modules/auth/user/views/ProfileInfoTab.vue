<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
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
    showMessage(t('user.user.profile.info.load_error'), 'error')
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

const saveUser = async () => {
  if ((currentPassword.value || newPassword.value || passwordConfirmation.value)
    && (!currentPassword.value || !newPassword.value || !passwordConfirmation.value)) {
    showMessage(t('user.user.profile.info.password_required'), 'error')

    return
  }

  if (newPassword.value && newPassword.value !== passwordConfirmation.value) {
    showMessage(t('user.user.profile.info.password_confirmation_mismatch'), 'error')

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
    showMessage(t('user.user.profile.info.save_success'))
  }
  catch (err) {
    console.error('Save error', err)
    showMessage(err?.data?.message || err?.message || t('user.user.profile.info.save_error'), 'error')
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
    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
      {{ snackbar.text }}
    </VSnackbar>

    <div v-if="!isLoading">
      <VRow>
        <VCol cols="12" md="7">
          <VCard class="h-100">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon icon="tabler-user" size="26" />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      {{ t('user.user.profile.info.personal_title') }}
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      {{ t('user.user.profile.info.personal_subtitle') }}
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <VForm>
                <VRow>
                  <VCol cols="12">
                    <AppTextField v-model="userDetail.name" :label="t('user.user.profile.info.user_name')" />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField v-model="userDetail.user_name" :label="t('user.user.profile.info.username')" disabled />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField v-model="userDetail.email" :label="t('user.user.profile.info.email')" type="email" />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="5">
          <VCard class="mb-6">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon icon="tabler-lock" size="26" />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      {{ t('user.user.profile.info.password_title') }}
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      {{ t('user.user.profile.info.password_subtitle') }}
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
                    :label="t('user.user.profile.info.current_password')"
                    type="password"
                    placeholder="********"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="newPassword"
                    :label="t('user.user.profile.info.new_password')"
                    type="password"
                    placeholder="********"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="passwordConfirmation"
                    :label="t('user.user.profile.info.confirm_new_password')"
                    type="password"
                    placeholder="********"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <VCard>
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon icon="tabler-id-badge-2" size="26" />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      {{ t('user.user.profile.info.permissions_title') }}
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      {{ t('user.user.profile.info.permissions_subtitle') }}
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <div v-if="assignments.length" class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="assignment in assignments"
                  :key="`${assignment.role_id}-${assignment.role_name}`"
                  color="primary"
                  variant="tonal"
                >
                  {{ assignment.role_name }}
                </VChip>
              </div>

              <div v-else class="text-body-2 text-disabled">
                {{ t('user.user.profile.info.empty_permissions') }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-3 mt-6">
        <VBtn variant="tonal" color="secondary" @click="goBack">
          {{ t('user.user.profile.info.back') }}
        </VBtn>

        <VBtn color="primary" :loading="isSaving" @click="saveUser">
          {{ t('user.user.profile.info.save') }}
        </VBtn>
      </div>
    </div>

    <div v-else class="d-flex justify-center align-center h-100 py-12">
      <VProgressCircular indeterminate color="primary" size="40" />
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
