<script setup>
const route = useRoute()
const invoiceId = computed(() => route.params.id)
</script>

<template>
  <section>
    <VCard title="Invoice Preview">
      <VCardText>
        <p>Invoice ID: {{ invoiceId }}</p>
        <p>Invoice preview page - coming soon</p>
      </VCardText>
    </VCard>
  </section>
</template>
