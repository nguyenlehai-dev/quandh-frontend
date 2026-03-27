<script setup>
import { computed, ref, watchEffect } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

// API Fetch for meetings and stats
const { data: meetingsData, isFetching: meetingsLoading } = await useApi('/meetings')
const { data: statsResponse, isFetching: statsLoading } = await useApi('/meetings/stats')

const stats = computed(() => {
  const data = statsResponse.value?.data || {}
  return {
    totalMeetings: data.total || 0,
    activeMeetings: data.active || 0,
    totalVotes: data.total_votes || 0,
    totalDocuments: data.total_documents || 0,
  }
})

// Dynamic Chart Series
const monthlyMeetingsSeries = computed(() => [{
  name: 'Số cuộc họp',
  data: statsResponse.value?.data?.chart_frequency || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}])

const statusDonutSeries = computed(() => {
  return statsResponse.value?.data?.chart_status_ratio || [0, 0, 0, 0]
})

const upcomingMeetings = computed(() => {
  if (!meetingsData.value?.data) return []
  return meetingsData.value.data.filter(m => m.status === 'pending' || m.status === 'in_progress' || m.status === 'active').slice(0, 5)
})

const statusLabels = ['Chờ diễn ra', 'Đang diễn ra', 'Đã kết thúc', 'Đã huỷ']

// Chart Configs
const barChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value
  return {
    chart: { type: 'bar', parentHeightOffset: 0, toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
      bar: { columnWidth: '32%', startingShape: 'rounded', endingShape: 'rounded', borderRadius: 4 }
    },
    grid: { show: true, strokeDashArray: 7, borderColor: 'rgba(0,0,0,0.1)' },
    colors: [currentTheme.colors.primary],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } }
    },
    yaxis: {
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } }
    }
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
    dataLabels: { enabled: false, formatter: (val) => `${val.toFixed(1)}%` },
    legend: { position: 'bottom', markers: { offsetX: -3 } },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { fontSize: '1.2rem', fontFamily: 'inherit' },
            value: { fontSize: '1.5rem', fontFamily: 'inherit', fontWeight: 'bold', formatter: (val) => `${val}` },
            total: { show: true, fontSize: '1.2rem', label: 'Tổng số' }
          }
        }
      }
    }
  }
})

const resolveStatusVariant = status => {
  switch (status) {
    case 'pending':
      return { color: 'warning', text: 'Chờ diễn ra' }
    case 'in_progress':
    case 'active':
      return { color: 'success', text: 'Đang diễn ra' }
    case 'inactive':
    case 'completed':
      return { color: 'secondary', text: 'Đã kết thúc' }
    default:
      return { color: 'primary', text: 'Trạng thái khác' }
  }
}
</script>

<template>
  <div class="business-overview">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VAvatar color="primary" variant="tonal" rounded size="48">
          <VIcon icon="tabler-chart-pie" size="28" />
        </VAvatar>
        <div>
          <h4 class="text-h4 font-weight-bold mb-1">
            Tổng quan quản lý họp
          </h4>
          <div class="text-body-2 text-disabled">
            Phân tích số liệu và tình hình tổ chức cuộc họp toàn hệ thống
          </div>
        </div>
      </div>
      <div>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          to="/meetings"
        >
          Quản Lý Cuộc Họp
        </VBtn>
      </div>
    </div>

    <!-- Stats Row -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar color="primary" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-calendar-event" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-disabled mb-1">Tổng cuộc họp</div>
              <div class="text-h4 font-weight-bold text-primary">{{ stats.totalMeetings }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar color="success" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-player-play" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-disabled mb-1">Đang & Sắp diễn ra</div>
              <div class="text-h4 font-weight-bold text-success">{{ stats.activeMeetings }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar color="info" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-checkbox" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-disabled mb-1">Phiên biểu quyết</div>
              <div class="text-h4 font-weight-bold text-info">{{ stats.totalVotes }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar color="warning" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-files" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-disabled mb-1">Tổng tài liệu</div>
              <div class="text-h4 font-weight-bold text-warning">{{ stats.totalDocuments }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Charts Row -->
    <VRow class="mb-4 match-height">
      <!-- Frequency Chart -->
      <VCol cols="12" md="8">
        <VCard title="Tần suất tổ chức cuộc họp (năm 2026)">
          <template #append>
            <VBtn icon="tabler-dots-vertical" variant="plain" size="small" color="default" />
          </template>
          <VCardText>
            <VueApexCharts
              type="bar"
              height="300"
              :options="barChartConfig"
              :series="monthlyMeetingsSeries"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Status Donut Chart -->
      <VCol cols="12" md="4">
        <VCard title="Tỉ lệ trạng thái">
          <template #append>
            <VBtn icon="tabler-dots-vertical" variant="plain" size="small" color="default" />
          </template>
          <VCardText class="d-flex align-center justify-center">
            <VueApexCharts
              type="donut"
              height="330"
              :options="donutChartConfig"
              :series="statusDonutSeries"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Upcoming Meetings Table Row -->
    <VRow>
      <VCol cols="12">
        <VCard title="Các cuộc họp sắp diễn ra / Đang diễn ra" subtitle="Danh sách rút gọn 5 cuộc họp cần chú ý">
          <template #append>
            <VBtn variant="tonal" color="primary" size="small" to="/meetings">Xem tất cả</VBtn>
          </template>
          
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th class="text-uppercase text-caption font-weight-bold">Tên cuộc họp</th>
                <th class="text-uppercase text-caption font-weight-bold">Thời gian diễn ra</th>
                <th class="text-uppercase text-caption font-weight-bold">Địa điểm</th>
                <th class="text-uppercase text-caption font-weight-bold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="meetingsLoading">
                <td colspan="4" class="text-center py-4">
                  <VProgressCircular indeterminate color="primary" />
                </td>
              </tr>
              <tr v-else-if="upcomingMeetings.length === 0">
                <td colspan="4" class="text-center py-8 text-disabled">
                  <VIcon icon="tabler-folder-off" size="48" class="mb-2" />
                  <div>Không có cuộc họp nào sắp diễn ra</div>
                </td>
              </tr>
              <tr v-else v-for="meeting in upcomingMeetings" :key="meeting.id">
                <td class="font-weight-medium text-high-emphasis">
                  <div class="d-flex align-center gap-3">
                    <VAvatar color="primary" variant="tonal" size="32" rounded>
                      <VIcon icon="tabler-presentation" size="18" />
                    </VAvatar>
                    {{ meeting.title }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center gap-2">
                    <VIcon icon="tabler-clock" size="16" color="disabled" />
                    <span>{{ meeting.start_time ? new Date(meeting.start_time).toLocaleString('vi-VN') : 'Chưa xếp lịch' }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center gap-2">
                    <VIcon icon="tabler-map-pin" size="16" color="disabled" />
                    <span class="text-truncate" style="max-width: 200px">{{ meeting.location || 'Chưa xác định' }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <VChip
                    :color="resolveStatusVariant(meeting.status).color"
                    size="small"
                  >
                    {{ resolveStatusVariant(meeting.status).text }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.business-overview .v-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  box-shadow: 0 4px 18px -4px rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
