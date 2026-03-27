<script setup>
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

  return org?.name || 'Chưa chọn Tổ chức'
})

const showSwitcher = computed(() => organizations.value.length >= 2)

const handleSwitch = async orgId => {
  if (orgId === Number(currentOrgId.value)) return

  isLoading.value = true
  try {
    // Gọi API switch
    await $api('/auth/switch-organization', {
      method: 'POST',
      body: { organization_id: orgId },
    })

    // Update cookie để App.vue re-render RouterView thông qua :key
    currentOrgId.value = orgId
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
  <div class="org-header-info">
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
          class="px-3"
          height="40"
          :loading="isLoading"
        >
          <div class="d-flex align-center gap-2">
            <VIcon
              icon="tabler-building-community"
              size="20"
            />
            <span class="org-name-text">{{ currentOrgName }}</span>
            <VIcon
              icon="tabler-chevron-down"
              size="16"
              class="ms-1"
            />
          </div>
        </VBtn>
      </template>

      <VList>
        <VListItem
          v-for="org in organizations"
          :key="org.id"
          :active="org.id === Number(currentOrgId)"
          @click="handleSwitch(org.id)"
        >
          <VListItemTitle>{{ org.name }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>

    <!-- Fallback nếu chỉ có 1 tổ chức (không cho switch) -->
    <div
      v-else
      class="d-flex align-center gap-3 px-3 py-2 rounded bg-light-primary"
    >
      <VIcon
        icon="tabler-building-community"
        size="20"
        color="primary"
      />
      <span class="org-name-text text-primary">{{ currentOrgName }}</span>
    </div>
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
