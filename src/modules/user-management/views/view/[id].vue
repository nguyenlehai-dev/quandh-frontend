<script setup>
import UserEditorForm from '@/modules/user-management/components/UserEditorForm.vue'

const route = useRoute('apps-user-view-id')
</script>

<template>
  <UserEditorForm
    mode="edit"
    :user-id="route.params.id"
  />
</template>
