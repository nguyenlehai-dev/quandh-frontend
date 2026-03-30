<script setup>
import { ref } from 'vue'

const series = [{
  name: 'Hoạt động',
  data: [12, 18, 14, 25, 20, 30, 28],
}]

const chartOptions = {
  chart: {
    type: 'area',
    height: 300,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: {
    categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  },
  colors: ['#7367F0'],
}

const stats = ref([
  { title: 'Cuộc họp đã tham gia', count: 42, icon: 'tabler-users', color: 'primary' },
  { title: 'Tài liệu đã trình', count: 18, icon: 'tabler-file', color: 'success' },
  { title: 'Ý kiến phát biểu', count: 24, icon: 'tabler-message-circle', color: 'info' },
  { title: 'Lượt biểu quyết', count: 156, icon: 'tabler-checkbox', color: 'warning' },
])
</script>

<template>
  <VRow>
    <VCol
      v-for="stat in stats"
      :key="stat.title"
      cols="12"
      md="3"
    >
      <VCard>
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <h5 class="text-h4 font-weight-medium mb-1">
              {{ stat.count }}
            </h5>
            <span class="text-body-2">{{ stat.title }}</span>
          </div>
          <VAvatar
            :color="`rgba(var(--v-theme-${stat.color}), 0.16)`"
            size="48"
            variant="tonal"
          >
            <VIcon
              :color="stat.color"
              :icon="stat.icon"
              size="28"
            />
          </VAvatar>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Tần suất hoạt động trong tuần">
        <VCardText>
          <VueApexCharts
            type="area"
            height="300"
            :options="chartOptions"
            :series="series"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
