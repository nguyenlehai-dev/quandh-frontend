<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingEditorDialog from '@/modules/meeting/components/MeetingEditorDialog.vue'
import MeetingExportDialog from '@/modules/meeting/components/MeetingExportDialog.vue'
import MeetingImportDialog from '@/modules/meeting/components/MeetingImportDialog.vue'
import { MEETING_STATUS_OPTIONS } from '@/modules/meeting/configs/meetingOptions'
import {
  bulkDeleteMeetings,
  bulkUpdateMeetingStatus,
  changeMeetingStatus,
  createMeeting,
  deleteMeeting,
  downloadMeetingsExport,
  getMeetingPublicOptions,
  getMeetingStats,
  getMeetings,
  importMeetings,
  updateMeeting,
} from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel, normalizeCollectionResponse, toMeetingPayload } from '@/modules/meeting/utils/meetingAdapters'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const searchQuery = ref('')
const selectedStatus = ref()
const selectedMeetingType = ref()
const fromDate = ref('')
const toDate = ref('')
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isEditorDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const isStatusDialogVisible = ref(false)
const editedMeeting = ref(null)
const pendingDeleteMeetingId = ref(null)
const pendingStatusAction = ref(null)
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const selectedBulkAction = ref()
const isLoading = ref(false)

const rawMeetings = ref([])
const meetingTypes = ref([])

const meetingStats = ref({
  total: 0,
  draft: 0,
  active: 0,
  in_progress: 0,
  completed: 0,
  cancelled: 0,
})

const headers = [
  { title: 'STT', key: 'stt', sortable: false, align: 'center' },
  { title: t('meeting.table.module'), key: 'module' },
  { title: t('meeting.table.created_at'), key: 'createdAt' },
  { title: t('meeting.table.updated_at'), key: 'updatedAt' },
  { title: t('meeting.table.status'), key: 'status', align: 'center' },
  { title: t('meeting.table.actions'), key: 'actions', sortable: false, align: 'center' },
]

const bulkActions = [
  { title: t('meeting.bulk.active'), value: 'active' },
  { title: t('meeting.bulk.draft'), value: 'draft' },
  { title: t('meeting.bulk.completed'), value: 'completed' },
  { title: t('meeting.bulk.cancelled'), value: 'cancelled' },
  { title: t('meeting.bulk.delete'), value: 'delete' },
]

const meetingTypeItems = computed(() => meetingTypes.value.map(item => ({
  title: item.name ?? item.title,
  value: item.id ?? item.value,
})))

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const widgetData = computed(() => [
  {
    title: t('meeting.list.widgets.total.title'),
    value: `${meetingStats.value.total ?? 0}`,
    desc: t('meeting.list.widgets.total.desc'),
    icon: 'tabler-calendar-event',
    iconColor: 'primary',
  },
  {
    title: t('meeting.list.widgets.active.title'),
    value: `${meetingStats.value.active ?? 0}`,
    desc: t('meeting.list.widgets.active.desc'),
    icon: 'tabler-toggle-right',
    iconColor: 'success',
  },
  {
    title: t('meeting.list.widgets.in_progress.title'),
    value: `${meetingStats.value.in_progress ?? 0}`,
    desc: t('meeting.list.widgets.in_progress.desc'),
    icon: 'tabler-player-play',
    iconColor: 'info',
  },
  {
    title: t('meeting.list.widgets.completed.title'),
    value: `${meetingStats.value.completed ?? 0}`,
    desc: t('meeting.list.widgets.completed.desc'),
    icon: 'tabler-circle-check',
    iconColor: 'warning',
  },
])

const meetings = computed(() => rawMeetings.value)
const totalMeetings = computed(() => collectionMeta.value.total ?? rawMeetings.value.length)
const collectionMeta = ref({ total: 0 })

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = undefined
  selectedMeetingType.value = undefined
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

const buildQuery = extra => ({
  fromDate: fromDate.value,
  limit: itemsPerPage.value,
  meeting_type_id: selectedMeetingType.value,
  page: page.value,
  search: normalizedSearchQuery.value,
  sortBy: sortBy.value === 'module' ? 'title' : 'created_at',
  sortOrder: orderBy.value || 'desc',
  status: selectedStatus.value,
  toDate: toDate.value,
  ...extra,
})

