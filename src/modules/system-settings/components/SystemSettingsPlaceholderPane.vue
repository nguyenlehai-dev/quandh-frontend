<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Khu vực này đã được scaffold sẵn để tiếp tục áp business rule và form chi tiết.',
  },
})
</script>

<template>
  <VCard>
    <VCardText class="py-10 text-center">
      <VAvatar
        color="primary"
        variant="tonal"
        size="56"
        class="mb-4"
      >
        <VIcon
          icon="tabler-settings"
          size="28"
        />
      </VAvatar>

      <h5 class="text-h5 mb-2">
        {{ title }}
      </h5>

      <p class="text-body-1 text-medium-emphasis mb-0">
        {{ description }}
      </p>
    </VCardText>
  </VCard>
</template>
