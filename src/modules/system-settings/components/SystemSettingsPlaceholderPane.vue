<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})

const { t } = useI18n()
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
        {{ description || t('settings.placeholder_description') }}
      </p>
    </VCardText>
  </VCard>
</template>
