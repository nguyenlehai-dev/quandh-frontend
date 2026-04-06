<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { ability } from '@/plugins/casl/ability'

const vuetifyTheme = useTheme()

const meetingsData = ref({ data: [] })
const statsResponse = ref({ data: {} })
const meetingsLoading = ref(false)
const statsLoading = ref(false)

const canViewMeetingList = computed(() => ability.can('index', 'Meeting'))
const canViewMeetingStats = computed(() => ability.can('stats', 'Meeting'))

const fetchMeetings = async () => {
  if (!canViewMeetingList.value) return

  meetingsLoading.value = true
  try {
    meetingsData.value = await $api('/meetings')
  }
  catch (error) {
    console.error('Fetch meetings overview list error:', error)
    meetingsData.value = { data: [] }
  }
  finally {
    meetingsLoading.value = false
  }
}

const fetchStats = async () => {
  if (!canViewMeetingStats.value) return

  statsLoading.value = true
  try {
    statsResponse.value = await $api('/meetings/stats')
  }
  catch (error) {
    console.error('Fetch meetings overview stats error:', error)
    statsResponse.value = { data: {} }
  }
  finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  fetchMeetings()
  fetchStats()
})

const stats = computed(() => {
  const data = statsResponse.value?.data || {}

  return {
    totalMeetings: data.total || 0,
    activeMeetings: data.active || 0,
    completedMeetings: data.completed || 0,
    totalParticipants: data.total_participants || 0,
    totalVotes: data.total_votes || 0,
    totalDocuments: data.total_documents || 0,
  }
})

const monthlyMeetingsSeries = computed(() => [{
  name: 'Meeting count',
  data: statsResponse.value?.data?.chart_frequency || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}])

const statusDonutSeries = computed(() => statsResponse.value?.data?.chart_status_ratio || [0, 0, 0, 0])

const upcomingMeetings = computed(() => {
  if (!meetingsData.value?.data) return []

  return meetingsData.value.data
    .filter(item => item.status === 'draft' || item.status === 'in_progress' || item.status === 'active')
    .slice(0, 5)
})

const statusLabels = ['Draft', 'In progress', 'Completed', 'Canceled']

const barChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value

  return {
    chart: { type: 'bar', parentHeightOffset: 0, toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
      bar: { columnWidth: '32%', startingShape: 'rounded', endingShape: 'rounded', borderRadius: 4 },
    },
    grid: { show: true, strokeDashArray: 7, borderColor: 'rgba(0,0,0,0.1)' },
    colors: [currentTheme.colors.primary],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } },
    },
    yaxis: {
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } },
    },
  }
})

const donutChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value

  return {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: statusLabels,
    colors: [
      currentTheme.colors.info,
      currentTheme.colors.success,
      currentTheme.colors.secondary,
      currentTheme.colors.error,
    ],
    stroke: { width: 4, colors: ['#fff'] },
    dataLabels: { enabled: false, formatter: val => `${val.toFixed(1)}%` },
    legend: { position: 'bottom', markers: { offsetX: -3 } },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { fontSize: '1.2rem', fontFamily: 'inherit' },
            value: { fontSize: '1.5rem', fontFamily: 'inherit', fontWeight: 'bold', formatter: val => `${val}` },
            total: { show: true, fontSize: '1.2rem', label: 'Total' },
          },
        },
      },
    },
  }
})

const resolveStatusVariant = status => {
  switch (status) {
  case 'draft':
    return { color: 'warning', text: 'Draft' }
  case 'in_progress':
  case 'active':
    return { color: 'success', text: 'In progress' }
  case 'completed':
    return { color: 'secondary', text: 'Completed' }
  default:
    return { color: 'primary', text: 'Other' }
  }
}
</script>

