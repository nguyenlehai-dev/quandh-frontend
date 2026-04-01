<script setup>
import UserPage from '@/modules/auth/user/views/UserEditPage.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'User',
  },
})
</script>

<template>
  <UserPage />
</template>
