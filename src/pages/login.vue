<script setup>
import PageView from '@modules/auth/views/login.vue'

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
