<script setup>
import RoleCards from '@/views/apps/roles/RoleCards.vue'
import UserList from '@/views/apps/roles/UserList.vue'
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">
        {{ $t('Role List') }}
      </h4>
      <p class="text-body-1 mb-0">
        {{ $t('Manage access groups by role and track which users are assigned to each role.') }}
      </p>
    </VCol>

    <!-- 👉 Roles Cards -->
    <VCol cols="12">
      <RoleCards />
    </VCol>

    <VCol cols="12">
      <h4 class="text-h4 mb-1 mt-6">
        {{ $t('Users by Role') }}
      </h4>
      <p class="text-body-1 mb-0">
        {{ $t('Track users, assigned roles, and process them quickly in bulk.') }}
      </p>
    </VCol>

    <VCol cols="12">
      <!-- 👉 User List  -->
      <UserList />
    </VCol>
  </VRow>
</template>
