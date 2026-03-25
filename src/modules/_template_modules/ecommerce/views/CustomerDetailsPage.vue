<script setup>
const route = useRoute()
const customerId = computed(() => route.params.id)
</script>

<template>
  <section>
    <VCard title="Customer Details">
      <VCardText>
        <p>Customer ID: {{ customerId }}</p>
        <p>Customer details page - coming soon</p>
      </VCardText>
    </VCard>
  </section>
</template>
