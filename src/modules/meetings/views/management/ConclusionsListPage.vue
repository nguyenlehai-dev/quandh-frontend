<script setup>
/* eslint-disable camelcase */

import '@/modules/meetings/assets/meeting-styles.css'
import { fetchMeetingTypes, exportConclusions } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'

const { t } = useI18n()

const searchQuery = ref('')
const meetingTypeId = ref(null)
const fromDate = ref('')
const toDate = ref('')
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

const headers = computed(() => [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: t('meetings.meetings.list_pages.conclusions.content'), key: 'content' },
  { title: t('meetings.meetings.list_pages.conclusions.meeting'), key: 'meeting_title' },
  { title: t('meetings.meetings.list_pages.conclusions.created_by'), key: 'created_by' },
  { title: t('meetings.meetings.list_pages.conclusions.updated_at'), key: 'updated_at' },
  { title: t('meetings.meetings.list_pages.common.actions'), key: 'actions', sortable: false },
])

const { data: requestData, isFetching: isLoading } = await useApi(createUrl('/meetings/all-conclusions', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    meeting_type_id: computed(() => meetingTypeId.value || undefined),
    from_date: computed(() => fromDate.value || undefined),
    to_date: computed(() => toDate.value || undefined),
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
    const res = await exportConclusions({
      search: searchQuery.value || undefined,
      meeting_type_id: meetingTypeId.value || undefined,
      from_date: fromDate.value || undefined,
      to_date: toDate.value || undefined,
      sort_by: sortBy.value || undefined,
      sort_order: orderBy.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'danh-sach-ket-luan-cuoc-hop.xlsx')
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
            icon="tabler-clipboard-check"
            class="section-icon"
          />
          {{ t('meetings.meetings.list_pages.conclusions.title') }}
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
              :placeholder="t('meetings.meetings.list_pages.conclusions.search_placeholder')"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              {{ t('meetings.meetings.list_pages.common.meeting_type') }}
            </div>
            <AppSelect
              v-model="meetingTypeId"
              :items="meetingTypes"
              :placeholder="t('meetings.meetings.list_pages.common.all_meeting_types')"
              density="compact"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Tu ngay
            </div>
            <AppTextField
              v-model="fromDate"
              type="date"
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Den ngay
            </div>
            <AppTextField
              v-model="toDate"
              type="date"
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
          v-if="$can('export', 'MeetingConclusion')"
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

        <template #item.content="{ item }">
          <div
            class="text-truncate"
            style="max-inline-size: 300px;"
          >
            {{ item.content || t('meetings.meetings.list_pages.common.empty_value') }}
          </div>
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

        <template #item.created_by="{ item }">
          {{ item.created_by || t('meetings.meetings.list_pages.common.empty_value') }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="item.meeting_id && $can('update', 'Meeting')"
              :to="{ name: 'meetings-edit', params: { id: item.meeting_id }, query: { tab: 'conclusions' } }"
            >
              <VIcon icon="tabler-eye" />
              <VTooltip
                activator="parent"
                location="top"
              >
                {{ t('meetings.meetings.list_pages.conclusions.open_related_meeting') }}
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