const fetchMeetings = async () => {
  isLoading.value = true

  try {
    const response = await getMeetings(buildQuery())
    const collection = normalizeCollectionResponse(response)

    rawMeetings.value = collection.data.map(mapMeetingToViewModel)
    collectionMeta.value = collection.meta
  }
  catch (error) {
    rawMeetings.value = []
    collectionMeta.value = { total: 0 }
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const fetchMeetingStats = async () => {
  const response = await getMeetingStats(buildQuery({ limit: undefined, page: undefined }))

  meetingStats.value = response.data ?? meetingStats.value
}

const loadReferenceData = async () => {
  try {
    const response = await getMeetingPublicOptions('meeting-types')

    meetingTypes.value = response.data ?? []
  }
  catch (error) {
    meetingTypes.value = []
    showSnackbar(getCoreErrorMessage(error, t('meeting.messages.loadMeetingTypesError')), 'error')
  }
}

const refreshMeetings = async () => {
  const results = await Promise.allSettled([
    fetchMeetings(),
    fetchMeetingStats(),
  ])

  const failedResult = results.find(result => result.status === 'rejected')

  if (failedResult?.reason) {
    showSnackbar(
      isCoreForbiddenError(failedResult.reason)
        ? t('meeting.messages.forbiddenModule')
        : getCoreErrorMessage(failedResult.reason, t('meeting.messages.loadMeetingListError')),
      'error',
    )
  }
}

const openCreateDialog = () => {
  editedMeeting.value = null
  isEditorDialogVisible.value = true
}

const openEditDialog = item => {
  editedMeeting.value = { ...item }
  isEditorDialogVisible.value = true
}

const handleSaveMeeting = async formData => {
  const payload = toMeetingPayload(formData)

  if (formData.id)
    await updateMeeting(formData.id, payload)
  else
    await createMeeting(payload)

  isEditorDialogVisible.value = false
  await refreshMeetings()
  showSnackbar(t(formData.id ? 'meeting.messages.updatedMeeting' : 'meeting.messages.createdMeeting'))
}

const requestDeleteMeeting = id => {
  pendingDeleteMeetingId.value = id
  isDeleteDialogVisible.value = true
}

const confirmDeleteMeeting = async isConfirmed => {
  if (!isConfirmed || pendingDeleteMeetingId.value === null)
    return

  await deleteMeeting(pendingDeleteMeetingId.value)
  selectedRows.value = selectedRows.value.filter(id => id !== pendingDeleteMeetingId.value)
  pendingDeleteMeetingId.value = null
  await refreshMeetings()
  showSnackbar(t('meeting.messages.deletedMeeting'))
}

const requestStatusChange = (item, status = null) => {
  pendingStatusAction.value = {
    ids: [item.id],
    status: status ?? (item.status === 'active' ? 'draft' : 'active'),
    type: 'single',
  }
  isStatusDialogVisible.value = true
}

const confirmStatusChange = async isConfirmed => {
  if (!isConfirmed || !pendingStatusAction.value)
    return

  const { ids, status, type } = pendingStatusAction.value

  if (type === 'bulk')
    await bulkUpdateMeetingStatus(ids, status)
  else
    await changeMeetingStatus(ids[0], status)

  pendingStatusAction.value = null
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshMeetings()
  showSnackbar(t('meeting.messages.updatedMeetingStatus'))
}

const handleBulkAction = action => {
  if (!action || !selectedRows.value.length)
    return

  pendingStatusAction.value = {
    ids: [...selectedRows.value],
    status: action,
    type: action === 'delete' ? 'bulk-delete' : 'bulk',
  }

  if (action === 'delete') {
    pendingDeleteMeetingId.value = null
    isDeleteDialogVisible.value = true

    return
  }

  isStatusDialogVisible.value = true
}

const confirmBulkDelete = async isConfirmed => {
  if (!isConfirmed)
    return

  if (pendingStatusAction.value?.type === 'bulk-delete') {
    await bulkDeleteMeetings(pendingStatusAction.value.ids)
    pendingStatusAction.value = null
    selectedRows.value = []
    selectedBulkAction.value = undefined
    await refreshMeetings()
    showSnackbar(t('meeting.messages.deletedSelectedMeetings'))

    return
  }

  await confirmDeleteMeeting(isConfirmed)
}

const exportRowsToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => ({
    code: item.code,
    createdAt: item.createdAt,
    createdBy: item.createdBy,
    endAt: item.endAt,
    location: item.location,
    meetingType: item.meetingTypeName,
    startAt: item.startAt,
    status: item.status,
    title: item.title,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
  })))

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Meetings')
  XLSX.writeFileXLSX(workbook, fileName)
}

