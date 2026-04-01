<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { ability } from '@/plugins/casl/ability'

const { t } = useI18n()
const vuetifyTheme = useTheme()

const loading = ref(false)
const usersStats = ref({ total: 0, active: 0, inactive: 0 })
const organizationsStats = ref({ total: 0, active: 0, inactive: 0 })
const rolesStats = ref({ total: 0, admin: 0, user: 0 })
const activityStats = ref({ total: 0, view: 0, create: 0, update: 0, delete: 0 })
const logs = ref([])
const DASHBOARD_FORBIDDEN_PREFIX = 'systemDashboardForbidden:'

const hasForbiddenFlag = key => sessionStorage.getItem(`${DASHBOARD_FORBIDDEN_PREFIX}${key}`) === '1'
const setForbiddenFlag = key => sessionStorage.setItem(`${DASHBOARD_FORBIDDEN_PREFIX}${key}`, '1')

const canViewUserStats = computed(() => ability.can('stats', 'User') && !hasForbiddenFlag('users-stats'))
const canViewOrganizationStats = computed(() => ability.can('stats', 'Organization') && !hasForbiddenFlag('organizations-stats'))
const canViewRoleStats = computed(() => ability.can('stats', 'Role') && !hasForbiddenFlag('roles-stats'))
const canViewLogStats = computed(() => ability.can('stats', 'ActivityLog') && !hasForbiddenFlag('log-activities-stats'))
const canViewLogList = computed(() => ability.can('read', 'ActivityLog') && !hasForbiddenFlag('log-activities-list'))
const canOpenActivityLogs = computed(() => canViewLogStats.value || canViewLogList.value)

const safeFetchDashboardResource = async (key, request) => {
  try {
    return await request()
  }
  catch (error) {
    if (error?.status === 403 || error?.statusCode === 403) {
      setForbiddenFlag(key)

      return null
    }

    throw error
  }
}

