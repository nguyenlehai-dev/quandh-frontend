<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, computed, watchEffect } from 'vue'

const router = useRouter()

const isLoading = ref(true)
const isSaving = ref(false)

// Lấy user từ cookie auth
const userCookie = useCookie('userData')
const snackbar = ref({ show: false, text: '', color: 'success' })

// Data refs
const userDetail = ref({
  name: '',
  user_name: '',
  email: '',
  status: 'active',
})

const password = ref('')
const password_confirmation = ref('')

const roles = ref([])
const organizations = ref([])

// Map structural assignment: key = role_id, value = arr of org_ids
const roleAssignments = ref({})

// Array of checked role IDs
const selectedRoles = ref([])

// Load từ cookie
watchEffect(() => {
  if (userCookie.value && !isSaving.value) {
    userDetail.value = {
      name: userCookie.value.fullName || userCookie.value.name || '',
      user_name: userCookie.value.user_name || '',
      email: userCookie.value.email || '',
      status: userCookie.value.status || 'active',
    }
  }
})

const fetchInitialData = async () => {
  isLoading.value = true
  try {
    // Profile is always accessible for authenticated users
    const profileRes = await useApi('/user/profile', { method: 'GET' })
    const user = profileRes.data.value?.data || profileRes.data.value || userCookie.value || {}

    // Populate role assignments based on user.assignments
    if (user.assignments && Array.isArray(user.assignments)) {
      user.assignments.forEach(a => {
        if (!selectedRoles.value.includes(a.role_id)) {
          selectedRoles.value.push(a.role_id)
        }
        roleAssignments.value[a.role_id] = a.organizations ? a.organizations.map(o => o.id) : []
      })
    }

    // Roles & Organizations require specific permissions — fetch gracefully
    try {
      const rolesRes = await useApi('/roles?limit=100')

      roles.value = rolesRes.data.value?.data || rolesRes.data.value || []
    } catch {
      roles.value = []
    }

    try {
      const orgsRes = await useApi('/organizations?limit=100')

      organizations.value = orgsRes.data.value?.data || orgsRes.data.value || []
    } catch {
      organizations.value = []
    }
  } catch (err) {
    console.error('Fetch user detail error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

const onRoleToggle = roleId => {
  const isSelected = selectedRoles.value.includes(roleId)
  if (isSelected) {
    if (!roleAssignments.value[roleId]) {
      const r = roles.value.find(x => x.id === roleId)
      if (r && r.organization_id) {
        roleAssignments.value[roleId] = [r.organization_id]
      } else {
        roleAssignments.value[roleId] = []
      }
    }
  } else {
    roleAssignments.value[roleId] = []
  }
}

const saveUser = async (goBack = false) => {
  isSaving.value = true
  try {
    const assignmentsList = selectedRoles.value.map(roleId => ({
      role_id: roleId,
      organization_ids: roleAssignments.value[roleId] || [],
    }))

    // Save profile details
    const { data: profileSaveRes } = await useApi('/user/profile', {
      method: 'PUT',
      body: {
        name: userDetail.value.name,
        email: userDetail.value.email,
        status: userDetail.value.status,
        assignments: assignmentsList,
      },
    })

    // Update cookie
    if (profileSaveRes.value) {
      const currentCookie = userCookie.value || {}

      userCookie.value = {
        ...currentCookie,
        fullName: userDetail.value.name,
        name: userDetail.value.name,
        email: userDetail.value.email,
        status: userDetail.value.status,
      }
    }

    // Save password optionally
    if (password.value) {
      await useApi('/user/change-password', {
        method: 'PUT',
        body: {
          password: password.value,
          password_confirmation: password_confirmation.value,
        },
      })
    }

    // Reset password fields after save
    password.value = ''
    password_confirmation.value = ''

    snackbar.value = { show: true, text: 'Cập nhật hồ sơ thành công!', color: 'success' }

    if (goBack) {
      router.push('/')
    }
  } catch (err) {
    console.error('Save error', err)
    snackbar.value = { show: true, text: 'Có lỗi xảy ra khi lưu!', color: 'error' }
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div>
    <!-- Snackbar messages -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
    >
      {{ snackbar.text }}
    </VSnackbar>

    <div v-if="!isLoading">
      <!-- Main Content -->
      <VRow>
        <!-- Left Column: User Info -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard class="h-100 pb-4">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon
                    icon="tabler-user"
                    size="26"
                  />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Thông tin người dùng
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      Cập nhật thông tin người dùng
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
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="password"
                      label="Mật khẩu mới"
                      type="password"
                      placeholder="••••••••"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="password_confirmation"
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      placeholder="••••••••"
                    />
                  </VCol>
                  <VCol
                    v-if="$can('update', 'User')"
                    cols="12"
                  >
                    <div class="text-body-2 font-weight-medium text-high-emphasis mb-2">
                      Trạng thái
                    </div>
                    <VRadioGroup
                      v-model="userDetail.status"
                      inline
                    >
                      <VRadio
                        label="Hoạt động"
                        value="active"
                      />
                      <VRadio
                        label="Không hoạt động"
                        value="inactive"
                      />
                    </VRadioGroup>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column: Roles & Organizations -->
        <VCol
          v-if="$can('update', 'User')"
          cols="12"
          md="8"
        >
          <VCard class="h-100 d-flex flex-column">
            <VCardItem class="pb-2 pt-6">
              <template #prepend>
                <div class="d-flex align-center text-primary gap-2">
                  <VIcon
                    icon="tabler-users-group"
                    size="26"
                  />
                  <div>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Vai trò & Tổ chức
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      Chọn vai trò và tổ chức
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6 pb-0 flex-grow-1">
              <VTable
                class="text-no-wrap mb-4"
                density="comfortable"
              >
                <thead>
                  <tr>
                    <th
                      class="text-uppercase text-caption font-weight-bold"
                      style="inline-size: 35%;"
                    >
                      Tên vai trò
                    </th>
                    <th class="text-uppercase text-caption font-weight-bold">
                      Tổ chức/Đơn vị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="role in roles"
                    :key="role.id"
                    class="border-b"
                    style="border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  >
                    <td class="px-0 py-2">
                      <VCheckbox
                        v-model="selectedRoles"
                        :value="role.id"
                        :label="role.name"
                        class="text-body-1"
                        hide-details
                        @change="onRoleToggle(role.id)"
                      />
                    </td>
                    <td class="px-0 py-2">
                      <template v-if="selectedRoles.includes(role.id)">
                        <AppSelect
                          v-if="!role.organization_id"
                          v-model="roleAssignments[role.id]"
                          :items="organizations"
                          item-title="name"
                          item-value="id"
                          multiple
                          chips
                          closable-chips
                          placeholder="Chọn tổ chức (hoặc Tất cả)"
                          density="compact"
                          hide-details
                        />
                        <AppSelect
                          v-else
                          v-model="roleAssignments[role.id]"
                          :items="organizations.filter(o => o.id === role.organization_id)"
                          item-title="name"
                          item-value="id"
                          multiple
                          chips
                          disabled
                          density="compact"
                          hide-details
                        />
                      </template>
                      <span
                        v-else
                        class="text-disabled text-body-2 ps-3"
                      >Vui lòng chọn vai trò</span>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>

            <div class="mt-auto">
              <VDivider />
              <VCardActions class="px-6 py-4 justify-end gap-3">
                <VBtn
                  variant="tonal"
                  color="primary"
                  :loading="isSaving"
                  @click="saveUser(false)"
                >
                  <VIcon
                    icon="tabler-device-floppy"
                    start
                  /> Lưu & Sửa
                </VBtn>
                <VBtn
                  variant="elevated"
                  color="primary"
                  :loading="isSaving"
                  @click="saveUser(true)"
                >
                  <VIcon
                    icon="tabler-check"
                    start
                  /> Lưu & Thoát
                </VBtn>
              </VCardActions>
            </div>
          </VCard>
        </VCol>
      </VRow>
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
.text-caption {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.gap-2 {
  gap: 8px;
}

.h-100 {
  block-size: 100%;
}
</style>
