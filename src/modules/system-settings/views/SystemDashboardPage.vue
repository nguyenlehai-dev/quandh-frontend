<script setup>
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

// =======================
// MOCK DATA
// =======================

const systemStats = ref([
  {
    title: 'Số Người Dùng',
    count: '1,245',
    trend: '+12%',
    trendType: 'up',
    icon: 'tabler-users',
    color: 'primary',
  },
  {
    title: 'Số Tổ Chức',
    count: '34',
    trend: '+2',
    trendType: 'up',
    icon: 'tabler-building',
    color: 'info',
  },
  {
    title: 'Lượt Truy Cập (Hôm nay)',
    count: '8,430',
    trend: '+18.4%',
    trendType: 'up',
    icon: 'tabler-login',
    color: 'success',
  },
  {
    title: 'Cảnh Báo Lỗi',
    count: '3',
    trend: '-5',
    trendType: 'down', // down is actually good for errors
    icon: 'tabler-alert-triangle',
    color: 'error',
  },
])

const topUsers = ref([
  { avatar: null, name: 'Nguyễn Lê Hải', role: 'Super Admin', activityScore: 98, color: 'success' },
  { avatar: null, name: 'Trần Văn Biền', role: 'Chuyên viên điều hành', activityScore: 85, color: 'primary' },
  { avatar: null, name: 'Lê Thế Ngọc', role: 'Quản trị viên Tổ chức', activityScore: 72, color: 'info' },
  { avatar: null, name: 'Ngô Ngọc Quỳnh', role: 'Đại biểu', activityScore: 65, color: 'warning' },
  { avatar: null, name: 'Bùi Anh Tuấn', role: 'Thư ký cuộc họp', activityScore: 50, color: 'secondary' },
])

const recentLogs = ref([
  { time: '10 phút trước', user: 'Nguyễn Lê Hải', action: 'Tạo mới cuộc họp Giao ban', module: 'Cuộc họp', ip: '192.168.1.1' },
  { time: '1 tiếng trước', user: 'Lê Thế Ngọc', action: 'Thêm người dùng mới', module: 'Người dùng', ip: '113.167.24.5' },
  { time: '2 tiếng trước', user: 'Trần Văn Biền', action: 'Phân quyền Quản trị viên', module: 'Vai trò & Quyền hạn', ip: '10.0.0.8' },
  { time: 'Hôm qua', user: 'System', action: 'Sao lưu cơ sở dữ liệu tự động', module: 'Hệ thống', ip: 'localhost' },
  { time: 'Hôm qua', user: 'Bùi Anh Tuấn', action: 'Tải lên tài liệu QĐ123.pdf', module: 'Tài liệu', ip: '192.168.1.102' },
])

// =======================
// CHARTS CONFIGURATION
// =======================
const areaChartSeries = [{
  name: 'Lượt thao tác',
  data: [120, 340, 250, 480, 400, 680, 520, 800, 750, 1100, 950, 1400],
}]

const areaChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value
  
  return {
    chart: {
      type: 'area',
      parentHeightOffset: 0,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    colors: [currentTheme.colors.primary],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } },
    },
    yaxis: {
      labels: { style: { colors: 'rgba(0,0,0,0.6)', fontFamily: 'inherit' } },
    },
    grid: { show: true, strokeDashArray: 5, borderColor: 'rgba(0,0,0,0.1)' },
  }
})

const donutChartSeries = [45, 30, 15, 10]

const donutChartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value
  
  return {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['Tạo mới', 'Cập nhật', 'Xóa', 'Đăng nhập'],
    colors: [
      currentTheme.colors.primary,
      currentTheme.colors.success,
      currentTheme.colors.warning,
      currentTheme.colors.info,
    ],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { fontSize: '1rem', fontFamily: 'inherit' },
            value: { fontSize: '1.2rem', fontFamily: 'inherit', fontWeight: 'bold' },
            total: { show: true, fontSize: '1rem', label: 'Tổng thao tác' },
          },
        },
      },
    },
  }
})
</script>

