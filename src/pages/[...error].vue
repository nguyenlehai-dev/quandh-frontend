<script setup>
import PageView from '@moduleTemplates/system-pages/views/error.vue'

definePage({
  alias: '/pages/misc/not-found/:error(.*)',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <PageView />
</template>
