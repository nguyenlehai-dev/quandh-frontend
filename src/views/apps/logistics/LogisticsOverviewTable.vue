<script setup>
const itemsPerPage = ref(5)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Endpoint này là demo, trên Core backend không có. Dùng dữ liệu mẫu trực tiếp để tránh lỗi Console.
const vehiclesData = ref({
  vehicles: [],
  totalVehicles: 0,
})

const vehiclesError = ref(null)

const fallbackVehicles = [
  { id: 1, location: 468031, startCity: 'Cagnes-sur-Mer', startCountry: 'France', endCity: 'Catania', endCountry: 'Italy', warnings: 'No Warnings', progress: 49 },
  { id: 2, location: 302781, startCity: 'Köln', startCountry: 'Germany', endCity: 'Laspezia', endCountry: 'Italy', warnings: 'Ecu Not Responding', progress: 24 },
  { id: 3, location: 715822, startCity: 'Chambray-lès-Tours', startCountry: 'France', endCity: 'Hamm', endCountry: 'Germany', warnings: 'Oil Leakage', progress: 7 },
  { id: 4, location: 451430, startCity: 'Berlin', startCountry: 'Germany', endCity: 'Gelsenkirchen', endCountry: 'Germany', warnings: 'No Warnings', progress: 95 },
  { id: 5, location: 921577, startCity: 'Cergy-Pontoise', startCountry: 'France', endCity: 'Berlin', endCountry: 'Germany', warnings: 'No Warnings', progress: 65 },
]

const vehicles = computed(() => {
  if (vehiclesError.value || !vehiclesData.value?.vehicles?.length)
    return fallbackVehicles
  
  return vehiclesData.value.vehicles
})

const totalVehicles = computed(() => {
  if (vehiclesError.value || !vehiclesData.value?.totalVehicles)
    return fallbackVehicles.length
    
  return vehiclesData.value.totalVehicles
})

const headers = [
  {
    title: 'LOCATION',
    key: 'location',
  },
  {
    title: 'STARTING ROUTE',
    key: 'startRoute',
  },
  {
    title: 'ENDING ROUTE',
    key: 'endRoute',
  },
  {
    title: 'WARNINGS',
    key: 'warnings',
  },
  {
    title: 'PROGRESS',
    key: 'progress',
  },
]

const resolveChipColor = warning => {
  if (warning === 'No Warnings')
    return 'success'
  if (warning === 'fuel problems')
    return 'primary'
  if (warning === 'Temperature Not Optimal')
    return 'warning'
  if (warning === 'Ecu Not Responding')
    return 'error'
  if (warning === 'Oil Leakage')
    return 'info'
}
</script>

<template>
  <VCard>
    <VCardItem title="On Route vehicles">
      <template #append>
        <MoreBtn />
      </template>
    </VCardItem>

    <VDivider />
    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
      ]"
      :items-length="totalVehicles"
      :items="vehicles"
      item-value="location"
      :headers="headers"
      show-select
      class="text-no-wrap"
      @update:options="updateOptions"
    >
      <template #item.location="{ item }">
        <VAvatar
          variant="tonal"
          color="secondary"
          class="me-4"
          size="40"
        >
          <VIcon
            icon="tabler-car"
            size="28"
          />
        </VAvatar>
        <RouterLink :to="{ name: 'apps-logistics-fleet' }">
          <div class="text-link text-base font-weight-medium d-inline-block">
            VOL-{{ item.location }}
          </div>
        </RouterLink>
      </template>

      <template #item.startRoute="{ item }">
        {{ item.startCity }}, {{ item.startCountry }}
      </template>

      <template #item.endRoute="{ item }">
        {{ item.endCity }}, {{ item.endCountry }}
      </template>

      <template #item.warnings="{ item }">
        <VChip
          :color="resolveChipColor(item.warnings)"
          label
          size="small"
        >
          {{ item.warnings }}
        </VChip>
      </template>

      <template #item.progress="{ item }">
        <div
          class="d-flex align-center gap-x-4"
          style="min-inline-size: 240px;"
        >
          <div class="w-100">
            <VProgressLinear
              :model-value="item.progress"
              rounded
              color="primary"
              :height="8"
            />
          </div>
          <div>
            {{ item.progress }}%
          </div>
        </div>
      </template>

      <!-- pagination -->
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalVehicles"
        />
      </template>
    </VDataTableServer>
  </VCard>
</template>
