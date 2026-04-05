<script setup>
defineProps({
  widgetData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="organization-stats mb-6">
    <VRow>
      <VCol
        v-for="(data, idx) in widgetData"
        :key="idx"
        cols="12"
        md="4"
        sm="6"
      >
        <VCard class="organization-stat-card">
          <VCardText class="organization-stat-card__body">
            <div class="d-flex justify-space-between align-start">
              <div class="d-flex flex-column gap-y-2">
                <div class="text-body-1 text-high-emphasis organization-stat-card__label">
                  {{ data.title }}
                </div>
                <h4 class="text-h3 organization-stat-card__value">
                  {{ data.value }}
                </h4>
              </div>
              <VAvatar
                :color="data.iconColor"
                variant="tonal"
                rounded
                size="42"
                class="organization-stat-card__icon"
              >
                <VIcon
                  :icon="data.icon"
                  size="26"
                />
              </VAvatar>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
