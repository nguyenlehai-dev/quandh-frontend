<script setup>
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

const loading = ref(false)
const usersStats = ref({ total: 0, active: 0, inactive: 0 })
const organizationsStats = ref({ total: 0, active: 0, inactive: 0 })
const rolesStats = ref({ total: 0, admin: 0, user: 0 })
const activityStats = ref({ total: 0, view: 0, create: 0, update: 0, delete: 0 })
const logs = ref([])

const fetchDashboard = async () => {
  loading.value = true

  try {
    const [
      usersResponse,
      organizationsResponse,
      rolesResponse,
      activityResponse,
      logsResponse,
    ] = await Promise.all([
      $api('/users/stats'),
      $api('/organizations/stats'),
      $api('/roles/stats'),
      $api('/log-activities/stats'),
      $api('/log-activities', {
        params: {
          limit: 50,
          page: 1,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      }),
    ])

    usersStats.value = usersResponse.data ?? usersStats.value
    organizationsStats.value = organizationsResponse.data ?? organizationsStats.value
    rolesStats.value = rolesResponse.data ?? rolesStats.value
    activityStats.value = activityResponse.data ?? activityStats.value
    logs.value = logsResponse.data ?? []
  }
  catch (error) {
    console.error('Fetch system dashboard error:', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})

const systemStats = computed(() => [
  {
    title: 'Người dùng',
    count: usersStats.value.total ?? 0,
    subtitle: `${usersStats.value.active ?? 0} đang hoạt động`,
    icon: 'tabler-users',
    color: 'primary',
  },
  {
    title: 'Tổ chức',
    count: organizationsStats.value.total ?? 0,
    subtitle: `${organizationsStats.value.active ?? 0} đang hoạt động`,
    icon: 'tabler-building',
    color: 'info',
  },
  {
    title: 'Vai trò',
    count: rolesStats.value.total ?? 0,
    subtitle: `${rolesStats.value.admin ?? 0} quản trị / ${rolesStats.value.user ?? 0} người dùng`,
    icon: 'tabler-shield-lock',
    color: 'success',
  },
  {
    title: 'Nhật ký hoạt động',
    count: activityStats.value.total ?? 0,
    subtitle: 'Theo bộ lọc mặc định toàn hệ thống',
    icon: 'tabler-history',
    color: 'warning',
  },
])

const actionLabels = ['Xem', 'Tạo', 'Cập nhật', 'Xóa']

const actionCounts = computed(() => [
  activityStats.value.view ?? 0,
  activityStats.value.create ?? 0,
  activityStats.value.update ?? 0,
  activityStats.value.delete ?? 0,
])

const actionSeries = computed(() => [{
  name: 'Số lượt',
  data: actionCounts.value,
}])

const barChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value

  return {
    chart: {
      type: 'bar',
      parentHeightOffset: 0,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 6,
      },
    },
    colors: [
      currentTheme.colors.primary,
      currentTheme.colors.success,
      currentTheme.colors.warning,
      currentTheme.colors.error,
    ],
    dataLabels: { enabled: false },
    xaxis: {
      categories: actionLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
    },
    legend: { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.08)', strokeDashArray: 6 },
  }
})

const donutChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value

  return {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: actionLabels,
    colors: [
      currentTheme.colors.primary,
      currentTheme.colors.success,
      currentTheme.colors.warning,
      currentTheme.colors.error,
    ],
    stroke: { width: 4, colors: ['#fff'] },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Tổng log',
              formatter: () => `${activityStats.value.total ?? 0}`,
            },
          },
        },
      },
    },
  }
})

const recentLogs = computed(() => logs.value.slice(0, 5))

const topUsers = computed(() => {
  const palette = ['primary', 'success', 'info', 'warning', 'secondary']
  const aggregated = logs.value.reduce((map, item) => {
    const userName = item.user_name
    if (!userName || userName === 'Guest') {
      return map
    }

    if (!map[userName]) {
      map[userName] = {
        name: userName,
        count: 0,
        latestAction: item.description || item.route || 'Không có mô tả',
      }
    }

    map[userName].count += 1

    return map
  }, {})

  return Object.values(aggregated)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      color: palette[index % palette.length],
      score: Math.min(item.count * 10, 100),
    }))
})

