<script setup>
/* eslint-disable camelcase */

import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createUser, fetchUser, updateUser } from '../services/userService'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const userFormRef = ref()
const isLoading = ref(true)
const isSavingDraft = ref(false)
const isSavingExit = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const defaultUserDetail = () => ({
  name: '',
  user_name: '',
  email: '',
  status: 'active',
})

const userDetail = ref(defaultUserDetail())
const password = ref('')
const password_confirmation = ref('')
const roles = ref([])
const organizations = ref([])
const roleAssignments = ref({})
const selectedRoles = ref([])

const userId = computed(() => route.params.id)
const isCreateMode = computed(() => route.name === 'apps-user-create')
const isViewMode = computed(() => route.name === 'apps-user-view-id')
const isReadOnly = computed(() => isViewMode.value)

const pageTitle = computed(() => {
  if (isCreateMode.value) return t('user.user.list.create_title')
  if (isViewMode.value) return t('user.user.view.title')

  return t('user.user.edit.title')
})

const userCardTitle = computed(() => isViewMode.value ? t('user.user.view.personal_info') : t('user.user.edit.user_card_title'))

const userCardSubtitle = computed(() => {
  if (isViewMode.value) return t('user.user.view.personal_info_hint')
  if (isCreateMode.value) return t('user.user.list.create_title')

  return t('user.user.edit.user_card_subtitle')
})

const rolesCardTitle = computed(() => isViewMode.value ? t('user.user.view.roles_organizations') : t('user.user.edit.roles_card_title'))
const rolesCardSubtitle = computed(() => isViewMode.value ? t('user.user.view.permissions_hint') : t('user.user.edit.roles_card_subtitle'))
const primarySaveLabel = computed(() => isCreateMode.value ? t('user.user.list.save') : t('user.user.edit.save_edit'))

const displayedRoles = computed(() => {
  if (!isViewMode.value) return roles.value

  return roles.value.filter(role => selectedRoles.value.includes(role.id))
})

const resetForm = () => {
  userDetail.value = defaultUserDetail()
  password.value = ''
  password_confirmation.value = ''
  roleAssignments.value = {}
  selectedRoles.value = []
}

const normalizeCollection = response => response?.data?.data || response?.data || []

const clearPasswordFields = async () => {
  password.value = ''
  password_confirmation.value = ''
  await nextTick()
  userFormRef.value?.resetValidation()
}

const resetCreateForm = async () => {
  resetForm()
  await nextTick()
  userFormRef.value?.resetValidation()
}

const normalizeUserStatus = status => {
  if (status === 'active') return 'active'
  if (status === 'banned') return 'banned'

  return 'inactive'
}

const getRoleName = roleId => {
  const role = roles.value.find(item => item.id === roleId)

  return role?.name || `#${roleId}`
}

const getOrganizationName = organizationId => {
  const organization = organizations.value.find(item => item.id === organizationId)

  return organization?.name || `#${organizationId}`
}

const populateAssignments = assignments => {
  roleAssignments.value = {}
  selectedRoles.value = []

  if (!Array.isArray(assignments)) return

  assignments.forEach(assignment => {
    if (!selectedRoles.value.includes(assignment.role_id))
      selectedRoles.value.push(assignment.role_id)

    roleAssignments.value[assignment.role_id] = Array.isArray(assignment.organizations)
      ? assignment.organizations.map(organization => organization.id)
      : (assignment.organization_ids || [])
  })
}

const fetchInitialData = async () => {
  isLoading.value = true
  resetForm()

  try {
    if (isCreateMode.value) {
      const [rolesRes, orgsRes] = await Promise.allSettled([
        $api('/roles?limit=100'),
        $api('/organizations?limit=100'),
      ])

      roles.value = rolesRes.status === 'fulfilled' ? normalizeCollection(rolesRes.value) : []
      organizations.value = orgsRes.status === 'fulfilled' ? normalizeCollection(orgsRes.value) : []

      return
    }

    const [rolesRes, orgsRes, userRes] = await Promise.allSettled([
      $api('/roles?limit=100'),
      $api('/organizations?limit=100'),
      fetchUser(userId.value),
    ])

    roles.value = rolesRes.status === 'fulfilled' ? normalizeCollection(rolesRes.value) : []
    organizations.value = orgsRes.status === 'fulfilled' ? normalizeCollection(orgsRes.value) : []

    if (userRes.status !== 'fulfilled')
      throw userRes.reason

    const user = userRes.value.data ?? userRes.value

    userDetail.value = {
      name: user.name || '',
      user_name: user.user_name || '',
      email: user.email || '',
      status: normalizeUserStatus(user.status),
    }

    populateAssignments(user.assignments)
  }
  catch (err) {
    console.error('Fetch user detail error:', err)
    snackbar.value = {
      show: true,
      text: err?.data?.message || err?.message || t('user.user.edit.save_error'),
      color: 'error',
    }
  }
  finally {
    isLoading.value = false
  }
}