<template>
  <div>
    <!-- Header -->
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
            Theo dõi tức thời tình trạng máy chủ và hoạt động người dùng trên hệ thống
          </div>
        </div>
      </div>
      <VBtn
        color="primary"
        prepend-icon="tabler-report"
      >
        Xuất Báo Cáo
      </VBtn>
    </div>

    <!-- Quick Stats Cards -->
    <VRow class="mb-4">
      <VCol
        v-for="stat in systemStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
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
              <div class="d-flex align-center gap-2">
                <span class="text-h4 font-weight-bold">{{ stat.count }}</span>
                <span 
                  class="text-body-2 font-weight-medium"
                  :class="stat.trendType === 'up' ? (stat.color === 'error' ? 'text-error' : 'text-success') : (stat.color === 'error' ? 'text-success' : 'text-error')"
                >
                  <VIcon
                    :icon="stat.trendType === 'up' ? 'tabler-arrow-up-right' : 'tabler-arrow-down-right'"
                    size="16"
                  />
                  {{ stat.trend }}
                </span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Charts Row -->
    <VRow class="mb-4 match-height">
      <!-- Activity Area Chart -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard title="Biểu đồ hoạt động hệ thống (Năm 2026)">
          <template #subtitle>
            Thống kê số lượng thao tác theo tháng của toàn bộ ứng dụng
          </template>
          <VCardText>
            <VueApexCharts
              type="area"
              height="320"
              :options="areaChartConfig"
              :series="areaChartSeries"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Distribution Donut Chart -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard title="Phân bổ Hành động">
          <template #subtitle>
            Tỉ lệ các loại thao tác API diễn ra
          </template>
          <VCardText class="d-flex align-center justify-center h-100">
            <VueApexCharts
              type="donut"
              height="300"
              :options="donutChartConfig"
              :series="donutChartSeries"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mb-4">
      <!-- Top Users -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          title="Top Tài Khoản Năng Nổ Nhất"
          subtitle="Theo dõi xếp hạng điểm hoạt động"
        >
          <VCardText>
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
                    color="secondary"
                    variant="tonal"
                    rounded
                  >
                    <span class="text-h6 font-weight-bold">{{ user.name.charAt(0) }}</span>
                  </VAvatar>
                </template>
                
                <VListItemTitle class="font-weight-medium mb-1">
                  {{ user.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-disabled">
                  {{ user.role }}
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex flex-column align-end">
                    <span class="text-body-2 font-weight-medium mb-1 text-high-emphasis">Điểm: {{ user.activityScore }}</span>
                    <VProgressLinear
                      :model-value="user.activityScore"
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
        </VCard>
      </VCol>

      <!-- Recent System Logs -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard
          title="Nhật ký truy vết Hệ thống Toàn cầu"
          subtitle="5 hoạt động mới nhất được hệ thống ghi nhận"
        >
          <template #append>
            <VBtn
              variant="tonal"
              color="primary"
              size="small"
              to="/activity-logs"
            >
              Xem tất cả Log
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
                    Module
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    Hành động
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold text-center">
                    Địa chỉ IP
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(log, idx) in recentLogs"
                  :key="idx"
                >
                  <td class="text-body-2 text-disabled whitespace-nowrap">
                    {{ log.time }}
                  </td>
                  <td class="font-weight-medium">
                    <div class="d-flex align-center gap-2">
                      <VAvatar
                        size="24"
                        color="primary"
                        variant="tonal"
                      >
                        <span class="text-xs">{{ log.user.substring(0,2) }}</span>
                      </VAvatar>
                      {{ log.user }}
                    </div>
                  </td>
                  <td>
                    <VChip
                      size="small"
                      color="secondary"
                      variant="tonal"
                    >
                      {{ log.module }}
                    </VChip>
                  </td>
                  <td
                    class="text-body-2 text-high-emphasis text-truncate"
                    style="max-width: 200px;"
                  >
                    {{ log.action }}
                  </td>
                  <td class="text-center text-body-2 text-disabled font-monospace">
                    {{ log.ip }}
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
