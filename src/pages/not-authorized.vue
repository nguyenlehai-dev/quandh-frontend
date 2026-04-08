<script setup>
import PageView from '@moduleTemplates/system-pages/views/not-authorized.vue'

definePage({
  alias: '/pages/misc/not-authorized',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <PageView />
</template>
