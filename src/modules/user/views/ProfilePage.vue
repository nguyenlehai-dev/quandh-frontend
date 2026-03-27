<script setup>
/**
 * Trang Hồ sơ cá nhân
 * Hiển thị thông tin người dùng đang đăng nhập với 4 tab:
 * 1. Thông tin cá nhân - Xem/sửa thông tin cá nhân
 * 2. Xu hướng hoạt động - Biểu đồ thống kê hoạt động
 * 3. Nhật ký hoạt động - Lịch sử hành động
 * 4. Thông báo - Cấu hình & xem thông báo
 */

import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

const activeTab = ref('info')
const isEditMode = ref(false)
const isPasswordDialogOpen = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

// Lấy user từ cookie auth
const userCookie = useCookie('userData')

const user = ref({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  avatar: null,
})

// Load từ cookie
watchEffect(() => {
  if (userCookie.value) {
    user.value = {
      name: userCookie.value.fullName || userCookie.value.name || '',
      email: userCookie.value.email || '',
      phone: userCookie.value.phone || '',
      position: userCookie.value.position || userCookie.value.role || '',
      department: userCookie.value.department || '',
      avatar: userCookie.value.avatar || null,
    }
  }
})

// Thông tin form chỉnh sửa
const editForm = ref({ ...user.value })

const startEdit = () => {
  editForm.value = { ...user.value }
  isEditMode.value = true
}

const cancelEdit = () => {
  isEditMode.value = false
}

const saveProfile = async () => {
  try {
    const { data } = await useApi('/user/profile', {
      method: 'PUT',
      body: {
        name: editForm.value.name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        position: editForm.value.position,
        department: editForm.value.department,
      },
    })

    if (data.value) {
      user.value = { ...editForm.value }

      // Update cookie
      const currentCookie = userCookie.value || {}

      userCookie.value = {
        ...currentCookie,
        fullName: editForm.value.name,
        name: editForm.value.name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        position: editForm.value.position,
        department: editForm.value.department,
      }

      isEditMode.value = false
      snackbar.value = { show: true, text: 'Cập nhật hồ sơ thành công!', color: 'success' }
    }
  }
  catch {
    snackbar.value = { show: true, text: 'Có lỗi xảy ra khi cập nhật.', color: 'error' }
  }
}

// Đổi mật khẩu
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    snackbar.value = { show: true, text: 'Mật khẩu mới không khớp!', color: 'error' }

    return
  }

  try {
    await useApi('/user/change-password', {
      method: 'PUT',
      body: {
        current_password: passwordForm.value.currentPassword,
        password: passwordForm.value.newPassword,
        password_confirmation: passwordForm.value.confirmPassword,
      },
    })

    isPasswordDialogOpen.value = false
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    snackbar.value = { show: true, text: 'Đổi mật khẩu thành công!', color: 'success' }
  }
  catch {
    snackbar.value = { show: true, text: 'Có lỗi xảy ra khi đổi mật khẩu.', color: 'error' }
  }
}

// Activity logs
const logsPage = ref(1)
const logsPerPage = ref(10)

const { data: logsData, isFetching: logsLoading } = await useApi(createUrl('/user/activity-logs', {
  query: {
    limit: logsPerPage,
    page: logsPage,
  },
}))

const logItems = computed(() => logsData.value?.data ?? [])
const totalLogs = computed(() => logsData.value?.meta?.total ?? 0)

// Chữ viết tắt từ tên
const getInitials = name => {
  if (!name) return '?'

  return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
}

// Dữ liệu thống kê thao tác (mock - hiển thị thống kê tổng quan)
const activityStats = [
  {
    title: 'Số lượt thao tác xem',
    value: '41,660',
    subtitle: 'Tổng số lượt thao tác xem',
    icon: 'tabler-eye',
    color: 'info',
  },
  {
    title: 'Số lượt thao tác tạo',
    value: '2,113',
    subtitle: 'Tổng số lượt thao tác tạo dữ liệu',
    icon: 'tabler-circle-plus',
    color: 'success',
  },
  {
    title: 'Số lượt thao tác cập nhật',
    value: '151',
    subtitle: 'Tổng số lượt cập nhật dữ liệu',
    icon: 'tabler-edit',
    color: 'warning',
  },
  {
    title: 'Số lượt thao tác xoá',
    value: '28',
    subtitle: 'Tổng số lượt xoá dữ liệu',
    icon: 'tabler-trash',
    color: 'error',
  },
]

