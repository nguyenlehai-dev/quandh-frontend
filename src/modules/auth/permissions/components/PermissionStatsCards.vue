<script setup>
defineProps({
  widgetData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="permission-stats mb-6">
    <VRow>
      <VCol
        v-for="(data, idx) in widgetData"
        :key="idx"
        cols="12"
        md="6"
      >
        <VCard class="permission-stat-card">
          <VCardText class="permission-stat-card__body">
            <div class="d-flex justify-space-between align-start">
              <div class="d-flex flex-column gap-y-2">
                <div class="text-body-1 text-high-emphasis">
                  {{ data.title }}
                </div>
                <h4 class="text-h3">
                  {{ data.value }}
                </h4>
                <div class="text-caption text-disabled">
                  {{ data.subtitle }}
                </div>
              </div>
              <VAvatar
                :color="data.iconColor"
                variant="tonal"
                rounded
                size="42"
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
