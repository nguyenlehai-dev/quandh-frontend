<script setup>
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()

store.skin = 'default'
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="help-center-page">
    <VContainer>
      <VCard title="Help Center">
        <VCardText>
          <p class="text-body-1">
            Help center page is under development.
          </p>
        </VCardText>
      </VCard>
    </VContainer>
  </div>
</template>

<style lang="scss">
.help-center-page {
  .help-center-section {
    padding-block: 5.25rem;
  }
}
</style>