<template>
  <div class="business-overview">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VAvatar color="primary" variant="tonal" rounded size="48">
          <VIcon icon="tabler-chart-pie" size="28" />
        </VAvatar>
        <div>
          <h4 class="text-h4 font-weight-bold mb-1">Meeting Overview</h4>
          <div class="text-body-2 text-disabled">High-level summary of meeting activity in the system</div>
        </div>
      </div>

      <VBtn v-if="canViewMeetingList" color="primary" prepend-icon="tabler-plus" to="/meetings">
        Manage Meetings
      </VBtn>
    </div>

    <VAlert v-if="!canViewMeetingList && !canViewMeetingStats" type="info" variant="tonal" class="mb-6">
      You do not have permission to view the meeting overview.
    </VAlert>

    <template v-else>
      <VRow v-if="canViewMeetingStats" class="mb-4">
        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="primary" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-calendar-event" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Total meetings</div>
                <div class="text-h4 font-weight-bold text-primary">{{ stats.totalMeetings }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="success" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-player-play" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Active and upcoming</div>
                <div class="text-h4 font-weight-bold text-success">{{ stats.activeMeetings }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="secondary" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-circle-check" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Completed</div>
                <div class="text-h4 font-weight-bold text-secondary">{{ stats.completedMeetings }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="warning" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-users" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Participants</div>
                <div class="text-h4 font-weight-bold text-warning">{{ stats.totalParticipants }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="info" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-checkbox" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Voting sessions</div>
                <div class="text-h4 font-weight-bold text-info">{{ stats.totalVotes }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="2">
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar color="warning" variant="tonal" size="48" rounded>
                <VIcon icon="tabler-files" size="24" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-disabled mb-1">Documents</div>
                <div class="text-h4 font-weight-bold text-warning">{{ stats.totalDocuments }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow v-if="canViewMeetingStats" class="mb-4 match-height">
        <VCol cols="12" md="8">
          <VCard title="Meeting frequency in 2026">
            <VCardText>
              <VueApexCharts type="bar" height="300" :options="barChartConfig" :series="monthlyMeetingsSeries" />
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard title="Status ratio">
            <VCardText class="d-flex align-center justify-center">
              <VueApexCharts type="donut" height="330" :options="donutChartConfig" :series="statusDonutSeries" />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow v-if="canViewMeetingList">
        <VCol cols="12">
          <VCard title="Upcoming or active meetings" subtitle="Quick view of meetings that need attention">
            <template #append>
              <VBtn variant="tonal" color="primary" size="small" to="/meetings">View all</VBtn>
            </template>

            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th class="text-uppercase text-caption font-weight-bold">Meeting</th>
                  <th class="text-uppercase text-caption font-weight-bold">Start time</th>
                  <th class="text-uppercase text-caption font-weight-bold">Location</th>
                  <th class="text-uppercase text-caption font-weight-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="meetingsLoading">
                  <td colspan="4" class="text-center py-4">
                    <VProgressCircular indeterminate color="primary" />
                  </td>
                </tr>
                <tr v-else-if="upcomingMeetings.length === 0">
                  <td colspan="4" class="text-center py-8 text-disabled">No upcoming meetings found</td>
                </tr>
                <tr v-for="meeting in upcomingMeetings" v-else :key="meeting.id">
                  <td class="font-weight-medium text-high-emphasis">
                    <div class="d-flex align-center gap-3">
                      <VAvatar color="primary" variant="tonal" size="32" rounded>
                        <VIcon icon="tabler-presentation" size="18" />
                      </VAvatar>
                      {{ meeting.title }}
                    </div>
                  </td>
                  <td>{{ meeting.start_at || 'Not scheduled' }}</td>
                  <td>{{ meeting.location || 'Not set' }}</td>
                  <td class="text-center">
                    <VChip :color="resolveStatusVariant(meeting.status).color" size="small">
                      {{ resolveStatusVariant(meeting.status).text }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>

<style scoped>
.business-overview .v-card {
  border: 1px solid rgba(var(--v-theme-primary-darken-1), 0.1);
  box-shadow: 0 4px 18px -4px rgba(var(--v-theme-primary-darken-1), 0.05) !important;
}
</style>
