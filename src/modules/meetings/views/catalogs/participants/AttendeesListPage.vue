<script setup>
import { exportAttendees } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import '@/modules/meetings/assets/meeting-styles.css'

const { t } = useI18n()

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const headers = computed(() => [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: t('meetings.meetings.list_pages.attendees.full_name'), key: 'user_name' },
  { title: t('meetings.meetings.list_pages.attendees.position'), key: 'position' },
  { title: t('meetings.meetings.list_pages.attendees.email'), key: 'user_email' },
  { title: t('meetings.meetings.list_pages.attendees.meeting'), key: 'meeting_title' },
  { title: t('meetings.meetings.list_pages.common.actions'), key: 'actions', sortable: false },
])

const { data: requestData, isFetching: isLoading } = await useApi(createUrl('/meetings/all-participants', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    sort_by: computed(() => sortBy.value || undefined),
    sort_order: computed(() => orderBy.value || undefined),
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
    const res = await exportAttendees({
      search: searchQuery.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'nguoi-du-hop.xlsx')
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
            icon="tabler-users"
            class="section-icon"
          />
          {{ t('meetings.meetings.list_pages.attendees.title') }}
        </div>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              {{ t('meetings.meetings.list_pages.common.search') }}
            </div>
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('meetings.meetings.list_pages.attendees.search_placeholder')"
              density="compact"
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
          {{ t('meetings.meetings.list_pages.common.export') }}
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

        <template #item.user_name="{ item }">
          <span class="font-weight-medium text-high-emphasis">
            {{ item.user_name || t('meetings.meetings.list_pages.common.empty_value') }}
          </span>
        </template>

        <template #item.user_email="{ item }">
          {{ item.user_email || t('meetings.meetings.list_pages.common.empty_value') }}
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
            {{ t('meetings.meetings.list_pages.common.empty_value') }}
          </span>
        </template>

        <template #item.type="{ item }">
          <VChip
            size="small"
            :color="item.type === 'internal' ? 'primary' : 'info'"
            variant="tonal"
          >
            {{ item.type === 'internal' ? 'Nội bộ' : 'Khách mời' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="item.meeting_id"
              :to="{ name: 'meetings-edit', params: { id: item.meeting_id }, query: { tab: 'attendees' } }"
            >
              <VIcon icon="tabler-eye" />
              <VTooltip
                activator="parent"
                location="top"
              >
                {{ t('meetings.meetings.list_pages.attendees.open_related_meeting') }}
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              {{ t('meetings.meetings.list_pages.common.showing_summary', { from: Math.min((page - 1) * itemsPerPage + 1, totalItems), to: Math.min(page * itemsPerPage, totalItems), total: totalItems }) }}
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