const handleExportMeetings = async scope => {
  if (scope === 'selected') {
    exportRowsToWorkbook(meetings.value.filter(item => selectedRows.value.includes(item.id)), `meetings-selected-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showSnackbar(t('meeting.messages.exportedMeetings'))

    return
  }

  if (scope === 'page') {
    exportRowsToWorkbook(meetings.value, `meetings-page-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showSnackbar(t('meeting.messages.exportedMeetings'))

    return
  }

  await downloadMeetingsExport(buildQuery({ limit: undefined, page: undefined }))
  showSnackbar(t('meeting.messages.exportedMeetings'))
}

const handleImportMeetings = async file => {
  await importMeetings(file)
  await refreshMeetings()
  showSnackbar(t('meeting.messages.importedMeetings'))
}

const refreshMeetingsDebounced = useDebounceFn(async () => {
  page.value = 1
  await refreshMeetings()
}, 300)

watch([searchQuery, selectedStatus, selectedMeetingType, fromDate, toDate], refreshMeetingsDebounced)
watch([page, itemsPerPage], refreshMeetings)

onMounted(async () => {
  hydratePendingSnackbar()
  await loadReferenceData()
  await refreshMeetings()
})
</script>

<template>
  <section>
    <VRow class="mb-6">
      <VCol
        v-for="data in widgetData"
        :key="data.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between">
              <div class="d-flex flex-column gap-y-1">
                <div class="text-body-1 text-high-emphasis">
                  {{ data.title }}
                </div>
                <h4 class="text-h4">
                  {{ data.value }}
                </h4>
                <div class="text-sm text-medium-emphasis">
                  {{ data.desc }}
                </div>
              </div>
              <VAvatar
                :color="data.iconColor"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  :icon="data.icon"
                  size="26"
                />
              </VAvatar>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ t('meeting.navigation.module') }}</VCardTitle>
        <VCardSubtitle>{{ t('meeting.list.subtitle') }}</VCardSubtitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('meeting.list.searchPlaceholder')"
              prepend-inner-icon="tabler-search"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppSelect
              v-model="selectedMeetingType"
              :placeholder="t('meeting.fields.meeting_type')"
              :items="meetingTypeItems"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
          >
            <AppSelect
              v-model="selectedStatus"
              :placeholder="t('meeting.fields.status')"
              :items="MEETING_STATUS_OPTIONS"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
          >
            <AppDateTimePicker
              v-model="fromDate"
              :placeholder="t('meeting.list.fromDate')"
              :config="{ altFormat: 'd/m/Y', altInput: true, dateFormat: 'Y-m-d' }"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
          >
            <AppDateTimePicker
              v-model="toDate"
              :placeholder="t('meeting.list.toDate')"
              :config="{ altFormat: 'd/m/Y', altInput: true, dateFormat: 'Y-m-d' }"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <AppSelect
          v-if="selectedRows.length"
          v-model="selectedBulkAction"
          :placeholder="t('meeting.common.action')"
          :items="bulkActions"
          style="inline-size: 13rem;"
          @update:model-value="handleBulkAction"
        />

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <VBtn
            variant="tonal"
            color="secondary"
            :icon="$vuetify.display.smAndDown ? 'tabler-download' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-download'"
            @click="isImportDialogVisible = true"
          >
            <span v-if="!$vuetify.display.smAndDown">{{ t('meeting.common.importData') }}</span>
          </VBtn>

          <VBtn
            variant="tonal"
            color="secondary"
            :icon="$vuetify.display.smAndDown ? 'tabler-upload' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-upload'"
            @click="isExportDialogVisible = true"
          >
            <span v-if="!$vuetify.display.smAndDown">{{ t('meeting.common.exportData') }}</span>
          </VBtn>

          <VBtn
            variant="tonal"
            color="secondary"
            :icon="$vuetify.display.smAndDown ? 'tabler-refresh' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-refresh'"
            @click="resetFilters"
          >
            <span v-if="!$vuetify.display.smAndDown">{{ t('meeting.common.reset') }}</span>
          </VBtn>

          <VBtn
            :icon="$vuetify.display.smAndDown ? 'tabler-plus' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-plus'"
            @click="openCreateDialog"
          >
            <span v-if="!$vuetify.display.smAndDown">{{ t('meeting.common.addNew') }}</span>
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="meetings"
        item-value="id"
        :items-length="totalMeetings"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <template #item.stt="{ index }">
          <div class="d-flex align-center justify-center">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </div>
        </template>

        <template #item.module="{ item }">
          <div class="d-flex flex-column">
            <RouterLink
              :to="{ name: 'apps-meetings-detail', params: { id: item.id } }"
              class="font-weight-medium text-link"
            >
              {{ item.title }}
            </RouterLink>
            <span class="text-sm text-medium-emphasis">
              {{ item.code || t('meeting.common.noCode') }} · {{ item.meetingTypeName }} · {{ item.location || t('meeting.common.noLocation') }}
            </span>
            <span class="text-sm text-medium-emphasis">
              {{ item.startAt || t('meeting.common.na') }} -> {{ item.endAt || t('meeting.common.na') }}
            </span>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="d-flex align-center justify-center">
            <VSwitch
              :model-value="item.status === 'active'"
              color="primary"
              density="compact"
              class="mt-0"
              @update:model-value="requestStatusChange(item)"
            />
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="d-flex flex-column">
            <span class="text-body-2 text-primary font-weight-medium">{{ item.createdBy }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ item.createdAt }}</span>
          </div>
        </template>

        <template #item.updatedAt="{ item }">
          <div class="d-flex flex-column">
            <span class="text-body-2 text-primary font-weight-medium">{{ item.updatedBy }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ item.updatedAt }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center">
            <IconBtn :to="{ name: 'apps-meetings-detail', params: { id: item.id } }">
              <VIcon icon="tabler-eye" />
            </IconBtn>

            <IconBtn @click="openEditDialog(item)">
              <VIcon icon="tabler-pencil" />
            </IconBtn>

            <IconBtn @click="requestDeleteMeeting(item.id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <VDivider />

          <div class="d-flex flex-wrap align-center justify-space-between gap-4 px-6 py-4">
            <AppSelect
              :model-value="itemsPerPage"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              style="inline-size: 6rem;"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
            />

            <div class="d-flex flex-wrap align-center justify-end gap-4 ms-auto">
              <p class="text-disabled mb-0">
                {{ paginationMeta({ page, itemsPerPage }, totalMeetings) }}
              </p>

              <VPagination
                :model-value="page"
                active-color="primary"
                :length="Math.max(Math.ceil(totalMeetings / itemsPerPage), 1)"
                :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(Math.ceil(totalMeetings / itemsPerPage), 1), 5)"
                @update:model-value="page = $event"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <MeetingImportDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      @import="handleImportMeetings"
    />

    <MeetingExportDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      :selected-count="selectedRows.length"
      @export="handleExportMeetings"
    />

    <MeetingEditorDialog
      v-model:is-dialog-visible="isEditorDialogVisible"
      :meeting="editedMeeting"
      :meeting-types="meetingTypeItems"
      @save="handleSaveMeeting"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      :confirmation-question="t('meeting.list.confirmDelete.question')"
      :confirm-title="t('meeting.list.confirmDelete.confirmTitle')"
      :confirm-msg="t('meeting.list.confirmDelete.confirmMsg')"
      :cancel-title="t('meeting.common.cancelledTitle')"
      :cancel-msg="t('meeting.list.confirmDelete.cancelMsg')"
      @confirm="confirmBulkDelete"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isStatusDialogVisible"
      :confirmation-question="t('meeting.list.confirmStatus.question')"
      :confirm-title="t('meeting.common.updatedTitle')"
      :confirm-msg="t('meeting.list.confirmStatus.confirmMsg')"
      :cancel-title="t('meeting.common.cancelledTitle')"
      :cancel-msg="t('meeting.list.confirmStatus.cancelMsg')"
      @confirm="confirmStatusChange"
    />

    <VSnackbar
      v-model="isSnackbarVisible"
      location="top end"
      :color="snackbarColor"
      timeout="2400"
    >
      {{ snackbarText }}
    </VSnackbar>
  </section>
</template>
