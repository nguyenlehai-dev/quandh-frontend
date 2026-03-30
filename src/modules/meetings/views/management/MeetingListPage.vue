<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import { deleteMeeting, exportMeetings } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const { t } = useI18n()

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

// Compute table options
const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Table headers
const headers = [
  { title: '', key: 'data-table-select', sortable: false, width: 40 },
  { title: 'Tên cuộc họp', key: 'title' },
  { title: 'Thời gian & Địa điểm', key: 'start_at' },
  { title: 'Người tạo', key: 'created_by' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meetings', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => statusFilter.value || undefined),
    limit: itemsPerPage,
    page,
    // eslint-disable-next-line camelcase
    sort_by: computed(() => sortBy.value || undefined),
    // eslint-disable-next-line camelcase
    sort_order: computed(() => orderBy.value || undefined),
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

// Stats
const activeCount = computed(() => items.value.filter(m => ['active', 'in_progress'].includes(m.status)).length)
const completedCount = computed(() => items.value.filter(m => m.status === 'completed').length)

const deleteItem = async id => {
  console.log('deleteItem triggered with id:', id)
  if (window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
    try {
      console.log('Calling deleteMeeting API...')
      await deleteMeeting(id)
      console.log('deleteMeeting successful, refetching...')
      fetchItems()
    } catch (error) {
      console.error('Lỗi khi xóa cuộc họp:', error)

      const msg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra'
      
      window.alert('Không thể xóa: ' + msg)
    }
  }
}

const resolveStatusLabel = status => {
  if (status === 'active') return 'Kích hoạt'
  if (status === 'in_progress') return 'Đang họp'
  if (status === 'draft') return 'Nháp'
  if (status === 'completed') return 'Đã kết thúc'

  return 'Nháp'
}

const resolveStatusColor = status => {
  if (status === 'active') return 'info'
  if (status === 'in_progress') return 'warning'
  if (status === 'completed') return 'success'

  return 'secondary'
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const isExporting = ref(false)

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportMeetings({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'danh-sach-cuoc-hop.xlsx')
  } catch (error) {
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}

// No modal state needed anymore
</script>

<template>
  <section>
    <!-- Stats Cards -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        md="4"
      >
        <div class="stat-overview-card">
          <div class="stat-overview-icon green">
            <VIcon
              icon="tabler-calendar-event"
              size="24"
            />
          </div>
          <div>
            <div class="stat-overview-label">
              Tổng cuộc họp
            </div>
            <div class="stat-overview-value">
              {{ totalItems }}
            </div>
            <div class="stat-overview-desc">
              Tổng số cuộc họp trong hệ thống
            </div>
          </div>
        </div>
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <div class="stat-overview-card">
          <div class="stat-overview-icon blue">
            <VIcon
              icon="tabler-player-play"
              size="24"
            />
          </div>
          <div>
            <div class="stat-overview-label">
              Đang diễn ra / Sắp tới
            </div>
            <div class="stat-overview-value">
              {{ activeCount }}
            </div>
            <div class="stat-overview-desc">
              Cuộc họp đang hoặc chuẩn bị diễn ra
            </div>
          </div>
        </div>
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <div class="stat-overview-card">
          <div class="stat-overview-icon gray">
            <VIcon
              icon="tabler-circle-check"
              size="24"
            />
          </div>
          <div>
            <div class="stat-overview-label">
              Đã đóng / Hủy
            </div>
            <div class="stat-overview-value">
              {{ completedCount }}
            </div>
            <div class="stat-overview-desc">
              Cuộc họp đã kết thúc hoặc bị hủy
            </div>
          </div>
        </div>
      </VCol>
    </VRow>

    <!-- Filter Section -->
    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-filter"
            class="section-icon"
          />
          Bộ lọc
        </div>
        <VBtn
          variant="outlined"
          size="small"
          prepend-icon="tabler-rotate"
          @click="resetFilters"
        >
          Đặt Lại
        </VBtn>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Tìm kiếm
            </div>
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm kiếm cuộc họp"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Trạng thái
            </div>
            <AppSelect
              v-model="statusFilter"
              :items="[
                { title: 'Tất cả trạng thái', value: '' },
                { title: 'Đang hoạt động', value: 'active' },
                { title: 'Chưa bắt đầu', value: 'draft' },
                { title: 'Đã kết thúc', value: 'completed' },
              ]"
              density="compact"
              placeholder="Tất cả trạng thái"
            />
          </VCol>
        </VRow>
      </div>
    </div>

    <!-- Table Actions Bar -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-4">
      <div class="d-flex align-center gap-3">
        <AppSelect
          v-model="itemsPerPage"
          :items="[
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 },
          ]"
          density="compact"
          style="max-inline-size: 80px;"
        />
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          prepend-icon="tabler-download"
          :loading="isExporting"
          @click="exportData"
        >
          Xuất Dữ Liệu
        </VBtn>
        <VTooltip location="top">
          <template #activator="{ props }">
            <span v-bind="props">
              <VBtn
                variant="outlined"
                prepend-icon="tabler-upload"
                disabled
              >
                Nhập Dữ Liệu
              </VBtn>
            </span>
          </template>
          Tính năng đang được phát triển
        </VTooltip>
        <VBtn
          v-if="$can('create', 'Meeting')"
          color="primary"
          prepend-icon="tabler-plus"
          :to="{ name: 'meetings-create' }"
        >
          Thêm Cuộc Họp
        </VBtn>
      </div>
    </div>

    <!-- Data Table -->
    <div class="meeting-section-card">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- Tên cuộc họp -->
        <template #item.title="{ item }">
          <div class="font-weight-bold text-uppercase">
            {{ item.title }}
          </div>
        </template>

        <!-- Thời gian & Địa điểm -->
        <template #item.start_at="{ item }">
          <div>
            <div class="d-flex align-center gap-1">
              <VIcon
                icon="tabler-clock"
                size="14"
                color="primary"
              />
              <span class="font-weight-medium">{{ item.start_at || 'Chưa xác định' }}</span>
            </div>
            <div class="d-flex align-center gap-1 mt-1">
              <VIcon
                icon="tabler-map-pin"
                size="14"
                color="secondary"
              />
              <span class="text-caption text-disabled">{{ item.location || 'Phòng họp trực tuyến' }}</span>
            </div>
          </div>
        </template>

        <!-- Người tạo -->
        <template #item.created_by="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar
              size="28"
              color="primary"
              variant="tonal"
            >
              <span class="text-caption font-weight-bold">{{ (item.created_by || 'N/A').charAt(0).toUpperCase() }}</span>
            </VAvatar>
            <span class="font-weight-medium">{{ item.created_by || 'N/A' }}</span>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <div class="d-flex align-center gap-2">
            <VSwitch
              :model-value="['active', 'in_progress'].includes(item.status)"
              color="success"
              density="compact"
              readonly
              hide-details
            />
            <VChip
              size="small"
              :color="resolveStatusColor(item.status)"
              variant="tonal"
            >
              {{ resolveStatusLabel(item.status) }}
            </VChip>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="$can('update', 'Meeting')"
              :to="{ name: 'meetings-live-controller', params: { id: item.id } }"
            >
              <VIcon icon="tabler-player-play" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Điều hành cuộc họp
              </VTooltip>
            </IconBtn>

            <IconBtn
              v-else-if="$can('read', 'Meeting')"
              :to="{ name: 'meetings-participant-details', params: { id: item.id } }"
            >
              <VIcon icon="tabler-eye" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Xem chi tiết
              </VTooltip>
            </IconBtn>

            <IconBtn
              v-if="$can('update', 'Meeting')"
              :to="{ name: 'meetings-edit', params: { id: item.id } }"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Chỉnh sửa
              </VTooltip>
            </IconBtn>

            <VMenu>
              <template #activator="{ props }">
                <IconBtn v-bind="props">
                  <VIcon icon="tabler-dots-vertical" />
                </IconBtn>
              </template>
              <VList density="compact">
                <VListItem
                  v-if="$can('delete', 'Meeting')"
                  @click="deleteItem(item.id)"
                >
                  <template #prepend>
                    <VIcon
                      icon="tabler-trash"
                      size="18"
                      color="error"
                    />
                  </template>
                  <VListItemTitle class="text-error">
                    Xóa
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} đến {{ Math.min(page * itemsPerPage, totalItems) }} trên tổng {{ totalItems }} cuộc họp
            </span>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalItems"
            />
          </div>
        </template>
      </VDataTableServer>
    </div>
  </section>
</template>

<style scoped>
.stat-overview-card {
  display: flex;
  align-items: flex-start;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  gap: 16px;
  padding-block: 20px;
  padding-inline: 24px;
  transition: box-shadow 0.2s;
}

.stat-overview-card:hover {
  box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
}

.stat-overview-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  block-size: 48px;
  inline-size: 48px;
}

.stat-overview-icon.green {
  background: #ecfdf5;
  color: #10b981;
}

.stat-overview-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-overview-icon.gray {
  background: #f3f4f6;
  color: #6b7280;
}

.stat-overview-label {
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-overview-value {
  color: #1e1b4b;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-overview-desc {
  color: #9ca3af;
  font-size: 0.75rem;
}
</style>
