<script setup>
defineProps({
  icon: {
    type: String,
    default: 'tabler-lock',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <VCard
    elevation="0"
    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
  >
    <VCardText class="pa-10">
      <div
        class="d-flex flex-column align-center justify-center text-center"
        style="min-height: 280px;"
      >
        <VAvatar
          color="#fef3c7"
          size="72"
          variant="flat"
          class="mb-5"
        >
          <VIcon
            :icon="icon"
            size="36"
            color="#d97706"
          />
        </VAvatar>
        <div
          class="text-h6 font-weight-bold mb-2"
          style="color: #334155;"
        >
          {{ title }}
        </div>
        <div
          class="text-body-1 mb-6"
          style="color: #64748b; max-width: 420px;"
        >
          {{ description }}
        </div>
        <VChip
          variant="flat"
          style="background-color: #fef3c7; color: #92400e; font-weight: 600;"
        >
          <VIcon
            start
            size="16"
          >
            tabler-info-circle
          </VIcon>
          Tinh nang nay can cuoc hop da duoc luu
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>
