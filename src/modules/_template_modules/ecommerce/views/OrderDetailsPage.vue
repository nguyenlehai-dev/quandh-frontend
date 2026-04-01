<script setup>
const route = useRoute()
const orderId = computed(() => route.params.id)
</script>

<template>
  <section>
    <VCard title="Order Details">
      <VCardText>
        <p>Order ID: {{ orderId }}</p>
        <p>Order details page - coming soon</p>
      </VCardText>
    </VCard>
  </section>
</template>
