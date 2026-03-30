<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import { fetchMeetingTypes, exportDocuments } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'

const searchQuery = ref('')
const meetingTypeId = ref(null)
const meetingTypes = ref([])
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

onMounted(async () => {
  try {
    const res = await fetchMeetingTypes({ limit: 100 })
    const data = res.data?.data || res.data || []

    meetingTypes.value = data.map(i => ({ value: i.id, title: i.name }))
  } catch (err) {
    console.error('Failed to load meeting types', err)
  }
})

const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'Tên tài liệu', key: 'title' },
  { title: 'Loại tài liệu', key: 'document_type_name' },
  { title: 'Cuộc họp', key: 'meeting_title' },
  { title: 'Người đăng', key: 'created_by' },
  { title: 'Ngày đăng', key: 'created_at' },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const { data: requestData, isFetching: isLoading } = await useApi(createUrl('/meetings/all-documents', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    meeting_type_id: computed(() => meetingTypeId.value || undefined),
    limit: itemsPerPage,
    page,
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

const isExporting = ref(false)

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportDocuments({
      search: searchQuery.value || undefined,
      meeting_type_id: meetingTypeId.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'danh-sach-tai-lieu.xlsx')
  } catch (error) {
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <section>
    <!-- Filter Section -->
    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-file-text"
            class="section-icon"
          />
          Danh sách Tài liệu
        </div>
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
              placeholder="Tìm kiếm tài liệu..."
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Loại cuộc họp
            </div>
            <AppSelect
              v-model="meetingTypeId"
              :items="meetingTypes"
              placeholder="Tất cả loại cuộc họp"
              density="compact"
              clearable
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
      </div>
    </div>

    <!-- Data Table -->
    <div class="meeting-section-card">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #item.document_type_name="{ item }">
          {{ item.document_type?.name || '---' }}
        </template>

        <template #item.created_by="{ item }">
          {{ item.created_by || '---' }}
        </template>

        <template #item.meeting_title="{ item }">
          <span
            v-if="item.meeting_title"
            class="font-weight-medium text-primary"
          >
            {{ item.meeting_title }}
          </span>
          <span
            v-else
            class="text-disabled"
          >
            ---
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="item.meeting_id"
              :to="{ name: 'meetings-participant-details', params: { id: item.meeting_id }, query: { tab: 'documents' } }"
            >
              <VIcon icon="tabler-eye" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Vào cuộc họp chứa tài liệu này
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <!-- removed old slots -->

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} đến {{ Math.min(page * itemsPerPage, totalItems) }} trên tổng {{ totalItems }} bản ghi
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
