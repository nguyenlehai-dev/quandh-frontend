<script setup>
const route = useRoute()
const invoiceId = computed(() => route.params.id)
</script>

<template>
  <section>
    <VCard title="Edit Invoice">
      <VCardText>
        <p>Invoice ID: {{ invoiceId }}</p>
        <p>Invoice edit page - coming soon</p>
      </VCardText>
    </VCard>
  </section>
</template>