const fetchDashboard = async () => {
  loading.value = true

  const requests = [
    canViewUserStats.value ? safeFetchDashboardResource('users-stats', () => $api('/users/stats')) : Promise.resolve(null),
    canViewOrganizationStats.value ? safeFetchDashboardResource('organizations-stats', () => $api('/organizations/stats')) : Promise.resolve(null),
    canViewRoleStats.value ? safeFetchDashboardResource('roles-stats', () => $api('/roles/stats')) : Promise.resolve(null),
    canViewLogStats.value ? safeFetchDashboardResource('log-activities-stats', () => $api('/log-activities/stats')) : Promise.resolve(null),
    canViewLogList.value
      ? safeFetchDashboardResource('log-activities-list', () => $api('/log-activities', {
        params: {
          limit: 50,
          page: 1,
          ['sort_by']: 'created_at',
          ['sort_order']: 'desc',
        },
      }))
      : Promise.resolve(null),
  ]

  try {
    const [
      usersResponse,
      organizationsResponse,
      rolesResponse,
      activityResponse,
      logsResponse,
    ] = await Promise.allSettled(requests)

    if (usersResponse.status === 'fulfilled' && usersResponse.value)
      usersStats.value = usersResponse.value.data ?? usersStats.value

    if (organizationsResponse.status === 'fulfilled' && organizationsResponse.value)
      organizationsStats.value = organizationsResponse.value.data ?? organizationsStats.value

    if (rolesResponse.status === 'fulfilled' && rolesResponse.value)
      rolesStats.value = rolesResponse.value.data ?? rolesStats.value

    if (activityResponse.status === 'fulfilled' && activityResponse.value)
      activityStats.value = activityResponse.value.data ?? activityStats.value

    if (logsResponse.status === 'fulfilled' && logsResponse.value)
      logs.value = logsResponse.value.data ?? []
  }
  catch (error) {
    console.error('Fetch system dashboard error:', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)

const systemStats = computed(() => {
  const items = []

  if (canViewUserStats.value) {
    items.push({
      title: t('system-settings.system_settings.dashboard.stats.users'),
      count: usersStats.value.total ?? 0,
      subtitle: t('system-settings.system_settings.dashboard.stats.active_suffix', { count: usersStats.value.active ?? 0 }),
      icon: 'tabler-users',
      color: 'primary',
    })
  }

  if (canViewOrganizationStats.value) {
    items.push({
      title: t('system-settings.system_settings.dashboard.stats.organizations'),
      count: organizationsStats.value.total ?? 0,
      subtitle: t('system-settings.system_settings.dashboard.stats.active_suffix', { count: organizationsStats.value.active ?? 0 }),
      icon: 'tabler-building',
      color: 'info',
    })
  }

  if (canViewRoleStats.value) {
    items.push({
      title: t('system-settings.system_settings.dashboard.stats.roles'),
      count: rolesStats.value.total ?? 0,
      subtitle: t('system-settings.system_settings.dashboard.stats.roles_subtitle', {
        admin: rolesStats.value.admin ?? 0,
        user: rolesStats.value.user ?? 0,
      }),
      icon: 'tabler-shield-lock',
      color: 'success',
    })
  }

  if (canViewLogStats.value) {
    items.push({
      title: t('system-settings.system_settings.dashboard.stats.activity_logs'),
      count: activityStats.value.total ?? 0,
      subtitle: t('system-settings.system_settings.dashboard.stats.logs_subtitle'),
      icon: 'tabler-history',
      color: 'warning',
    })
  }

  return items
})

const actionLabels = [
  t('system-settings.system_settings.dashboard.action_labels.view'),
  t('system-settings.system_settings.dashboard.action_labels.create'),
  t('system-settings.system_settings.dashboard.action_labels.update'),
  t('system-settings.system_settings.dashboard.action_labels.delete'),
]

const actionCounts = computed(() => [
  activityStats.value.view ?? 0,
  activityStats.value.create ?? 0,
  activityStats.value.update ?? 0,
  activityStats.value.delete ?? 0,
])

const actionSeries = computed(() => [{
  name: t('system-settings.system_settings.dashboard.charts.series_name'),
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
              label: t('system-settings.system_settings.dashboard.charts.total_logs'),
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

    if (!userName || userName === 'Guest')
      return map

    if (!map[userName]) {
      map[userName] = {
        name: userName,
        count: 0,
        latestAction: item.description || item.route || t('system-settings.system_settings.dashboard.fallback.no_description'),
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

const formatDate = value => value || t('system-settings.system_settings.dashboard.fallback.not_available')
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
            {{ t('system-settings.system_settings.dashboard.title') }}
          </h4>
          <div class="text-body-2 text-disabled">
            {{ t('system-settings.system_settings.dashboard.description') }}
          </div>
        </div>
      </div>

      <VBtn
        v-if="canOpenActivityLogs"
        color="primary"
        prepend-icon="tabler-history"
        :to="{ name: 'system-activity-logs' }"
      >
        {{ t('system-settings.system_settings.dashboard.view_logs') }}
      </VBtn>
    </div>

    <VAlert
      v-if="systemStats.length === 0 && !canViewLogList"
      type="info"
      variant="tonal"
      class="mb-6"
    >
      {{ t('system-settings.system_settings.dashboard.fallback.no_data') }}
    </VAlert>

    <VRow
      v-if="systemStats.length"
      class="mb-4"
    >
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

    <VRow
      v-if="canViewLogStats"
      class="mb-4 match-height"
    >
      <VCol
        cols="12"
        md="8"
      >
        <VCard
          :title="t('system-settings.system_settings.dashboard.charts.actions_distribution_title')"
          :subtitle="t('system-settings.system_settings.dashboard.charts.actions_distribution_subtitle')"
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
          :title="t('system-settings.system_settings.dashboard.charts.action_ratio_title')"
          :subtitle="t('system-settings.system_settings.dashboard.charts.action_ratio_subtitle')"
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

    <VRow
      v-if="canViewLogList"
      class="mb-4"
    >
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          :title="t('system-settings.system_settings.dashboard.top_users.title')"
          :subtitle="t('system-settings.system_settings.dashboard.top_users.subtitle')"
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
                    <span class="text-body-2 font-weight-medium mb-1 text-high-emphasis">
                      {{ t('system-settings.system_settings.dashboard.top_users.count_suffix', { count: user.count }) }}
                    </span>
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
            {{ t('system-settings.system_settings.dashboard.top_users.empty') }}
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard
          :title="t('system-settings.system_settings.dashboard.latest_logs.title')"
          :subtitle="t('system-settings.system_settings.dashboard.latest_logs.subtitle')"
          :loading="loading"
        >
          <template #append>
            <VBtn
              variant="tonal"
              color="primary"
              size="small"
              :to="{ name: 'system-activity-logs' }"
            >
              {{ t('system-settings.system_settings.dashboard.latest_logs.view_all') }}
            </VBtn>
          </template>

          <VCardText class="pa-0">
            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th class="text-uppercase text-caption font-weight-bold">
                    {{ t('system-settings.system_settings.dashboard.latest_logs.time') }}
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    {{ t('system-settings.system_settings.dashboard.latest_logs.actor') }}
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    {{ t('system-settings.system_settings.dashboard.latest_logs.route') }}
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    {{ t('system-settings.system_settings.dashboard.latest_logs.action') }}
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold text-center">
                    {{ t('system-settings.system_settings.dashboard.latest_logs.ip') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!recentLogs.length && !loading">
                  <td
                    colspan="5"
                    class="text-center py-8 text-disabled"
                  >
                    {{ t('system-settings.system_settings.dashboard.latest_logs.empty') }}
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
                        <span class="text-xs">
                          {{ (log.user_name || t('system-settings.system_settings.dashboard.fallback.guest').charAt(0)).substring(0, 2) }}
                        </span>
                      </VAvatar>
                      {{ log.user_name || t('system-settings.system_settings.dashboard.fallback.guest') }}
                    </div>
                  </td>
                  <td>
                    <VChip
                      size="small"
                      color="secondary"
                      variant="tonal"
                    >
                      {{ log.route || t('system-settings.system_settings.dashboard.fallback.not_available') }}
                    </VChip>
                  </td>
                  <td
                    class="text-body-2 text-high-emphasis text-truncate"
                    style="max-width: 260px;"
                  >
                    {{ log.description || t('system-settings.system_settings.dashboard.fallback.no_description') }}
                  </td>
                  <td class="text-center text-body-2 text-disabled font-monospace">
                    {{ log.ip_address || t('system-settings.system_settings.dashboard.fallback.not_available') }}
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
