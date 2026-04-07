<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getStoredAvailableOrganizations, getStoredUserData, setStoredAuthSession } from '@/modules/auth/services/authStorage'
import { getCurrentCoreUser, normalizeCoreCurrentUserPayload } from '@/modules/auth/services/coreAuth'
import { getCoreErrorMessage } from '@/modules/core/utils/coreErrors'
import { mapCoreUserToViewModel } from '@/modules/user-management/utils/coreUserAdapters'

const { t } = useI18n()
const ability = useAbility()
const isLoading = ref(false)
const profile = ref(null)
const currentOrganization = ref(null)
const availableOrganizations = ref([])
const permissions = ref([])
const {
  isSnackbarVisible,
  snackbarColor,
  snackbarText,
  showSnackbar,
} = useOperationSnackbar()

const createProfileModel = ({
  currentOrganization: nextCurrentOrganization = null,
  permissions: nextPermissions = [],
  user = {},
  availableOrganizations: nextAvailableOrganizations = [],
}) => {
  const mappedUser = mapCoreUserToViewModel(user)

  return {
    ...mappedUser,
    assignments: mappedUser.assignments.map(item => ({
      ...item,
      organizations: item.organizations?.length
        ? item.organizations
        : (item.organizationIds ?? [])
            .map(organizationId => nextAvailableOrganizations.find(org => org.id === organizationId))
            .filter(Boolean),
    })),
    currentOrganization: nextCurrentOrganization,
    permissions: nextPermissions,
  }
}

const syncFromStoredProfile = () => {
  const storedUser = getStoredUserData()

  if (!storedUser?.id)
    return false

  availableOrganizations.value = getStoredAvailableOrganizations()
  currentOrganization.value = storedUser.currentOrganization ?? null
  permissions.value = storedUser.permissions ?? []
  profile.value = createProfileModel({
    availableOrganizations: availableOrganizations.value,
    currentOrganization: currentOrganization.value,
    permissions: permissions.value,
    user: {
      assignments: storedUser.assignments ?? [],
      created_at: storedUser.createdAt ?? '',
      created_by: storedUser.createdBy ?? 'N/A',
      email: storedUser.email ?? '',
      id: storedUser.id,
      name: storedUser.fullName ?? storedUser.name ?? storedUser.username ?? '',
      status: storedUser.status ?? 'inactive',
      updated_at: storedUser.updatedAt ?? '',
      updated_by: storedUser.updatedBy ?? 'N/A',
      user_name: storedUser.username ?? '',
    },
  })

  return true
}

const loadProfile = async () => {
  isLoading.value = true

  try {
    const response = await getCurrentCoreUser()
    const payload = normalizeCoreCurrentUserPayload(response)
    const currentUser = response?.data?.user ?? {}

    setStoredAuthSession(payload)
    ability.update(payload.userAbilityRules ?? [])

    availableOrganizations.value = payload.availableOrganizations ?? []
    currentOrganization.value = payload.currentOrganization ?? null
    permissions.value = payload.permissions ?? []
    profile.value = createProfileModel({
      availableOrganizations: availableOrganizations.value,
      currentOrganization: currentOrganization.value,
      permissions: permissions.value,
      user: currentUser,
    })
  }
  catch (error) {
    if (syncFromStoredProfile()) {
      showSnackbar('Không thể đồng bộ hồ sơ từ Core API. Đang hiển thị dữ liệu phiên đăng nhập hiện tại.', 'warning')

      return
    }

    showSnackbar(getCoreErrorMessage(error, 'Không thể tải hồ sơ cá nhân từ Core API.'), 'error')
  }
  finally {
    isLoading.value = false
  }
}

const statusLabel = computed(() => profile.value?.status === 'active' ? t('Active') : t('Inactive'))
const statusColor = computed(() => profile.value?.status === 'active' ? 'success' : 'secondary')
const categorizedPermissions = computed(() => {
  const groups = {}

  permissions.value.forEach(p => {
    const parts = p.split('.')
    const resource = parts[0]
    const action = parts[1] || 'access'

    if (!groups[resource])
      groups[resource] = []
    groups[resource].push(action)
  })

  return groups
})

const getResourceIcon = resource => {
  const iconMap = {
    user: 'tabler-users',
    role: 'tabler-lock',
    permission: 'tabler-shield-lock',
    organization: 'tabler-building',
    setting: 'tabler-settings',
    profile: 'tabler-user-circle',
    dashboard: 'tabler-layout-dashboard',
    system: 'tabler-device-desktop-analytics',
  }

  return iconMap[resource.toLowerCase()] || 'tabler-category'
}

