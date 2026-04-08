<script setup>
import { useCoreSettingsStore } from '@/modules/system-settings/stores/useCoreSettingsStore'

const coreSettingsStore = useCoreSettingsStore()
</script>

<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      <template v-if="coreSettingsStore.copyrightText">
        {{ coreSettingsStore.copyrightText }}
      </template>
      <template v-if="coreSettingsStore.designedByText">
        <span class="mx-1">|</span>
        {{ $t('footer.designed_by') }}
        <span class="text-primary ms-1">{{ coreSettingsStore.designedByText }}</span>
      </template>
    </span>
  </div>
</template>
