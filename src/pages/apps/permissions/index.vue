<script setup>
import PermissionsPage from '@/modules/auth/permissions/views/PermissionsPage.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'Permission',
  },
})
</script>

<template>
  <div id="permissions-index-wrapper">
    <PermissionsPage />
  </div>
</template>