watch([() => route.name, () => route.params.id], fetchInitialData, { immediate: true })

const onRoleToggle = roleId => {
  if (isReadOnly.value) return

  const isSelected = selectedRoles.value.includes(roleId)

  if (isSelected) {
    if (!roleAssignments.value[roleId] || roleAssignments.value[roleId].length === 0) {
      const role = roles.value.find(item => item.id === roleId)

      if (role?.organization_id)
        roleAssignments.value = { ...roleAssignments.value, [roleId]: [role.organization_id] }
      else
        roleAssignments.value = { ...roleAssignments.value, [roleId]: [] }
    }

    return
  }

  roleAssignments.value = { ...roleAssignments.value, [roleId]: [] }
}

const resolveErrorMessage = err => {
  if (err?.data?.errors) return Object.values(err.data.errors).flat().join('\n')
  if (err?.data?.message) return err.data.message
  if (err?.message) return err.message

  return t('user.user.edit.save_error')
}

const saveUser = async (goBack = false) => {
  if (isReadOnly.value) return

  if (goBack) isSavingExit.value = true
  else isSavingDraft.value = true

  try {
    const validation = await userFormRef.value?.validate()

    if (validation && !validation.valid) return

    if (password.value !== password_confirmation.value) {
      snackbar.value = { show: true, text: t('user.user.list.password_mismatch'), color: 'warning' }

      return
    }

    const invalidAssignments = selectedRoles.value.filter(roleId => {
      const assignedOrganizations = roleAssignments.value[roleId] || []

      return assignedOrganizations.length === 0
    })

    if (invalidAssignments.length) {
      snackbar.value = {
        show: true,
        text: t('user.user.edit.invalid_assignment', { roles: invalidAssignments.map(getRoleName).join(', ') }),
        color: 'error',
      }

      return
    }

    const payload = {
      name: userDetail.value.name,
      user_name: userDetail.value.user_name,
      email: userDetail.value.email,
      status: userDetail.value.status,
      assignments: selectedRoles.value.map(roleId => ({
        role_id: roleId,
        organization_ids: roleAssignments.value[roleId] || [],
      })),
    }

    if (password.value) {
      payload.password = password.value
      payload.password_confirmation = password_confirmation.value
    }

    if (isCreateMode.value)
      await createUser(payload)
    else
      await updateUser(userId.value, payload)

    if (isCreateMode.value) {
      if (goBack) {
        await clearPasswordFields()
        await router.push({ name: 'apps-user-list' })

        return
      }

      await resetCreateForm()
      snackbar.value = { show: true, text: t('user.user.edit.save_success'), color: 'success' }

      return
    }

    await clearPasswordFields()

    if (goBack) {
      await router.push({ name: 'apps-user-list' })

      return
    }

    snackbar.value = { show: true, text: t('user.user.edit.save_success'), color: 'success' }
  }
  catch (err) {
    console.error('Save error', err)
    snackbar.value = { show: true, text: resolveErrorMessage(err), color: 'error' }
  }
  finally {
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
        {{ pageTitle }}
      </h3>
    </div>

    <VForm ref="userFormRef">
      <VRow>
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
                      {{ userCardTitle }}
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      {{ userCardSubtitle }}
                    </VCardSubtitle>
                  </div>
                </div>
              </template>
            </VCardItem>

            <VCardText class="pt-6">
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.name"
                    :rules="[requiredValidator]"
                    :label="t('user.user.list.full_name')"
                    :readonly="isReadOnly"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.user_name"
                    :rules="[]"
                    :label="t('user.user.edit.fields.username')"
                    :readonly="isReadOnly"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.email"
                    :rules="[requiredValidator, emailValidator]"
                    :label="t('user.user.edit.fields.email')"
                    :readonly="isReadOnly"
                  />
                </VCol>
                <template v-if="!isViewMode">
                  <VCol cols="12">
                    <AppTextField
                      v-model="password"
                      :rules="isCreateMode ? [requiredValidator] : []"
                      :label="t('user.user.edit.fields.password')"
                      type="password"
                      placeholder="********"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="password_confirmation"
                      :rules="isCreateMode ? [requiredValidator] : []"
                      :label="t('user.user.edit.fields.confirm_password')"
                      type="password"
                      placeholder="********"
                    />
                  </VCol>
                </template>
                <VCol cols="12">
                  <div class="text-body-2 font-weight-medium text-high-emphasis mb-2">
                    {{ t('user.user.edit.fields.status') }}
                  </div>
                  <VRadioGroup
                    v-model="userDetail.status"
                    inline
                    :disabled="isReadOnly"
                  >
                    <VRadio
                      :label="t('user.user.edit.status.active')"
                      value="active"
                    />
                    <VRadio
                      :label="t('user.user.edit.status.inactive')"
                      value="inactive"
                    />
                    <VRadio
                      :label="t('user.user.edit.status.banned')"
                      value="banned"
                    />
                  </VRadioGroup>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

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
                      {{ rolesCardTitle }}
                    </VCardTitle>
                    <VCardSubtitle class="text-body-2">
                      {{ rolesCardSubtitle }}
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
                      {{ isViewMode ? t('user.user.view.role_name') : t('user.user.edit.fields.role_name') }}
                    </th>
                    <th class="text-uppercase text-caption font-weight-bold">
                      {{ isViewMode ? t('user.user.view.organization_unit') : t('user.user.edit.fields.organization_unit') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="role in displayedRoles"
                    :key="role.id"
                    class="border-b"
                    style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  >
                    <td class="px-0 py-2">
                      <span
                        v-if="isViewMode"
                        class="text-body-1 ps-3"
                      >{{ role.name }}</span>
                      <VCheckbox
                        v-else
                        v-model="selectedRoles"
                        :value="role.id"
                        :label="role.name"
                        class="text-body-1"
                        hide-details
                        @change="onRoleToggle(role.id)"
                      />
                    </td>
                    <td class="px-0 py-2">
                      <template v-if="isViewMode">
                        <div
                          v-if="(roleAssignments[role.id] || []).length"
                          class="d-flex flex-wrap gap-2 py-1"
                        >
                          <VChip
                            v-for="organizationId in roleAssignments[role.id]"
                            :key="organizationId"
                            size="small"
                            color="primary"
                            variant="tonal"
                          >
                            {{ getOrganizationName(organizationId) }}
                          </VChip>
                        </div>
                        <span
                          v-else
                          class="text-disabled text-body-2 ps-3"
                        >{{ t('user.user.view.no_organization') }}</span>
                      </template>
                      <template v-else-if="selectedRoles.includes(role.id)">
                        <AppSelect
                          v-if="!role.organization_id"
                          v-model="roleAssignments[role.id]"
                          :items="organizations"
                          item-title="name"
                          item-value="id"
                          multiple
                          chips
                          closable-chips
                          :placeholder="t('user.user.edit.fields.organization_placeholder')"
                          density="compact"
                          hide-details
                        />
                        <AppSelect
                          v-else
                          v-model="roleAssignments[role.id]"
                          :items="organizations.filter(organization => organization.id === role.organization_id)"
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
                      >{{ t('user.user.edit.empty_role') }}</span>
                    </td>
                  </tr>
                  <tr v-if="isViewMode && !displayedRoles.length">
                    <td
                      colspan="2"
                      class="text-center text-disabled py-6"
                    >
                      {{ t('user.user.view.no_role') }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>

            <div
              v-if="!isViewMode"
              class="mt-auto"
            >
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
                  /> {{ primarySaveLabel }}
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
                  /> {{ t('user.user.edit.save_exit') }}
                </VBtn>
              </VCardActions>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VForm>
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
