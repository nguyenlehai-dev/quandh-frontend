<script setup>
import PageView from '@modules/auth/views/register.vue'

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
