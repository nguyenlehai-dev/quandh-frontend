<script setup>
const router = useRouter()
const currentOrgId = useCookie('currentOrganizationId')

// Lấy danh sách tổ chức từ localStorage
const organizations = computed(() => {
  try {
    const raw = localStorage.getItem('availableOrganizations')

    return raw ? JSON.parse(raw) : []
  }
  catch {
    return []
  }
})

// Tên tổ chức hiện tại
const currentOrgName = computed(() => {
  const org = organizations.value.find(o => o.id === Number(currentOrgId.value))

  return org?.name || 'Chưa chọn Tổ chức'
})

const showSwitcher = computed(() => organizations.value.length >= 1)

// Chuyển sang trang chọn tổ chức và giữ lại org hiện tại trong query để preselect.
const handleSwitchOrg = () => {
  const previousOrgId = currentOrgId.value ? String(currentOrgId.value) : undefined

  currentOrgId.value = null
  router.push({
    path: '/select-organization',
    query: previousOrgId ? { current_org: previousOrgId } : {},
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