const getActionColor = action => {
  const colorMap = {
    index: 'info',
    show: 'info',
    create: 'success',
    update: 'warning',
    delete: 'error',
    access: 'primary',
  }

  return colorMap[action.toLowerCase()] || 'secondary'
}

onMounted(loadProfile)
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-3">
        <VCardTitle class="text-h5">
          {{ $t('Personal Profile') }}
        </VCardTitle>
        <VCardSubtitle>
          {{ $t('Profile information is loaded from the current Core session.') }}
        </VCardSubtitle>
      </VCardItem>
    </VCard>

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

            <VCardTitle>{{ $t('Account Information') }}</VCardTitle>
            <VCardSubtitle>{{ $t('Fetched directly from GET /api/user.') }}</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow v-if="profile">
              <VCol cols="12">
                <AppTextField
                  :model-value="profile.fullName"
                  :label="$t('User Name')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.username"
                  :label="$t('Username')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.email"
                  :label="$t('Email')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <div class="text-body-1 font-weight-medium mb-2">
                  {{ $t('Status') }}
                </div>
                <VChip
                  label
                  :color="statusColor"
                >
                  {{ statusLabel }}
                </VChip>
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.createdBy"
                  :label="$t('Created By')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.createdAt"
                  :label="$t('Created At')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.updatedBy"
                  :label="$t('Updated By')"
                  readonly
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  :model-value="profile.updatedAt"
                  :label="$t('Updated At')"
                  readonly
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        lg="8"
      >
        <VCard
          :loading="isLoading"
          class="mb-6"
        >
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <VIcon icon="tabler-building-community" />
              </VAvatar>
            </template>

            <VCardTitle>{{ $t('Working Organization') }}</VCardTitle>
            <VCardSubtitle>{{ $t('Current session organization context.') }}</VCardSubtitle>
          </VCardItem>

          <VCardText v-if="profile">
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              {{ $t('Current organization:') }} <strong>{{ currentOrganization?.name ?? $t('No organization selected') }}</strong>
            </VAlert>

            <div class="text-body-1 font-weight-medium mb-3">
              {{ $t('Assigned Roles') }}
            </div>
            <div class="d-flex flex-wrap gap-2 mb-6">
              <VChip
                v-for="roleName in roleChips"
                :key="roleName"
                color="primary"
                label
              >
                {{ roleName }}
              </VChip>
            </div>

            <div class="text-body-1 font-weight-medium mb-3">
              {{ $t('Organization Units') }}
            </div>
            <div class="d-flex flex-wrap gap-2 mb-6">
              <VChip
                v-for="organizationName in organizationChips"
                :key="organizationName"
                color="info"
                variant="tonal"
                label
              >
                {{ organizationName }}
              </VChip>
            </div>

            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th class="text-uppercase">
                    {{ $t('Role') }}
                  </th>
                  <th class="text-uppercase">
                    {{ $t('Organization Unit') }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="assignment in profile.assignments"
                  :key="assignment.roleId"
                >
                  <td class="text-body-1 text-high-emphasis">
                    {{ assignment.roleName }}
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-2">
                      <VChip
                        v-for="organization in assignment.organizations"
                        :key="`${assignment.roleId}-${organization.id}`"
                        size="small"
                        color="secondary"
                        variant="tonal"
                        label
                      >
                        {{ organization.name }}
                      </VChip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>

        <VCard :loading="isLoading">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                size="32"
                color="warning"
                variant="tonal"
              >
                <VIcon icon="tabler-shield-check" />
              </VAvatar>
            </template>

            <VCardTitle>{{ $t('Access Permissions') }}</VCardTitle>
            <VCardSubtitle>{{ $t('Permission list grouped by system resources.') }}</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol
                v-for="(actions, resource) in categorizedPermissions"
                :key="resource"
                cols="12"
                sm="6"
              >
                <div class="d-flex align-center gap-x-2 mb-2">
                  <VIcon
                    :icon="getResourceIcon(resource)"
                    size="20"
                    class="text-disabled"
                  />
                  <span class="text-body-1 font-weight-medium text-capitalize">{{ resource }}</span>
                </div>
                <div class="d-flex flex-wrap gap-1">
                  <VChip
                    v-for="action in actions"
                    :key="action"
                    size="x-small"
                    :color="getActionColor(action)"
                    variant="tonal"
                    class="text-uppercase"
                  >
                    {{ action }}
                  </VChip>
                </div>
              </VCol>
            </VRow>

            <VAlert
              v-if="permissions.length === 0"
              type="warning"
              variant="tonal"
              class="mt-4"
            >
              {{ $t('No permissions found for the current session.') }}
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VSnackbar
      v-model="isSnackbarVisible"
      location="top end"
      :color="snackbarColor"
      timeout="2400"
    >
      {{ snackbarText }}
    </VSnackbar>
  </section>
</template>
