<script setup>
import {
  logout as authLogout,
  redirectToOrganizationSelection,
} from '@/services/auth'

const props = defineProps({
  section: {
    type: String,
    default: 'header',
    validator: value => ['header', 'footer'].includes(value),
  },
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userData = useCookie('userData')
const currentOrgId = useCookie('currentOrganizationId')
const storedOrganizations = useCookie('availableOrganizations')

const organizations = computed(() => {
  try {
    return JSON.parse(storedOrganizations.value || '[]')
  }
  catch {
    return []
  }
})

const currentOrganizationName = computed(() => {
  const currentOrganization = organizations.value.find(item => item.id === Number(currentOrgId.value))

  return currentOrganization?.name || t('navigation.navigation.no_organization_selected')
})

const userDisplayName = computed(() => {
  return userData.value?.name || userData.value?.user_name || 'User'
})

const userRoleSummary = computed(() => {
  const assignments = userData.value?.assignments || []

  if (!assignments.length)
    return t('navigation.navigation.user')

  return assignments.map(item => item.role_name).join(', ')
})

const userInitials = computed(() => {
  const name = userDisplayName.value.trim()

  if (!name)
    return 'U'

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
})

const switchOrganization = async () => {
  await redirectToOrganizationSelection(router, {
    to: route.fullPath !== '/' ? route.fullPath : undefined,
  })
}

const logout = async () => {
  await authLogout(router)
}
</script>

<template>
  <div
    v-if="section === 'header' && userData"
    class="mobile-nav-user-panel mobile-nav-user-panel--header d-xl-none"
  >
    <div class="mobile-nav-user-panel__card">
      <VAvatar
        size="44"
        :color="!(userData && userData.avatar) ? 'primary' : undefined"
        :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
      >
        <VImg
          v-if="userData && userData.avatar"
          :src="userData.avatar"
        />
        <span
          v-else
          class="mobile-nav-user-panel__initials"
        >
          {{ userInitials }}
        </span>
      </VAvatar>

      <div class="mobile-nav-user-panel__meta">
        <div class="mobile-nav-user-panel__name">
          {{ userDisplayName }}
        </div>
        <div class="mobile-nav-user-panel__role">
          {{ userRoleSummary }}
        </div>
        <div class="mobile-nav-user-panel__org">
          {{ currentOrganizationName }}
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="section === 'footer' && userData"
    class="mobile-nav-user-panel mobile-nav-user-panel--footer d-xl-none"
  >
    <VBtn
      block
      color="primary"
      variant="outlined"
      prepend-icon="tabler-switch-horizontal"
      class="mobile-nav-user-panel__footer-btn"
      @click="switchOrganization"
    >
      {{ t('navigation.navigation.switch_organization') }}
    </VBtn>

    <VBtn
      block
      color="error"
      variant="tonal"
      prepend-icon="tabler-logout"
      class="mobile-nav-user-panel__footer-btn"
      @click="logout"
    >
      {{ t('navigation.navigation.logout') }}
    </VBtn>
  </div>
</template>

<style scoped>
.mobile-nav-user-panel {
  padding-inline: 1rem;
}

.mobile-nav-user-panel--header {
  padding-block: 0.25rem 0.75rem;
}

.mobile-nav-user-panel--footer {
  margin-block-start: auto;
  padding-block: 0.75rem 1rem;
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.mobile-nav-user-panel__card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-surface), 1));
  padding: 0.875rem;
}

.mobile-nav-user-panel__meta {
  min-inline-size: 0;
}

.mobile-nav-user-panel__name,
.mobile-nav-user-panel__role,
.mobile-nav-user-panel__org {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-nav-user-panel__name {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.94);
}

.mobile-nav-user-panel__role {
  margin-block-start: 0.125rem;
  font-size: 0.77rem;
  color: rgba(var(--v-theme-on-surface), 0.66);
}

.mobile-nav-user-panel__org {
  margin-block-start: 0.25rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.mobile-nav-user-panel__initials {
  font-size: 0.95rem;
  font-weight: 700;
}

.mobile-nav-user-panel__footer-btn + .mobile-nav-user-panel__footer-btn {
  margin-block-start: 0.625rem;
}
</style>