// Cấu hình biểu đồ xu hướng (mock)
const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    tooltip: { shared: true, intersect: false },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: [currentTheme.primary],
    xaxis: {
      categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: `rgba(${variableTheme['on-background']}, ${variableTheme['high-emphasis-opacity']})` },
      },
    },
    yaxis: {
      labels: {
        style: { colors: `rgba(${variableTheme['on-background']}, ${variableTheme['high-emphasis-opacity']})` },
      },
    },
    grid: {
      borderColor: `rgba(${variableTheme['border-color']}, ${variableTheme['border-opacity']})`,
      strokeDashArray: 4,
      padding: { top: -20, bottom: -10, left: 20, right: 0 },
    },
  }
})

const chartSeries = [
  {
    name: 'Lượt thao tác',
    data: [150, 420, 310, 680, 520, 890, 740],
  },
]

// Tab items
const tabs = [
  { value: 'info', title: 'Thông tin cá nhân', icon: 'tabler-user' },
  { value: 'activity', title: 'Xu hướng hoạt động', icon: 'tabler-chart-line' },
  { value: 'logs', title: 'Nhật ký hoạt động', icon: 'tabler-history' },
  { value: 'notifications', title: 'Thông báo', icon: 'tabler-bell' },
]
</script>

<template>
  <div>
    <!-- Header -->
    <VRow>
      <VCol cols="12">
        <VCard class="profile-header-card">
          <div class="profile-header-bg" />
          <VCardText class="profile-header-content">
            <div class="d-flex flex-wrap align-end gap-4">
              <VAvatar
                size="100"
                rounded
                :color="!user.avatar ? 'primary' : undefined"
                :variant="!user.avatar ? 'tonal' : undefined"
                class="profile-avatar"
              >
                <VImg
                  v-if="user.avatar"
                  :src="user.avatar"
                />
                <span
                  v-else
                  class="text-3xl font-weight-bold"
                >
                  {{ getInitials(user.name) }}
                </span>
              </VAvatar>
              <div class="pb-2">
                <h4 class="text-h4 font-weight-bold">
                  {{ user.name || 'Chưa cập nhật' }}
                </h4>
                <div class="d-flex align-center gap-3 mt-1">
                  <VChip
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      icon="tabler-badge"
                      size="14"
                    />
                    {{ user.position || 'Nhân viên' }}
                  </VChip>
                  <span class="text-body-2 text-disabled">
                    <VIcon
                      icon="tabler-mail"
                      size="14"
                    />
                    {{ user.email }}
                  </span>
                </div>
              </div>
              <VSpacer />
              <VBtn
                v-if="!isEditMode && activeTab === 'info'"
                prepend-icon="tabler-pencil"
                @click="startEdit"
              >
                Chỉnh sửa
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Tabs -->
    <VRow>
      <VCol cols="12">
        <VTabs
          v-model="activeTab"
          class="v-tabs-pill"
        >
          <VTab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
          >
            <VIcon
              :icon="tab.icon"
              class="me-2"
              size="20"
            />
            {{ tab.title }}
          </VTab>
        </VTabs>
      </VCol>
    </VRow>

    <!-- Tab Content -->
    <VRow>
      <VCol cols="12">
        <VTabsWindow v-model="activeTab">
          <!-- Tab 1: Thông tin cá nhân -->
          <VTabsWindowItem value="info">
            <VRow>
              <VCol
                cols="12"
                md="4"
              >
                <!-- Info Card -->
                <VCard>
                  <VCardText class="text-center pt-8 pb-4">
                    <VAvatar
                      size="80"
                      rounded
                      :color="!user.avatar ? 'primary' : undefined"
                      :variant="!user.avatar ? 'tonal' : undefined"
                    >
                      <VImg
                        v-if="user.avatar"
                        :src="user.avatar"
                      />
                      <span
                        v-else
                        class="text-2xl font-weight-bold"
                      >
                        {{ getInitials(user.name) }}
                      </span>
                    </VAvatar>
                    <h5 class="text-h5 mt-3">
                      {{ user.name }}
                    </h5>
                    <VChip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="mt-2"
                    >
                      {{ user.position || 'Nhân viên' }}
                    </VChip>
                  </VCardText>

                  <VDivider />

                  <VCardText>
                    <VList class="card-list">
                      <VListItem>
                        <template #prepend>
                          <VIcon
                            icon="tabler-mail"
                            class="me-2"
                          />
                        </template>
                        <VListItemTitle class="text-body-2">
                          {{ user.email || 'Chưa cập nhật' }}
                        </VListItemTitle>
                        <VListItemSubtitle class="text-caption">
                          Email
                        </VListItemSubtitle>
                      </VListItem>
                      <VListItem>
                        <template #prepend>
                          <VIcon
                            icon="tabler-phone"
                            class="me-2"
                          />
                        </template>
                        <VListItemTitle class="text-body-2">
                          {{ user.phone || 'Chưa cập nhật' }}
                        </VListItemTitle>
                        <VListItemSubtitle class="text-caption">
                          Số điện thoại
                        </VListItemSubtitle>
                      </VListItem>
                      <VListItem>
                        <template #prepend>
                          <VIcon
                            icon="tabler-building"
                            class="me-2"
                          />
                        </template>
                        <VListItemTitle class="text-body-2">
                          {{ user.department || 'Chưa cập nhật' }}
                        </VListItemTitle>
                        <VListItemSubtitle class="text-caption">
                          Phòng ban
                        </VListItemSubtitle>
                      </VListItem>
                    </VList>
                  </VCardText>

                  <VDivider />

                  <VCardText class="text-center">
                    <VBtn
                      variant="tonal"
                      color="primary"
                      size="small"
                      prepend-icon="tabler-lock"
                      @click="isPasswordDialogOpen = true"
                    >
                      Đổi mật khẩu
                    </VBtn>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol
                cols="12"
                md="8"
              >
                <!-- Edit Form / View -->
                <VCard>
                  <VCardText>
                    <h5 class="text-h5 mb-4">
                      <VIcon
                        icon="tabler-id"
                        class="me-2"
                      />
                      {{ isEditMode ? 'Chỉnh sửa thông tin' : 'Thông tin chi tiết' }}
                    </h5>

                    <VDivider class="mb-4" />

                    <template v-if="isEditMode">
                      <VRow>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <AppTextField
                            v-model="editForm.name"
                            label="Họ và tên"
                            placeholder="Nhập họ và tên"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <AppTextField
                            v-model="editForm.email"
                            label="Email"
                            placeholder="Nhập email"
                            type="email"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <AppTextField
                            v-model="editForm.phone"
                            label="Số điện thoại"
                            placeholder="Nhập số điện thoại"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <AppTextField
                            v-model="editForm.position"
                            label="Chức vụ"
                            placeholder="Nhập chức vụ"
                          />
                        </VCol>
                        <VCol cols="12">
                          <AppTextField
                            v-model="editForm.department"
                            label="Phòng ban"
                            placeholder="Nhập phòng ban"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          class="d-flex gap-3"
                        >
                          <VBtn
                            color="primary"
                            prepend-icon="tabler-check"
                            @click="saveProfile"
                          >
                            Lưu thay đổi
                          </VBtn>
                          <VBtn
                            variant="tonal"
                            color="secondary"
                            @click="cancelEdit"
                          >
                            Hủy
                          </VBtn>
                        </VCol>
                      </VRow>
                    </template>

                    <template v-else>
                      <VRow>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div class="mb-4">
                            <div class="text-caption text-disabled mb-1">
                              Họ và tên
                            </div>
                            <div class="text-body-1 font-weight-medium">
                              {{ user.name || 'Chưa cập nhật' }}
                            </div>
                          </div>
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div class="mb-4">
                            <div class="text-caption text-disabled mb-1">
                              Email
                            </div>
                            <div class="text-body-1 font-weight-medium">
                              {{ user.email || 'Chưa cập nhật' }}
                            </div>
                          </div>
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div class="mb-4">
                            <div class="text-caption text-disabled mb-1">
                              Số điện thoại
                            </div>
                            <div class="text-body-1 font-weight-medium">
                              {{ user.phone || 'Chưa cập nhật' }}
                            </div>
                          </div>
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div class="mb-4">
                            <div class="text-caption text-disabled mb-1">
                              Chức vụ
                            </div>
                            <div class="text-body-1 font-weight-medium">
                              {{ user.position || 'Chưa cập nhật' }}
                            </div>
                          </div>
                        </VCol>
                        <VCol cols="12">
                          <div class="mb-4">
                            <div class="text-caption text-disabled mb-1">
                              Phòng ban
                            </div>
                            <div class="text-body-1 font-weight-medium">
                              {{ user.department || 'Chưa cập nhật' }}
                            </div>
                          </div>
                        </VCol>
                      </VRow>
                    </template>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VTabsWindowItem>

          <!-- Tab 2: Xu hướng hoạt động -->
          <VTabsWindowItem value="activity">
            <!-- Thống kê thẻ -->
            <VRow class="match-height mb-1">
              <VCol
                v-for="stat in activityStats"
                :key="stat.title"
                cols="12"
                sm="6"
                md="3"
              >
                <VCard>
                  <VCardText class="pb-2">
                    <div class="d-flex align-center justify-space-between mb-4">
                      <div class="text-caption text-disabled">
                        {{ stat.title }}
                      </div>
                      <VAvatar
                        :color="stat.color"
                        variant="tonal"
                        size="34"
                        rounded
                      >
                        <VIcon
                          :icon="stat.icon"
                          size="22"
                        />
                      </VAvatar>
                    </div>
                    <div class="text-h4 font-weight-bold mb-1">
                      {{ stat.value }}
                    </div>
                  </VCardText>
                  <VCardText class="pt-0 text-caption text-disabled">
                    {{ stat.subtitle }}
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>

            <!-- Biểu đồ xu hướng -->
            <VRow>
              <VCol cols="12">
                <VCard>
                  <VCardItem class="pb-0">
                    <VCardTitle>Biểu đồ hoạt động gần đây</VCardTitle>
                    <VCardSubtitle>Thống kê số lượng thao tác hệ thống trong 7 ngày qua</VCardSubtitle>
                  </VCardItem>
                  <VCardText>
                    <VueApexCharts
                      type="area"
                      height="300"
                      :options="chartOptions"
                      :series="chartSeries"
                    />
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VTabsWindowItem>

          <!-- Tab 3: Nhật ký hoạt động -->
          <VTabsWindowItem value="logs">
            <VCard>
              <VCardText>
                <h5 class="text-h5 mb-4">
                  <VIcon
                    icon="tabler-history"
                    class="me-2"
                  />
                  Nhật ký hoạt động cá nhân
                </h5>
              </VCardText>
              <VDivider />
              <VDataTableServer
                v-model:items-per-page="logsPerPage"
                v-model:page="logsPage"
                :items="logItems"
                :items-length="totalLogs"
                :headers="[
                  { title: 'STT', key: 'index', sortable: false, width: 60 },
                  { title: 'Hành động', key: 'description' },
                  { title: 'Đối tượng', key: 'subject_type' },
                  { title: 'Thời gian', key: 'created_at' },
                ]"
                :loading="logsLoading"
                class="text-no-wrap"
              >
                <template #item.index="{ index }">
                  {{ (logsPage - 1) * logsPerPage + index + 1 }}
                </template>

                <template #no-data>
                  <div class="text-center pa-4 text-disabled">
                    <VIcon
                      icon="tabler-history-off"
                      size="48"
                      class="mb-2"
                    />
                    <div>Chưa có nhật ký hoạt động nào</div>
                  </div>
                </template>

                <template #bottom>
                  <TablePagination
                    v-model:page="logsPage"
                    :items-per-page="logsPerPage"
                    :total-items="totalLogs"
                  />
                </template>
              </VDataTableServer>
            </VCard>
          </VTabsWindowItem>

          <!-- Tab 4: Thông báo -->
          <VTabsWindowItem value="notifications">
            <VCard>
              <VCardText>
                <h5 class="text-h5 mb-4">
                  <VIcon
                    icon="tabler-bell"
                    class="me-2"
                  />
                  Cài đặt thông báo
                </h5>
                <VDivider class="mb-4" />

                <VList>
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="tabler-mail" />
                    </template>
                    <VListItemTitle>Thông báo qua email</VListItemTitle>
                    <VListItemSubtitle>Nhận thông báo khi có cuộc họp mới hoặc thay đổi lịch họp</VListItemSubtitle>
                    <template #append>
                      <VSwitch
                        :model-value="true"
                        color="primary"
                      />
                    </template>
                  </VListItem>

                  <VDivider class="my-2" />

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="tabler-bell-ringing" />
                    </template>
                    <VListItemTitle>Thông báo trên hệ thống</VListItemTitle>
                    <VListItemSubtitle>Nhận thông báo realtime trên giao diện</VListItemSubtitle>
                    <template #append>
                      <VSwitch
                        :model-value="true"
                        color="primary"
                      />
                    </template>
                  </VListItem>

                  <VDivider class="my-2" />

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="tabler-calendar-event" />
                    </template>
                    <VListItemTitle>Nhắc nhở cuộc họp</VListItemTitle>
                    <VListItemSubtitle>Nhận thông báo trước 15 phút khi cuộc họp bắt đầu</VListItemSubtitle>
                    <template #append>
                      <VSwitch
                        :model-value="true"
                        color="primary"
                      />
                    </template>
                  </VListItem>

                  <VDivider class="my-2" />

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="tabler-checkbox" />
                    </template>
                    <VListItemTitle>Thông báo biểu quyết</VListItemTitle>
                    <VListItemSubtitle>Nhận thông báo khi có yêu cầu biểu quyết mới</VListItemSubtitle>
                    <template #append>
                      <VSwitch
                        :model-value="true"
                        color="primary"
                      />
                    </template>
                  </VListItem>

                  <VDivider class="my-2" />

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="tabler-file-text" />
                    </template>
                    <VListItemTitle>Thông báo tài liệu</VListItemTitle>
                    <VListItemSubtitle>Nhận thông báo khi có tài liệu mới được chia sẻ</VListItemSubtitle>
                    <template #append>
                      <VSwitch
                        :model-value="false"
                        color="primary"
                      />
                    </template>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VTabsWindowItem>
        </VTabsWindow>
      </VCol>
    </VRow>

    <!-- Dialog đổi mật khẩu -->
    <VDialog
      v-model="isPasswordDialogOpen"
      max-width="500"
    >
      <VCard title="Đổi mật khẩu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="passwordForm.currentPassword"
                label="Mật khẩu hiện tại"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="passwordForm.newPassword"
                label="Mật khẩu mới"
                type="password"
                placeholder="Nhập mật khẩu mới"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="passwordForm.confirmPassword"
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            @click="isPasswordDialogOpen = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="primary"
            @click="changePassword"
          >
            Đổi mật khẩu
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top end"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.profile-header-card {
  overflow: hidden;
}

.profile-header-bg {
  block-size: 120px;
  background: linear-gradient(135deg, #00695c 0%, #00897b 40%, #26a69a 100%);
}

.profile-header-content {
  position: relative;
  margin-block-start: -50px;
}

.profile-avatar {
  border: 4px solid rgb(var(--v-theme-surface));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-list {
  --v-card-list-gap: 0.25rem;
}
</style>