const formatDate = value => {
  if (!value) return 'N/A'

  return value
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VAvatar
          color="primary"
          variant="tonal"
          rounded
          size="48"
        >
          <VIcon
            icon="tabler-dashboard"
            size="28"
          />
        </VAvatar>
        <div>
          <h4 class="text-h4 font-weight-bold mb-1">
            Tổng quan Hệ thống
          </h4>
          <div class="text-body-2 text-disabled">
            Dữ liệu thật từ người dùng, tổ chức, vai trò và nhật ký hoạt động
          </div>
        </div>
      </div>

      <VBtn
        color="primary"
        prepend-icon="tabler-history"
        :to="{ name: 'system-activity-logs' }"
      >
        Xem nhật ký
      </VBtn>
    </div>

    <VRow class="mb-4">
      <VCol
        v-for="stat in systemStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard :loading="loading">
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              :color="stat.color"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon
                :icon="stat.icon"
                size="24"
              />
            </VAvatar>
            <div class="flex-grow-1">
              <div class="text-body-2 text-disabled mb-1">
                {{ stat.title }}
              </div>
              <div class="text-h4 font-weight-bold">
                {{ stat.count }}
              </div>
              <div class="text-caption text-disabled mt-1">
                {{ stat.subtitle }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mb-4 match-height">
      <VCol
        cols="12"
        md="8"
      >
        <VCard
          title="Phân bổ thao tác hệ thống"
          subtitle="Tổng hợp từ nhật ký hoạt động hiện có"
          :loading="loading"
        >
          <VCardText>
            <VueApexCharts
              type="bar"
              height="320"
              :options="barChartConfig"
              :series="actionSeries"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard
          title="Tỉ lệ thao tác"
          subtitle="Tương quan giữa xem, tạo, sửa và xóa"
          :loading="loading"
        >
          <VCardText class="d-flex align-center justify-center">
            <VueApexCharts
              type="donut"
              height="320"
              :options="donutChartConfig"
              :series="actionCounts"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mb-4">
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          title="Người dùng thao tác nhiều"
          subtitle="Tổng hợp từ 50 log gần nhất"
          :loading="loading"
        >
          <VCardText v-if="topUsers.length">
            <VList
              lines="two"
              rounded
              class="px-0"
            >
              <VListItem
                v-for="user in topUsers"
                :key="user.name"
                class="px-0 border-b pb-3 mb-3"
                style="border-bottom-color: rgba(var(--v-border-color), 0.5) !important;"
              >
                <template #prepend>
                  <VAvatar
                    :color="user.color"
                    variant="tonal"
                    rounded
                  >
                    <span class="text-h6 font-weight-bold">{{ user.name.charAt(0) }}</span>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium mb-1">
                  {{ user.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-disabled text-truncate">
                  {{ user.latestAction }}
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex flex-column align-end">
                    <span class="text-body-2 font-weight-medium mb-1 text-high-emphasis">{{ user.count }} lượt</span>
                    <VProgressLinear
                      :model-value="user.score"
                      :color="user.color"
                      height="6"
                      rounded
                      style="width: 80px;"
                    />
                  </div>
                </template>
              </VListItem>
            </VList>
          </VCardText>
          <VCardText
            v-else
            class="text-center text-disabled py-8"
          >
            Chưa có đủ dữ liệu nhật ký để xếp hạng.
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard
          title="Nhật ký gần nhất"
          subtitle="5 hoạt động mới nhất của hệ thống"
          :loading="loading"
        >
          <template #append>
            <VBtn
              variant="tonal"
              color="primary"
              size="small"
              :to="{ name: 'system-activity-logs' }"
            >
              Xem tất cả
            </VBtn>
          </template>

          <VCardText class="pa-0">
            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th class="text-uppercase text-caption font-weight-bold">
                    Thời gian
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    Người thực hiện
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    Route
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    Hành động
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold text-center">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!recentLogs.length && !loading">
                  <td
                    colspan="5"
                    class="text-center py-8 text-disabled"
                  >
                    Chưa có dữ liệu nhật ký.
                  </td>
                </tr>
                <tr
                  v-for="log in recentLogs"
                  v-else
                  :key="log.id"
                >
                  <td class="text-body-2 text-disabled whitespace-nowrap">
                    {{ formatDate(log.created_at) }}
                  </td>
                  <td class="font-weight-medium">
                    <div class="d-flex align-center gap-2">
                      <VAvatar
                        size="24"
                        color="primary"
                        variant="tonal"
                      >
                        <span class="text-xs">{{ (log.user_name || 'G').substring(0, 2) }}</span>
                      </VAvatar>
                      {{ log.user_name || 'Guest' }}
                    </div>
                  </td>
                  <td>
                    <VChip
                      size="small"
                      color="secondary"
                      variant="tonal"
                    >
                      {{ log.route || 'N/A' }}
                    </VChip>
                  </td>
                  <td
                    class="text-body-2 text-high-emphasis text-truncate"
                    style="max-width: 260px;"
                  >
                    {{ log.description || 'Không có mô tả' }}
                  </td>
                  <td class="text-center text-body-2 text-disabled font-monospace">
                    {{ log.ip_address || 'N/A' }}
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.match-height {
  display: flex;
  flex-wrap: wrap;
}
</style>
