<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import MeetingFormModal from '@/modules/meetings/components/MeetingFormModal.vue'
import { deleteMeeting } from '@/modules/meetings/services/meetingService'
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
  { title: 'Người chủ trì', key: 'chairperson' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = await useApi(createUrl('/meetings', {
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
const completedCount = computed(() => items.value.filter(m => ['completed', 'cancelled'].includes(m.status)).length)

const deleteItem = async id => {
  if (confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
    await deleteMeeting(id)
    fetchItems()
  }
}

const resolveStatusLabel = status => {
  if (status === 'active' || status === 'in_progress') return 'Đang hoạt động'
  if (status === 'draft' || status === 'scheduled') return 'Không hoạt động'

  return 'Không hoạt động'
}

const resolveStatusColor = status => {
  if (status === 'active' || status === 'in_progress') return 'success'

  return 'secondary'
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

// Modal State
const isMeetingModalVisible = ref(false)
const activeMeetingId = ref(null)

const openAddMeetingModal = () => {
  activeMeetingId.value = null
  isMeetingModalVisible.value = true
}

const openEditMeetingModal = id => {
  activeMeetingId.value = id
  isMeetingModalVisible.value = true
}
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
        >
          Xuất Dữ Liệu
        </VBtn>
        <VBtn
          variant="outlined"
          prepend-icon="tabler-upload"
        >
          Nhập Dữ Liệu
        </VBtn>
        <VBtn
          v-if="$can('create', 'Meeting')"
          color="primary"
          prepend-icon="tabler-plus"
          @click="openAddMeetingModal"
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
            <div class="font-weight-medium">
              {{ item.start_at || 'Chưa xác định' }}
            </div>
            <div class="text-caption text-disabled">
              {{ item.location || 'Phòng họp trực tuyến' }}
            </div>
          </div>
        </template>

        <!-- Người chủ trì -->
        <template #item.chairperson="{ item }">
          {{ item.participants?.find(p => ['chairperson', 'chair'].includes(p.meeting_role))?.user?.name || 'N/A' }}
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
              <VIcon icon="tabler-eye" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Xem cuộc họp
              </VTooltip>
            </IconBtn>

            <IconBtn
              v-if="$can('update', 'Meeting')"
              @click="openEditMeetingModal(item.id)"
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

    <!-- Meeting Form Modal -->
    <MeetingFormModal
      v-model="isMeetingModalVisible"
      v-model:meeting-id="activeMeetingId"
      @saved="fetchItems"
    />
  </section>
</template>

<style scoped>
.stat-overview-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: box-shadow 0.2s;
}

.stat-overview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.stat-overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 48px;
  block-size: 48px;
  border-radius: 10px;
  flex-shrink: 0;
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
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-overview-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e1b4b;
  line-height: 1.2;
}

.stat-overview-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
