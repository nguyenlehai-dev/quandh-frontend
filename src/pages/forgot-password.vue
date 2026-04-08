<script setup>
import PageView from '@modules/auth/views/forgot-password.vue'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})
</script>

<template>
  <PageView />
</template>
