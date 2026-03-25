<script setup>
const tabsData = [
  {
    icon: 'tabler-building-store',
    title: 'Store Details',
  },
  {
    icon: 'tabler-credit-card',
    title: 'Payments',
  },
  {
    icon: 'tabler-shopping-cart',
    title: 'Checkout',
  },
  {
    icon: 'tabler-discount',
    title: 'Shipping & Delivery',
  },
  {
    icon: 'tabler-map-pin',
    title: 'Location',
  },
  {
    icon: 'tabler-bell-ringing',
    title: 'Notifications',
  },
]

const activeTab = ref(null)
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="4"
    >
      <h5 class="text-h5 mb-4">
        Getting Started
      </h5>

      <VTabs
        v-model="activeTab"
        direction="vertical"
        class="v-tabs-pill disable-tab-transition"
      >
        <VTab
          v-for="(tabItem, index) in tabsData"
          :key="index"
          :prepend-icon="tabItem.icon"
        >
          {{ tabItem.title }}
        </VTab>
      </VTabs>
    </VCol>

    <VCol
      cols="12"
      md="8"
    >
      <VCard title="Settings">
        <VCardText>
          <p class="text-body-1">
            Settings content is under development.
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.my-class {
  padding: 1.25rem;
  border-radius: 0.375rem;
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}
</style>
