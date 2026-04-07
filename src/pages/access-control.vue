<script setup>
import PageView from '@moduleTemplates/access-control/views/index.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})
</script>

<template>
  <PageView />
</template>
