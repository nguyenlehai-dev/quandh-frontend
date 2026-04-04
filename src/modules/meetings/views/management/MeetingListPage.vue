<script setup>
/* eslint-disable camelcase, padding-line-between-statements */
import '@/modules/meetings/assets/meeting-styles.css'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { changeMeetingStatus, deleteMeeting, exportMeetings, fetchMeetingTypes } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, onMounted, ref } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const meetingTypeFilter = ref(null)
const startFromFilter = ref('')
const startToFilter = ref('')
const endFromFilter = ref('')
const endToFilter = ref('')
const meetingTypeOptions = ref([])
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const isExporting = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xac nhan', confirmColor: 'primary', action: null })

const { snackbar, showSuccess, showError } = useActionFeedback()

const headers = [
  { title: '', key: 'data-table-select', sortable: false, width: 40 },
  { title: 'Ten cuoc hop', key: 'title' },
  { title: 'Thoi gian & Dia diem', key: 'start_at' },
  { title: 'Loai cuoc hop', key: 'meeting_type_name', sortable: false },
  { title: 'Nguoi tao', key: 'created_by' },
  { title: 'Trang thai', key: 'status' },
  { title: 'Thao tac', key: 'actions', sortable: false },
]

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const commonQuery = {
  search: computed(() => searchQuery.value || undefined),
  status: computed(() => statusFilter.value || undefined),
  meeting_type_id: computed(() => meetingTypeFilter.value || undefined),
  start_from: computed(() => startFromFilter.value || undefined),
  start_to: computed(() => startToFilter.value || undefined),
  end_from: computed(() => endFromFilter.value || undefined),
  end_to: computed(() => endToFilter.value || undefined),
  sort_by: computed(() => sortBy.value || undefined),
  sort_order: computed(() => orderBy.value || undefined),
}

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meetings', {
  query: {
    ...commonQuery,
    limit: itemsPerPage,
    page,
  },
}))

const { data: statsData, execute: fetchStats, isFetching: isStatsLoading } = useApi(createUrl('/meetings/stats', {
  query: commonQuery,
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)
const activeCount = computed(() => statsData.value?.active ?? 0)
const completedCount = computed(() => statsData.value?.completed ?? 0)

onMounted(async () => {
  try {
    const response = await fetchMeetingTypes({ limit: 100 })
    const data = response.data?.data || response.data || []
    meetingTypeOptions.value = data.map(item => ({ title: item.name, value: item.id }))
  } catch (error) {
    console.error('Failed to load meeting types', error)
  }
})

const resolveStatusLabel = status => {
  if (status === 'active') return 'Kich hoat'
  if (status === 'in_progress') return 'Dang hop'
  if (status === 'draft') return 'Nhap'
  if (status === 'completed') return 'Da ket thuc'

  return 'Nhap'
}

const resolveStatusColor = status => {
  if (status === 'active') return 'info'
  if (status === 'in_progress') return 'warning'
  if (status === 'completed') return 'success'

  return 'secondary'
}

const meetingStatusOptions = [
  { title: 'Nhap', value: 'draft' },
  { title: 'Kich hoat', value: 'active' },
  { title: 'Dang hop', value: 'in_progress' },
  { title: 'Da ket thuc', value: 'completed' },
]

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const refreshData = () => {
  fetchItems()
  fetchStats()
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return

  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  }
  catch (error) {
    showError(error, 'Khong the thuc hien thao tac nay.')
  }
  finally {
    isConfirming.value = false
  }
}

const deleteItem = id => {
  openConfirmDialog({
    title: 'Xoa cuoc hop',
    message: 'Ban co chac chan muon xoa cuoc hop nay khong?',
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeeting(id)
      showSuccess('Xoa cuoc hop thanh cong.')
      refreshData()
    },
  })
}

