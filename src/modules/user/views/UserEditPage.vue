<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const userId = computed(() => route.params.id)

const isLoading = ref(true)
const isSavingDraft = ref(false)
const isSavingExit = ref(false)
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

const getRoleName = roleId => {
  const role = roles.value.find(item => item.id === roleId)

  return role?.name || `#${roleId}`
}

const fetchInitialData = async () => {
  isLoading.value = true
  try {
    const [rolesRes, orgsRes, userRes] = await Promise.all([
      $api('/roles?limit=100'),
      $api('/organizations?limit=100'),
      $api(`/users/${userId.value}`),
    ])

    organizations.value = orgsRes.data?.data || orgsRes.data || []
    roles.value = rolesRes.data?.data || rolesRes.data || []

    const user = userRes.data ?? userRes

    userDetail.value = {
      name: user.name || '',
      user_name: user.user_name || '',
      email: user.email || '',
      status: user.status || 'active',
    }

    // Populate role assignments based on user.assignments
    if (user.assignments && Array.isArray(user.assignments)) {
      user.assignments.forEach(a => {
        if (!selectedRoles.value.includes(a.role_id)) {
          selectedRoles.value.push(a.role_id)
        }
        roleAssignments.value[a.role_id] = a.organizations ? a.organizations.map(o => o.id) : []
      })
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
    if (!roleAssignments.value[roleId] || roleAssignments.value[roleId].length === 0) {
      const r = roles.value.find(x => x.id === roleId)
      if (r && r.organization_id) {
        roleAssignments.value = { ...roleAssignments.value, [roleId]: [r.organization_id] }
      } else {
        roleAssignments.value = { ...roleAssignments.value, [roleId]: [] }
      }
    }
  } else {
    roleAssignments.value = { ...roleAssignments.value, [roleId]: [] }
  }
}

const saveUser = async (goBack = false) => {
  if (goBack) isSavingExit.value = true
  else isSavingDraft.value = true
  
  try {
    const invalidAssignments = selectedRoles.value.filter(roleId => {
      const assignedOrganizations = roleAssignments.value[roleId] || []

      return assignedOrganizations.length === 0
    })

    if (invalidAssignments.length) {
      snackbar.value = {
        show: true,
        text: `Vai trò ${invalidAssignments.map(getRoleName).join(', ')} phải có ít nhất một tổ chức.`,
        color: 'error',
      }

      return
    }

    const assignmentsList = selectedRoles.value.map(roleId => ({
      role_id: roleId,
      organization_ids: roleAssignments.value[roleId] || [],
    }))

    const payload = {
      name: userDetail.value.name,
      user_name: userDetail.value.user_name,
      email: userDetail.value.email,
      status: userDetail.value.status,
      assignments: assignmentsList,
    }

    if (password.value) {
      payload.password = password.value
      payload.password_confirmation = password_confirmation.value
    }

    await $api(`/users/${userId.value}`, {
      method: 'PUT',
      body: payload,
    })

    // Reset password fields after save
    password.value = ''
    password_confirmation.value = ''

    if (goBack) {
      router.push({ name: 'apps-user-list' })
    } else {
      snackbar.value = { show: true, text: 'Lưu thông tin thành công!', color: 'success' }
    }
  } catch (err) {
    console.error('Save error', err)
    let msg = 'Có lỗi xảy ra khi lưu thông tin.'
    
    if (err.data?.errors) {
      msg = Object.values(err.data.errors).flat().join('\\n')
    } else if (err.data?.message) {
      msg = err.data.message
    } else if (err.message) {
      msg = err.message
    }
    
    snackbar.value = { show: true, text: msg, color: 'error' }
  } finally {
    isSavingDraft.value = false
    isSavingExit.value = false
  }
}

const goBack = () => {
  router.push({ name: 'apps-user-list' })
}
</script>

<template>
  <div v-if="!isLoading">
    <!-- Header -->
    <div class="d-flex align-center mb-6 gap-2">
      <IconBtn
        class="me-1"
        @click="goBack"
      >
        <VIcon
          icon="tabler-arrow-left"
          size="24"
        />
      </IconBtn>
      <h3 class="text-h4 font-weight-medium mb-0">
        Thông tin người dùng
      </h3>
    </div>

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
                    label="Mật khẩu"
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
                <VCol cols="12">
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
                    style="width: 35%;"
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
                  style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
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
                        placeholder="Chọn ít nhất một tổ chức"
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
                :loading="isSavingDraft"
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
                :loading="isSavingExit"
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

  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="4000"
    location="top right"
  >
    {{ snackbar.text }}
  </VSnackbar>
</template>

<style scoped>
.text-caption {
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.gap-2 {
  gap: 8px;
}
.h-100 {
  height: 100%;
}
</style>
