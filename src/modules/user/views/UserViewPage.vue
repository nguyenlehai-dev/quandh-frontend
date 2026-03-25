<script setup>
import UserBioPanel from '../components/UserBioPanel.vue'

const route = useRoute()
const userId = computed(() => route.params.id)
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <UserBioPanel />
      </VCol>

      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <VCard title="User Details">
          <VCardText>
            <p>User ID: {{ userId }}</p>
            <p>User detail page - coming soon</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
