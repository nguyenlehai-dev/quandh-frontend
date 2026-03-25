<script setup>
import LogisticsCardStatistics from '../components/LogisticsCardStatistics.vue'
import LogisticsDeliveryExpectations from '../components/LogisticsDeliveryExpectations.vue'
import LogisticsDeliveryPerformance from '../components/LogisticsDeliveryPerformance.vue'
import LogisticsOrderByCountries from '../components/LogisticsOrderByCountries.vue'
import LogisticsOverviewTable from '../components/LogisticsOverviewTable.vue'
import LogisticsShipmentStatistics from '../components/LogisticsShipmentStatistics.vue'
import LogisticsVehicleOverview from '../components/LogisticsVehicleOverview.vue'
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <LogisticsCardStatistics />
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <LogisticsVehicleOverview />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <LogisticsShipmentStatistics />
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <LogisticsDeliveryPerformance />
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <LogisticsDeliveryExpectations />
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <LogisticsOrderByCountries />
    </VCol>

    <VCol cols="12">
      <LogisticsOverviewTable />
    </VCol>
  </VRow>
</template>
