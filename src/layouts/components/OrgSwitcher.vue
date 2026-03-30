<script setup>
import {
  getStoredOrganizations,
  redirectToOrganizationSelection,
} from '@/services/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const currentOrgId = useCookie('currentOrganizationId')

const organizations = computed(() => {
  return getStoredOrganizations()
})

const currentOrgName = computed(() => {
  const org = organizations.value.find(o => o.id === Number(currentOrgId.value))

  return org?.name || t('navigation.navigation.no_organization_selected')
})

const showSwitcher = computed(() => organizations.value.length >= 1)

const handleSwitchOrg = async () => {
  await redirectToOrganizationSelection(router, {
    to: route.fullPath !== '/' ? route.fullPath : undefined,
  })
}
</script>

<template>
  <div class="org-header-info">
    <VBtn
      v-if="showSwitcher"
      variant="tonal"
      color="primary"
      class="px-3"
      height="40"
      @click="handleSwitchOrg"
    >
      <div class="d-flex align-center gap-2">
        <VIcon
          icon="tabler-building-community"
          size="20"
        />
        <span class="org-name-text">{{ currentOrgName }}</span>
        <VIcon
          icon="tabler-switch-horizontal"
          size="16"
          class="ms-1"
        />
      </div>
    </VBtn>
  </div>
</template>

<style scoped>
.org-header-info {
  display: flex;
  align-items: center;
}

.org-name-text {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.3;
}
</style>
