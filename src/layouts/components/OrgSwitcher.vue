<script setup>

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

  return org?.name || 'Sở Nội vụ thành phố Đà Nẵng'
})
</script>

<template>
  <div class="org-header-info">
    <div class="d-flex align-center gap-3">
      <!-- Organization Logo -->
      <div class="org-logo">
        <VIcon
          icon="tabler-building-community"
          size="20"
          color="primary"
        />
      </div>
      <div>
        <div class="org-name-text">
          <!-- {{ currentOrgName }} -->
          Sở Nội vụ thành phố Đà Nẵng
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.org-header-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.org-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 34px;
  block-size: 34px;
  border-radius: 50%;
  background: rgba(0, 137, 123, 0.08);
  flex-shrink: 0;
}

.org-name-text {
  font-weight: 600;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  letter-spacing: 0.2px;
  line-height: 1.3;
}
</style>