const requestStatusChange = (item, nextStatus) => {
  openConfirmDialog({
    title: 'Doi trang thai cuoc hop',
    message: `Ban co chac chan muon chuyen "${item.title}" sang trang thai "${resolveStatusLabel(nextStatus)}" khong?`,
    confirmText: 'Doi trang thai',
    confirmColor: 'warning',
    action: async () => {
      await changeMeetingStatus(item.id, nextStatus)
      showSuccess('Doi trang thai cuoc hop thanh cong.')
      refreshData()
    },
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  meetingTypeFilter.value = null
  startFromFilter.value = ''
  startToFilter.value = ''
  endFromFilter.value = ''
  endToFilter.value = ''
}

const exportData = async () => {
  isExporting.value = true
  try {
    const response = await exportMeetings({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      meeting_type_id: meetingTypeFilter.value || undefined,
      start_from: startFromFilter.value || undefined,
      start_to: startToFilter.value || undefined,
      end_from: endFromFilter.value || undefined,
      end_to: endToFilter.value || undefined,
      sort_by: sortBy.value || undefined,
      sort_order: orderBy.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(response, 'danh-sach-cuoc-hop.xlsx')
  }
  catch (error) {
    showError(error, 'Khong the xuat du lieu cuoc hop.')
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <section>
    <VRow class="mb-6">
      <VCol cols="12" md="4">
        <div class="stat-overview-card">
          <div class="stat-overview-icon green">
            <VIcon icon="tabler-calendar-event" size="24" />
          </div>
          <div>
            <div class="stat-overview-label">Tong cuoc hop</div>
            <div class="stat-overview-value">{{ totalItems }}</div>
            <div class="stat-overview-desc">Tong so cuoc hop trong he thong</div>
          </div>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <div class="stat-overview-card">
          <div class="stat-overview-icon blue">
            <VIcon icon="tabler-player-play" size="24" />
          </div>
          <div>
            <div class="stat-overview-label">Dang dien ra / Sap toi</div>
            <div class="stat-overview-value">{{ isStatsLoading ? '...' : activeCount }}</div>
            <div class="stat-overview-desc">Cuoc hop dang hoac sap dien ra</div>
          </div>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <div class="stat-overview-card">
          <div class="stat-overview-icon gray">
            <VIcon icon="tabler-circle-check" size="24" />
          </div>
          <div>
            <div class="stat-overview-label">Da ket thuc</div>
            <div class="stat-overview-value">{{ isStatsLoading ? '...' : completedCount }}</div>
            <div class="stat-overview-desc">Cuoc hop da ket thuc</div>
          </div>
        </div>
      </VCol>
    </VRow>

    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon icon="tabler-filter" class="section-icon" />
          Bo loc
        </div>
        <VBtn variant="outlined" size="small" prepend-icon="tabler-rotate" @click="resetFilters">
          Dat lai
        </VBtn>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol cols="12" md="4">
            <div class="text-body-2 font-weight-medium mb-1">Tim kiem</div>
            <AppTextField v-model="searchQuery" placeholder="Tim kiem cuoc hop" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <div class="text-body-2 font-weight-medium mb-1">Trang thai</div>
            <AppSelect
              v-model="statusFilter"
              :items="[
                { title: 'Tat ca trang thai', value: '' },
                { title: 'Dang hoat dong', value: 'active' },
                { title: 'Chua bat dau', value: 'draft' },
                { title: 'Da ket thuc', value: 'completed' },
              ]"
              density="compact"
              placeholder="Tat ca trang thai"
            />
          </VCol>
          <VCol cols="12" md="4">
            <div class="text-body-2 font-weight-medium mb-1">Loai cuoc hop</div>
            <AppSelect v-model="meetingTypeFilter" :items="meetingTypeOptions" density="compact" placeholder="Tat ca loai cuoc hop" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 font-weight-medium mb-1">Bat dau tu</div>
            <AppTextField v-model="startFromFilter" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 font-weight-medium mb-1">Bat dau den</div>
            <AppTextField v-model="startToFilter" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 font-weight-medium mb-1">Ket thuc tu</div>
            <AppTextField v-model="endFromFilter" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 font-weight-medium mb-1">Ket thuc den</div>
            <AppTextField v-model="endToFilter" type="datetime-local" density="compact" />
          </VCol>
        </VRow>
      </div>
    </div>

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
        <VBtn variant="outlined" prepend-icon="tabler-download" :loading="isExporting" @click="exportData">
          Xuat du lieu
        </VBtn>
        <VTooltip location="top">
          <template #activator="{ props }">
            <span v-bind="props">
              <VBtn variant="outlined" prepend-icon="tabler-upload" disabled>
                Nhap du lieu
              </VBtn>
            </span>
          </template>
          Tinh nang dang duoc phat trien
        </VTooltip>
        <VBtn v-if="$can('store', 'Meeting')" color="primary" prepend-icon="tabler-plus" :to="{ name: 'meetings-create' }">
          Them cuoc hop
        </VBtn>
      </div>
    </div>

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
        <template #item.title="{ item }">
          <div class="font-weight-bold text-uppercase">{{ item.title }}</div>
        </template>

        <template #item.start_at="{ item }">
          <div>
            <div class="d-flex align-center gap-1">
              <VIcon icon="tabler-clock" size="14" color="primary" />
              <span class="font-weight-medium">{{ item.start_at || 'Chua xac dinh' }}</span>
            </div>
            <div class="d-flex align-center gap-1 mt-1">
              <VIcon icon="tabler-map-pin" size="14" color="secondary" />
              <span class="text-caption text-disabled">{{ item.location || 'Phong hop truc tuyen' }}</span>
            </div>
          </div>
        </template>

        <template #item.meeting_type_name="{ item }">
          {{ item.meeting_type?.name || 'N/A' }}
        </template>

        <template #item.created_by="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar size="28" color="primary" variant="tonal">
              <span class="text-caption font-weight-bold">{{ (item.created_by || 'N/A').charAt(0).toUpperCase() }}</span>
            </VAvatar>
            <span class="font-weight-medium">{{ item.created_by || 'N/A' }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="d-flex align-center gap-2">
            <VSwitch :model-value="['active', 'in_progress'].includes(item.status)" color="success" density="compact" readonly hide-details />
            <VChip size="small" :color="resolveStatusColor(item.status)" variant="tonal">
              {{ resolveStatusLabel(item.status) }}
            </VChip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn v-if="$can('update', 'Meeting')" :to="{ name: 'meetings-live-controller', params: { id: item.id } }">
              <VIcon icon="tabler-player-play" />
              <VTooltip activator="parent" location="top">Dieu hanh cuoc hop</VTooltip>
            </IconBtn>

            <IconBtn v-else-if="$can('show', 'Meeting')" :to="{ name: 'meetings-edit', params: { id: item.id } }">
              <VIcon icon="tabler-eye" />
              <VTooltip activator="parent" location="top">Xem chi tiet</VTooltip>
            </IconBtn>

            <IconBtn v-if="$can('update', 'Meeting')" :to="{ name: 'meetings-edit', params: { id: item.id } }">
              <VIcon icon="tabler-pencil" />
              <VTooltip activator="parent" location="top">Chinh sua</VTooltip>
            </IconBtn>

            <VMenu>
              <template #activator="{ props }">
                <IconBtn v-bind="props">
                  <VIcon icon="tabler-dots-vertical" />
                </IconBtn>
              </template>
              <VList density="compact">
                <VListSubheader>Doi trang thai</VListSubheader>
                <VListItem
                  v-for="statusOption in meetingStatusOptions.filter(option => option.value !== item.status)"
                  :key="statusOption.value"
                  @click="requestStatusChange(item, statusOption.value)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-refresh" size="18" color="warning" />
                  </template>
                  <VListItemTitle>{{ statusOption.title }}</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem v-if="$can('destroy', 'Meeting')" @click="deleteItem(item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" size="18" color="error" />
                  </template>
                  <VListItemTitle class="text-error">Xoa</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              Hien thi {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} den {{ Math.min(page * itemsPerPage, totalItems) }} tren tong {{ totalItems }} cuoc hop
            </span>
            <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalItems" />
          </div>
        </template>
      </VDataTableServer>
    </div>

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar v-model="snackbar.show" :message="snackbar.message" :color="snackbar.color" />
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
