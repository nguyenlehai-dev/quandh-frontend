<script setup>
import { switchOrganization } from '@/services/auth'

const currentOrgId = useCookie('currentOrganizationId')
const isLoading = ref(false)

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

  return org?.name || 'Chọn tổ chức'
})

// Chỉ hiển thị nếu user có >=2 tổ chức
const showSwitcher = computed(() => organizations.value.length >= 2)

const handleSwitch = async orgId => {
  if (orgId === Number(currentOrgId.value)) return

  isLoading.value = true
  try {
    await switchOrganization(orgId)

    // Reload trang để cập nhật toàn bộ dữ liệu theo org mới
    window.location.reload()
  }
  catch (err) {
    console.error('Switch org failed:', err)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VMenu
    v-if="showSwitcher"
    offset="12px"
    location="bottom end"
  >
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        variant="tonal"
        color="primary"
        size="small"
        :loading="isLoading"
        class="org-switcher-btn"
      >
        <VIcon
          icon="tabler-building"
          size="18"
          start
        />
        <span class="d-none d-sm-inline text-truncate org-name">
          {{ currentOrgName }}
        </span>
        <VIcon
          icon="tabler-chevron-down"
          size="16"
          end
        />
      </VBtn>
    </template>

    <VList
      density="compact"
      min-width="220"
    >
      <VListSubheader>Chuyển tổ chức</VListSubheader>

      <VListItem
        v-for="org in organizations"
        :key="org.id"
        :active="org.id === Number(currentOrgId)"
        :value="org.id"
        @click="handleSwitch(org.id)"
      >
        <template #prepend>
          <VIcon
            :icon="org.id === Number(currentOrgId) ? 'tabler-circle-check-filled' : 'tabler-building'"
            size="20"
            :color="org.id === Number(currentOrgId) ? 'primary' : undefined"
          />
        </template>

        <VListItemTitle>{{ org.name }}</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<style scoped>
.org-switcher-btn {
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

.org-name {
  max-inline-size: 140px;
}
</style>
