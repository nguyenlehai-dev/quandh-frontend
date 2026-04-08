<script setup>
import PageView from '@moduleTemplates/profile-settings/views/user-profile/[tab].vue'

definePage({
  meta: {
    navActiveLink: 'pages-user-profile-tab',
    key: 'tab',
  },
})
</script>

<template>
  <PageView />
</template>
