<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import { getStoredAvailableOrganizations, getStoredUserData } from '@/modules/auth/services/authStorage'
import { getCoreOrganizationOptions } from '@/modules/organization/services/coreOrganizations'
import { getCoreRoles } from '@/modules/role-permission/services/coreRoles'
import { createCoreUser, getCoreUser, updateCoreUser } from '@/modules/user-management/services/coreUsers'
import { buildCoreUserAssignmentsPayload, mapCoreUserToViewModel } from '@/modules/user-management/utils/coreUserAdapters'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
  },
  userId: {
    type: [Number, String],
    default: null,
  },
})

const router = useRouter()
const refForm = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const { hydratePendingSnackbar, isSnackbarVisible, queueSnackbar, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const roleRows = ref([])
const organizationOptions = ref([])
const isProfileReadOnly = ref(false)

const createEmptyRoleOrganizations = (rows = roleRows.value) => Object.fromEntries(rows.map(item => [String(item.value), []]))

const createDefaultFormState = () => ({
  id: null,
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'active',
  company: '',
  country: 'Vietnam',
  contact: '',
  role: 'subscriber',
  currentPlan: 'basic',
  billing: 'Auto Debit',
  avatar: '',
})

const formData = ref(createDefaultFormState())
const originalFormData = ref(createDefaultFormState())
const selectedRoles = ref([])
const roleOrganizations = ref(createEmptyRoleOrganizations())
const storedAuthUserData = computed(() => getStoredUserData() ?? {})
const isOwnProfile = computed(() => Number(props.userId) === Number(storedAuthUserData.value.id))

const isEditMode = computed(() => props.mode === 'edit')
const pageTitle = computed(() => isEditMode.value ? 'Thông tin người dùng' : 'Thêm mới người dùng')
const pageSubtitle = computed(() => isEditMode.value ? 'Chỉnh sửa thông tin người dùng và quyền truy cập.' : 'Thiết lập hồ sơ, trạng thái và quyền truy cập của người dùng.')
const organizationItems = computed(() => organizationOptions.value.map(item => ({
  title: item.name,
  value: item.id,
})))
const roleIdLookup = computed(() => roleRows.value.reduce((acc, role) => {
  acc[String(role.value)] = role

  return acc
}, {}))

const passwordRules = computed(() => {
  if (isEditMode.value)
    return []

  return [requiredValidator]
})

const confirmPasswordRules = computed(() => {
  const rules = []

  if (!isEditMode.value || formData.value.password)
    rules.push(requiredValidator)

  rules.push(value => value === formData.value.password || 'Xác nhận mật khẩu không khớp')

  return rules
})

const normalizeOrganizations = value => {
  if (Array.isArray(value))
    return value.map(Number).filter(Boolean)

  if (!value)
    return []

  return [Number(value)].filter(Boolean)
}

const toggleRoleSelection = (roleKey, isSelected) => {
  const normalizedRoleKey = String(roleKey)

  if (isSelected) {
    if (!selectedRoles.value.includes(normalizedRoleKey))
      selectedRoles.value = [...selectedRoles.value, normalizedRoleKey]

    return
  }

  selectedRoles.value = selectedRoles.value.filter(item => item !== normalizedRoleKey)
  roleOrganizations.value[normalizedRoleKey] = []
}

const syncFormData = user => {
  const nextOrganizations = createEmptyRoleOrganizations()
  const nextSelectedRoles = user.assignments
    .map(item => String(item.roleId))
    .filter(Boolean)

  user.assignments.forEach(item => {
    nextOrganizations[String(item.roleId)] = normalizeOrganizations(item.organizationIds)
  })

  formData.value = {
    id: user.id,
    fullName: user.fullName ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    password: '',
    confirmPassword: '',
    status: user.status ?? 'active',
    company: user.company ?? '',
    country: user.country ?? 'Vietnam',
    contact: user.contact ?? '',
    role: user.role ?? 'subscriber',
    currentPlan: user.currentPlan ?? 'basic',
    billing: user.billing ?? 'Auto Debit',
    avatar: user.avatar ?? '',
  }
  originalFormData.value = JSON.parse(JSON.stringify(formData.value))
  selectedRoles.value = nextSelectedRoles
  roleOrganizations.value = nextOrganizations
  refForm.value?.resetValidation()
}

const resetForm = () => {
  formData.value = createDefaultFormState()
  selectedRoles.value = []
  roleOrganizations.value = createEmptyRoleOrganizations()
  refForm.value?.resetValidation()
}

const loadReferenceData = async () => {
  const [rolesResult, organizationsResult] = await Promise.allSettled([
    getCoreRoles({ limit: 100, sortBy: 'created_at', sortOrder: 'desc' }),
    getCoreOrganizationOptions({ limit: 100, status: 'active', sortBy: 'created_at', sortOrder: 'desc' }),
  ])

  roleRows.value = rolesResult.status === 'fulfilled'
    ? (rolesResult.value.data ?? []).map(role => ({
      title: role.name,
      value: role.id,
    }))
    : []

  organizationOptions.value = organizationsResult.status === 'fulfilled'
    ? organizationsResult.value.data ?? []
    : []

  if (!roleRows.value.length && isOwnProfile.value) {
    roleRows.value = (storedAuthUserData.value.assignments ?? []).map(item => ({
      title: item.role_name,
      value: item.role_id,
    }))
  }

  if (!organizationOptions.value.length && isOwnProfile.value) {
    organizationOptions.value = getStoredAvailableOrganizations()
  }

  roleOrganizations.value = createEmptyRoleOrganizations()

  const referenceError = rolesResult.status === 'rejected'
    ? rolesResult.reason
    : organizationsResult.status === 'rejected'
      ? organizationsResult.reason
      : null

  if (referenceError) {
    showSnackbar(
      isCoreForbiddenError(referenceError)
        ? 'Tài khoản hiện tại không có quyền tải đủ vai trò hoặc tổ chức để chỉnh sửa người dùng.'
        : getCoreErrorMessage(referenceError, 'Không thể tải dữ liệu tham chiếu của người dùng.'),
      'error',
    )
  }
}

const syncFromStoredProfile = () => {
  const storedUser = storedAuthUserData.value

  if (!storedUser?.id)
    return false

  syncFormData(mapCoreUserToViewModel({
    assignments: storedUser.assignments ?? [],
    created_at: storedUser.createdAt,
    created_by: storedUser.createdBy,
    email: storedUser.email,
    id: storedUser.id,
    name: storedUser.fullName ?? storedUser.name,
    status: storedUser.status,
    updated_at: storedUser.updatedAt,
    updated_by: storedUser.updatedBy,
    user_name: storedUser.username,
  }))

  isProfileReadOnly.value = true

  if (!roleRows.value.length) {
    roleRows.value = (storedUser.assignments ?? []).map(item => ({
      title: item.role_name,
      value: item.role_id,
    }))
    roleOrganizations.value = createEmptyRoleOrganizations()
  }

  return true
}

const loadUser = async () => {
  if (!isEditMode.value || !props.userId) {
    isProfileReadOnly.value = false
    resetForm()

    return
  }

  isLoading.value = true

  try {
    const response = await getCoreUser(props.userId)

    isProfileReadOnly.value = false
    syncFormData(mapCoreUserToViewModel(response.data))
  }
  catch (error) {
    if (isOwnProfile.value && isCoreForbiddenError(error) && syncFromStoredProfile()) {
      showSnackbar('Đang hiển thị hồ sơ từ phiên đăng nhập hiện tại vì tài khoản không có quyền đọc chi tiết người dùng.', 'warning')

      return
    }

    showSnackbar(
      isCoreForbiddenError(error)
        ? 'Tài khoản hiện tại không có quyền xem thông tin người dùng này.'
        : getCoreErrorMessage(error, 'Không thể tải thông tin người dùng.'),
      'error',
    )
  }
  finally {
    isLoading.value = false
  }
}

const buildPayload = () => {
  const assignments = buildCoreUserAssignmentsPayload({
    roleOrganizations: roleOrganizations.value,
    selectedRoleIds: selectedRoles.value,
  })
  const payload = {
    assignments,
    name: formData.value.fullName,
    status: formData.value.status,
  }

  // Chỉ gửi email và user_name nếu thực sự có thay đổi để tránh lỗi SQL UNIQUE trên backend core
  if (isEditMode.value) {
    if (formData.value.email !== originalFormData.value.email)
      payload.email = formData.value.email

    if (formData.value.username !== originalFormData.value.username)
      payload.user_name = formData.value.username
  } else {
    payload.email = formData.value.email
    payload.user_name = formData.value.username
  }

  if (!isEditMode.value || formData.value.password) {
    payload.password = formData.value.password
    payload.password_confirmation = formData.value.confirmPassword
  }

  return payload
}

const saveForm = async action => {
  const { valid } = await refForm.value.validate()

  if (!valid)
    return

  if (isProfileReadOnly.value) {
    showSnackbar('Tài khoản hiện tại chỉ được xem hồ sơ của chính mình.', 'warning')

    return
  }

  if (!selectedRoles.value.length) {
    showSnackbar('Vui lòng chọn ít nhất một vai trò.')

    return
  }

  isLoading.value = true

  try {
    const payload = buildPayload()

    if (isEditMode.value && props.userId) {
      const response = await updateCoreUser(props.userId, payload)
      const updatedUser = mapCoreUserToViewModel(response.data)

      if (action === 'exit') {
        queueSnackbar('Đã cập nhật người dùng thành công.')
        await router.push({ name: 'apps-user-list' })

        return
      }

      if (action === 'stay') {
        syncFormData(updatedUser)
        showSnackbar('Đã cập nhật người dùng thành công.')
      }

      return
    }

    const response = await createCoreUser(payload)
    const createdUser = response.data

    if (action === 'add-another') {
      resetForm()
      showSnackbar('Đã tạo người dùng mới thành công.')

      return
    }

    if (action === 'exit') {
      queueSnackbar('Đã tạo người dùng mới thành công.')
      await router.push({ name: 'apps-user-list' })

      return
    }

    if (createdUser?.id) {
      queueSnackbar('Đã tạo người dùng mới thành công.')
      await router.push({
        name: 'apps-user-view-id',
        params: { id: createdUser.id },
      })
    }
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, 'Không thể lưu thông tin người dùng.'), 'error')
  }
  finally {
    isLoading.value = false
  }
}

