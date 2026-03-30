<script setup>
import RolesPage from '@/modules/roles/views/RolesPageMain.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'Role',
  },
})
</script>

<template>
  <div id="roles-index-root">
    <RolesPage />
  </div>
</template>
