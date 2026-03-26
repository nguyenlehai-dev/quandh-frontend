<script setup>
import { deleteMeeting } from '@/modules/meetings/services/meetingService'

const { t } = useI18n()

// Filters
const searchQuery = ref('')
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
  { title: 'Tên Cuộc họp', key: 'title' },
  { title: 'Phòng họp', key: 'location' },
  { title: 'Thời gian bắt đầu', key: 'start_at' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = await useApi(createUrl('/meetings', {
  query: {
    search: computed(() => searchQuery.value || undefined),
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

const deleteItem = async id => {
  if (confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
    await deleteMeeting(id)
    fetchItems()
  }
}
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Cuộc họp
        </h5>
        <VSpacer />
        <AppTextField 
          v-model="searchQuery" 
          placeholder="Tìm kiếm..." 
          density="compact" 
          style="max-inline-size: 250px;" 
        />
        <VBtn 
          v-if="$can('create', 'Meeting')"
          prepend-icon="tabler-plus"
          :to="{ name: 'meetings-edit' }"
        >
          Thêm mới
        </VBtn>
      </VCardText>
      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
        ]"
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
          <RouterLink
            :to="{ name: 'meetings-edit', params: { id: item.id } }"
            class="font-weight-medium text-link"
          >
            {{ item.title }}
          </RouterLink>
        </template>
        
        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.status === 'active' || item.status === 'in_progress' ? 'success' : (item.status === 'draft' || item.status === 'scheduled' ? 'warning' : 'secondary')"
            label
          >
            {{ item.status === 'active' || item.status === 'in_progress' ? 'Đang diễn ra' : (item.status === 'draft' || item.status === 'scheduled' ? 'Chưa bắt đầu' : 'Đã kết thúc') }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn
            v-if="$can('update', 'Meeting')"
            size="small"
            variant="tonal"
            color="success"
            class="me-2"
            prepend-icon="tabler-player-play-filled"
            :to="{ name: 'meetings-live-controller', params: { id: item.id } }"
          >
            Điều hành
          </VBtn>

          <IconBtn
            v-if="$can('update', 'Meeting')"
            :to="{ name: 'meetings-edit', params: { id: item.id } }"
          >
            <VIcon icon="tabler-pencil" />
          </IconBtn>

          <IconBtn
            v-if="$can('delete', 'Meeting')"
            @click="deleteItem(item.id)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </section>
</template>