watch(
  () => props.userId,
  () => {
    if (roleRows.value.length)
      loadUser()
  },
)

onMounted(async () => {
  hydratePendingSnackbar()
  await loadReferenceData()
  await loadUser()
})
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-3">
        <VCardTitle class="text-h5">
          {{ pageTitle }}
        </VCardTitle>
        <VCardSubtitle>
          {{ pageSubtitle }}
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <VForm
      ref="refForm"
      v-model="isFormValid"
      validate-on="submit"
    >
      <VRow>
        <VCol
          cols="12"
          lg="4"
        >
          <VCard :loading="isLoading">
            <VCardItem class="pb-2">
              <template #prepend>
                <VAvatar
                  size="32"
                  color="info"
                  variant="tonal"
                >
                  <VIcon icon="tabler-user-circle" />
                </VAvatar>
              </template>

              <VCardTitle>Thông tin người dùng</VCardTitle>
              <VCardSubtitle>Thiết lập tài khoản, trạng thái người dùng.</VCardSubtitle>
            </VCardItem>

            <VCardText>
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="formData.fullName"
                    label="Tên người dùng"
                    placeholder="Tên người dùng"
                    :readonly="isProfileReadOnly"
                    :rules="[requiredValidator]"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="formData.username"
                    label="Tên đăng nhập"
                    placeholder="Tên đăng nhập"
                    :readonly="isProfileReadOnly"
                    :rules="[requiredValidator]"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="formData.email"
                    label="Email"
                    placeholder="Email"
                    :readonly="isProfileReadOnly"
                    :rules="[requiredValidator, emailValidator]"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="formData.password"
                    label="Mật khẩu"
                    placeholder="············"
                    :readonly="isProfileReadOnly"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    :rules="passwordRules"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="formData.confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    placeholder="············"
                    :readonly="isProfileReadOnly"
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    :rules="confirmPasswordRules"
                    @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  />
                </VCol>

                <VCol cols="12">
                  <div class="text-body-1 font-weight-medium mb-3">
                    Trạng thái
                  </div>

                  <VRadioGroup
                    v-model="formData.status"
                    :disabled="isProfileReadOnly"
                    hide-details
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
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="8"
        >
          <VCard :loading="isLoading">
            <VCardItem class="pb-2">
              <template #prepend>
                <VAvatar
                  size="32"
                  color="primary"
                  variant="tonal"
                >
                  <VIcon icon="tabler-users-group" />
                </VAvatar>
              </template>

              <VCardTitle>Vai trò &amp; Tổ chức</VCardTitle>
              <VCardSubtitle>Chọn vai trò và tổ chức.</VCardSubtitle>
            </VCardItem>

            <VCardText>
              <VTable class="text-no-wrap">
                <thead>
                  <tr>
                    <th class="text-uppercase">
                      &nbsp;
                    </th>
                    <th class="text-uppercase">
                      Tên vai trò
                    </th>
                    <th class="text-uppercase">
                      Tổ chức đơn vị
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="roleItem in roleRows"
                    :key="roleItem.value"
                  >
                    <td style="inline-size: 52px;">
                      <VCheckboxBtn
                        :model-value="selectedRoles.includes(String(roleItem.value))"
                        :disabled="isProfileReadOnly"
                        @update:model-value="toggleRoleSelection(roleItem.value, $event)"
                      />
                    </td>
                    <td class="text-body-1 text-high-emphasis">
                      {{ roleItem.title }}
                    </td>
                    <td style="min-inline-size: 220px;">
                      <AppSelect
                        v-model="roleOrganizations[roleItem.value]"
                        :items="organizationItems"
                        placeholder="Vui lòng chọn tổ chức"
                        :disabled="isProfileReadOnly || !selectedRoles.includes(String(roleItem.value))"
                        multiple
                        chips
                        closable-chips
                        clearable
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>

            <VCardText
              v-if="!isProfileReadOnly"
              class="d-flex justify-end flex-wrap gap-3 pt-2"
            >
              <VBtn
                color="info"
                variant="tonal"
                prepend-icon="tabler-plus"
                @click="saveForm('add-another')"
              >
                Lưu &amp; Thêm
              </VBtn>

              <VBtn
                color="info"
                variant="tonal"
                prepend-icon="tabler-device-floppy"
                @click="saveForm('stay')"
              >
                Lưu &amp; Sửa
              </VBtn>

              <VBtn
                color="info"
                variant="tonal"
                prepend-icon="tabler-check"
                @click="saveForm('exit')"
              >
                Lưu &amp; Thoát
              </VBtn>
            </VCardText>

            <VCardText
              v-else
              class="pt-2"
            >
              <VAlert
                type="info"
                variant="tonal"
              >
                Hồ sơ này đang được hiển thị ở chế độ chỉ xem từ phiên đăng nhập hiện tại.
              </VAlert>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VForm>
  </section>

  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    timeout="2400"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>
