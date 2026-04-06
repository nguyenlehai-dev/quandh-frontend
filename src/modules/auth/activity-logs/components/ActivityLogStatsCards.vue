<script setup>
const { t } = useI18n()

defineProps({
  widgetData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <VRow class="mb-4">
    <VCol
      v-for="(data, idx) in widgetData"
      :key="idx"
      cols="12"
      md="6"
    >
      <VCard class="border">
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <p class="text-body-2 text-disabled mb-1">
              {{ t(data.title) }}
            </p>
            <h3 class="text-h3 font-weight-bold">
              {{ data.value }}
            </h3>
            <span class="text-caption text-disabled">{{ t(data.subtitle) }}</span>
          </div>
          <VAvatar
            :color="data.iconColor"
            variant="tonal"
            size="48"
            rounded
          >
            <VIcon
              :icon="data.icon"
              size="26"
            />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
