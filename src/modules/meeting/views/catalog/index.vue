<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingCatalogEditorDialog from '@/modules/meeting/components/MeetingCatalogEditorDialog.vue'
import MeetingExportDialog from '@/modules/meeting/components/MeetingExportDialog.vue'
import MeetingImportDialog from '@/modules/meeting/components/MeetingImportDialog.vue'
import { CATALOG_STATUS_OPTIONS, MEETING_CATALOGS } from '@/modules/meeting/configs/meetingOptions'
import {
  bulkDeleteMeetingCatalog,
  bulkUpdateMeetingCatalogStatus,
  changeMeetingCatalogStatus,
  createMeetingCatalog,
  deleteMeetingCatalog,
  getMeetingCatalog,
  getMeetingCatalogStats,
  getMeetingPublicOptions,
  updateMeetingCatalog,
} from '@/modules/meeting/services/meetingApi'
import { mapCatalogToViewModel, normalizeCollectionResponse, toCatalogPayload } from '@/modules/meeting/utils/meetingAdapters'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const searchQuery = ref('')
const selectedStatus = ref()
const selectedMeetingType = ref()
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isEditorDialogVisible = ref(false)
const isViewMode = ref(false)
const isDeleteDialogVisible = ref(false)
const isStatusDialogVisible = ref(false)
const editedItem = ref(null)
const pendingDeleteId = ref(null)
const pendingStatusAction = ref(null)

const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref([])
const selectedBulkAction = ref()
const isLoading = ref(false)
const rawItems = ref([])
const collectionMeta = ref({ total: 0 })
const stats = ref({ total: 0, active: 0, inactive: 0 })
const meetingTypes = ref([])

const resource = computed(() => String(route.params.resource ?? route.meta.meetingCatalogResource ?? 'meeting-types'))
const catalogConfig = computed(() => MEETING_CATALOGS[resource.value] ?? MEETING_CATALOGS['meeting-types'])
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())
const catalogItems = computed(() => rawItems.value)
const totalItems = computed(() => collectionMeta.value.total ?? rawItems.value.length)

const meetingTypeItems = computed(() => meetingTypes.value.map(item => ({
  title: item.name ?? item.title,
  value: item.id ?? item.value,
})))

const headers = [
  { title: 'STT', key: 'stt', sortable: false, align: 'center' },
  { title: t('meeting.table.module'), key: 'module' },
  { title: t('meeting.table.created_at'), key: 'createdAt' },
  { title: t('meeting.table.updated_at'), key: 'updatedAt' },
  { title: t('meeting.table.status'), key: 'status', align: 'center' },
  { title: t('meeting.table.actions'), key: 'actions', sortable: false, align: 'center' },
]

const bulkActions = [
  { title: t('meeting.catalog.bulk.active'), value: 'active' },
  { title: t('meeting.catalog.bulk.inactive'), value: 'inactive' },
  { title: t('meeting.bulk.delete'), value: 'delete' },
]

const exportScopeOptions = computed(() => {
  const options = [
    { title: t('meeting.exportScope.filtered'), value: 'filtered' },
    { title: t('meeting.exportScope.page'), value: 'page' },
  ]

  if (selectedRows.value.length)
    options.unshift({ title: t('meeting.exportScope.selected', { count: selectedRows.value.length }), value: 'selected' })

  return options
})

const widgetData = computed(() => [
  {
    title: t('meeting.catalog.widgets.total.title'),
    value: `${stats.value.total ?? 0}`,
    desc: catalogConfig.value.title,
    icon: catalogConfig.value.icon,
    iconColor: 'primary',
  },
  {
    title: t('meeting.catalog.widgets.active.title'),
    value: `${stats.value.active ?? 0}`,
    desc: t('meeting.catalog.widgets.active.desc'),
    icon: 'tabler-toggle-right',
    iconColor: 'success',
  },
  {
    title: t('meeting.catalog.widgets.inactive.title'),
    value: `${stats.value.inactive ?? 0}`,
    desc: t('meeting.catalog.widgets.inactive.desc'),
    icon: 'tabler-toggle-left',
    iconColor: 'secondary',
  },
])

const ensureResource = () => {
  if (MEETING_CATALOGS[resource.value])
    return

  router.replace({ name: 'apps-meeting-catalog', params: { resource: 'meeting-types' } })
}

const buildQuery = extra => ({
  limit: itemsPerPage.value,
  meeting_type_id: selectedMeetingType.value,
  page: page.value,
  search: normalizedSearchQuery.value,
  sortBy: 'created_at',
  sortOrder: 'desc',
  status: selectedStatus.value,
  ...extra,
})

const fetchCatalog = async () => {
  isLoading.value = true

  try {
    const response = await getMeetingCatalog(resource.value, buildQuery())
    const collection = normalizeCollectionResponse(response)

    rawItems.value = collection.data.map(mapCatalogToViewModel)
    collectionMeta.value = collection.meta
  }
  catch (error) {
    rawItems.value = []
    collectionMeta.value = { total: 0 }
    throw error
  }
  finally {
    isLoading.value = false
  }
}

const fetchCatalogForExport = async () => {
  const response = await getMeetingCatalog(resource.value, buildQuery({
    limit: totalItems.value || undefined,
    page: 1,
  }))

  return normalizeCollectionResponse(response).data.map(mapCatalogToViewModel)
}

const fetchCatalogStats = async () => {
  const response = await getMeetingCatalogStats(resource.value, buildQuery({ limit: undefined, page: undefined }))

  stats.value = response.data ?? { total: 0, active: 0, inactive: 0 }
}

const loadMeetingTypes = async () => {
  try {
    const response = await getMeetingPublicOptions('meeting-types')

    meetingTypes.value = response.data ?? []
  }
  catch {
    meetingTypes.value = []
  }
}

const refreshCatalog = async () => {
  ensureResource()

  const results = await Promise.allSettled([
    fetchCatalog(),
    fetchCatalogStats(),
  ])

  const failedResult = results.find(result => result.status === 'rejected')

  if (failedResult?.reason) {
    showSnackbar(
      isCoreForbiddenError(failedResult.reason)
        ? t('meeting.messages.forbiddenCatalog', { item: catalogConfig.value.title })
        : getCoreErrorMessage(failedResult.reason, t('meeting.messages.loadCatalogError', { item: catalogConfig.value.title })),
      'error',
    )
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = undefined
  selectedMeetingType.value = undefined
  page.value = 1
}

const openCreateDialog = () => {
  editedItem.value = null
  isViewMode.value = false
  isEditorDialogVisible.value = true
}

const openEditDialog = item => {
  editedItem.value = { ...item }
  isViewMode.value = false
  isEditorDialogVisible.value = true
}

const openViewDialog = item => {
  editedItem.value = { ...item }
  isViewMode.value = true
  isEditorDialogVisible.value = true
}

const handleSaveItem = async formData => {
  if (isViewMode.value) {
    isEditorDialogVisible.value = false

    return
  }

  const payload = toCatalogPayload(formData)

  if (!catalogConfig.value.usesMeetingType)
    delete payload.meeting_type_id

  if (!catalogConfig.value.usesPosition)
    delete payload.position

  if (formData.id)
    await updateMeetingCatalog(resource.value, formData.id, payload)
  else
    await createMeetingCatalog(resource.value, payload)

  isEditorDialogVisible.value = false
  await refreshCatalog()
  showSnackbar(t(formData.id ? 'meeting.messages.updatedCatalog' : 'meeting.messages.createdCatalog'))
}

const requestDeleteItem = id => {
  pendingDeleteId.value = id
  isDeleteDialogVisible.value = true
}

const confirmDeleteItem = async isConfirmed => {
  if (!isConfirmed)
    return

  if (pendingStatusAction.value?.type === 'bulk-delete') {
    await bulkDeleteMeetingCatalog(resource.value, pendingStatusAction.value.ids)
    pendingStatusAction.value = null
    selectedRows.value = []
    selectedBulkAction.value = undefined
    await refreshCatalog()
    showSnackbar(t('meeting.messages.deletedSelectedCatalogs'))

    return
  }

  if (pendingDeleteId.value === null)
    return

  await deleteMeetingCatalog(resource.value, pendingDeleteId.value)
  selectedRows.value = selectedRows.value.filter(id => id !== pendingDeleteId.value)
  pendingDeleteId.value = null
  await refreshCatalog()
  showSnackbar(t('meeting.messages.deletedCatalog'))
}

const requestStatusChange = (item, status = null) => {
  pendingStatusAction.value = {
    ids: [item.id],
    status: status ?? (item.status === 'active' ? 'inactive' : 'active'),
    type: 'single',
  }
  isStatusDialogVisible.value = true
}

const confirmStatusChange = async isConfirmed => {
  if (!isConfirmed || !pendingStatusAction.value)
    return

  const { ids, status, type } = pendingStatusAction.value

  if (type === 'bulk')
    await bulkUpdateMeetingCatalogStatus(resource.value, ids, status)
  else
    await changeMeetingCatalogStatus(resource.value, ids[0], status)

  pendingStatusAction.value = null
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshCatalog()
  showSnackbar(t('meeting.messages.updatedCatalogStatus'))
}

const handleBulkAction = action => {
  if (!action || !selectedRows.value.length)
    return

  pendingStatusAction.value = {
    ids: [...selectedRows.value],
    status: action,
    type: action === 'delete' ? 'bulk-delete' : 'bulk',
  }

  if (action === 'delete')
    isDeleteDialogVisible.value = true
  else
    isStatusDialogVisible.value = true
}

const exportRowsToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => ({
    name: item.name,
    description: item.description,
    meeting_type_id: item.meetingTypeId,
    meeting_type_name: item.meetingTypeName,
    position: item.position,
    status: item.status,
    created_at: item.createdAt,
    created_by: item.createdBy,
    updated_at: item.updatedAt,
    updated_by: item.updatedBy,
  })))

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog')
  XLSX.writeFileXLSX(workbook, fileName)
}

const handleExportCatalog = async scope => {
  if (scope === 'selected') {
    exportRowsToWorkbook(catalogItems.value.filter(item => selectedRows.value.includes(item.id)), `${resource.value}-selected-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showSnackbar(t('meeting.messages.exportedCatalog'))

    return
  }

  if (scope === 'page') {
    exportRowsToWorkbook(catalogItems.value, `${resource.value}-page-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showSnackbar(t('meeting.messages.exportedCatalog'))

    return
  }

  const allRows = await fetchCatalogForExport()

  exportRowsToWorkbook(allRows, `${resource.value}-filtered-${new Date().toISOString().slice(0, 10)}.xlsx`)
  showSnackbar(t('meeting.messages.exportedCatalog'))
}

const readWorkbookRows = async file => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  return XLSX.utils.sheet_to_json(worksheet, { defval: '' })
}

const resolveMeetingTypeId = value => {
  if (!value)
    return null

  if (typeof value === 'number')
    return value

  const normalizedValue = String(value).trim().toLowerCase()
  const matchedOption = meetingTypes.value.find(item => String(item.id) === normalizedValue || String(item.name ?? item.title ?? '').trim().toLowerCase() === normalizedValue)

  return matchedOption?.id ?? (Number(normalizedValue) || null)
}

const handleImportCatalog = async file => {
  const rows = await readWorkbookRows(file)

  if (!rows.length) {
    showSnackbar(t('meeting.messages.emptyImportFile'), 'warning')

    return
  }

  for (const row of rows) {
    const payload = {
      name: row.name || row.title || row.ten || row.module,
      description: row.description || row.mo_ta || null,
      position: row.position || row.chuc_vu || null,
      status: row.status || 'active',
      meeting_type_id: resolveMeetingTypeId(row.meeting_type_id || row.meeting_type_name || row.loai_cuoc_hop),
    }

    if (!payload.name)
      continue

    if (!catalogConfig.value.usesMeetingType)
      delete payload.meeting_type_id

    if (!catalogConfig.value.usesPosition)
      delete payload.position

    await createMeetingCatalog(resource.value, payload)
  }

  await refreshCatalog()
  showSnackbar(t('meeting.messages.importedCatalog'))
}

const refreshCatalogDebounced = useDebounceFn(async () => {
  page.value = 1
  await refreshCatalog()
}, 300)

watch([searchQuery, selectedStatus, selectedMeetingType], refreshCatalogDebounced)
watch([page, itemsPerPage], refreshCatalog)
watch(resource, async () => {
  selectedRows.value = []
  selectedBulkAction.value = undefined
  resetFilters()
  await refreshCatalog()
})

onMounted(async () => {
  hydratePendingSnackbar()
  await loadMeetingTypes()
  await refreshCatalog()
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
        md="4"
      >
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
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
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VCardItem class="pb-4">
        <VCardTitle>{{ catalogConfig.title }}</VCardTitle>
        <VCardSubtitle>{{ t('meeting.catalog.subtitle') }}</VCardSubtitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('meeting.common.search')"
              prepend-inner-icon="tabler-search"
            />
          </VCol>

          <VCol
            v-if="catalogConfig.usesMeetingType"
            cols="12"
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
            md="4"
          >
            <AppSelect
              v-model="selectedStatus"
              :placeholder="t('meeting.fields.status')"
              :items="CATALOG_STATUS_OPTIONS"
              clearable
              clear-icon="tabler-x"
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
        :items="catalogItems"
        item-value="id"
        :items-length="totalItems"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
      >
        <template #item.stt="{ index }">
          <div class="d-flex align-center justify-center">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </div>
        </template>

        <template #item.module="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium text-high-emphasis">{{ item.name }}</span>
            <span class="text-sm text-medium-emphasis">
              {{ item.position || item.meetingTypeName || item.description || t('meeting.common.noDescription') }}
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
            <IconBtn @click="openViewDialog(item)">
              <VIcon icon="tabler-eye" />
            </IconBtn>

            <IconBtn @click="openEditDialog(item)">
              <VIcon icon="tabler-pencil" />
            </IconBtn>

            <IconBtn @click="requestDeleteItem(item.id)">
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
                {{ paginationMeta({ page, itemsPerPage }, totalItems) }}
              </p>

              <VPagination
                :model-value="page"
                active-color="primary"
                :length="Math.max(Math.ceil(totalItems / itemsPerPage), 1)"
                :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(Math.ceil(totalItems / itemsPerPage), 1), 5)"
                @update:model-value="page = $event"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <MeetingCatalogEditorDialog
      v-model:is-dialog-visible="isEditorDialogVisible"
      :catalog-config="catalogConfig"
      :catalog-item="editedItem"
      :is-read-only="isViewMode"
      :meeting-types="meetingTypeItems"
      @save="handleSaveItem"
    />

    <MeetingImportDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      :dialog-title="t('meeting.catalog.importTitle', { item: catalogConfig.title.toLowerCase() })"
      :alert-text="t('meeting.catalog.importAlert', { meetingTypeHint: catalogConfig.usesMeetingType ? t('meeting.catalog.importMeetingTypeHint') : '', positionHint: catalogConfig.usesPosition ? t('meeting.catalog.importPositionHint') : '' })"
      @import="handleImportCatalog"
    />

    <MeetingExportDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      :dialog-title="t('meeting.catalog.exportTitle', { item: catalogConfig.title.toLowerCase() })"
      :alert-text="t('meeting.catalog.exportAlert')"
      :selected-count="selectedRows.length"
      :scope-options="exportScopeOptions"
      @export="handleExportCatalog"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      :confirmation-question="t('meeting.catalog.confirmDelete.question')"
      :confirm-title="t('meeting.common.deletedTitle')"
      :confirm-msg="t('meeting.catalog.confirmDelete.confirmMsg')"
      :cancel-title="t('meeting.common.cancelledTitle')"
      :cancel-msg="t('meeting.catalog.confirmDelete.cancelMsg')"
      @confirm="confirmDeleteItem"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isStatusDialogVisible"
      :confirmation-question="t('meeting.catalog.confirmStatus.question')"
      :confirm-title="t('meeting.common.updatedTitle')"
      :confirm-msg="t('meeting.catalog.confirmStatus.confirmMsg')"
      :cancel-title="t('meeting.common.cancelledTitle')"
      :cancel-msg="t('meeting.catalog.confirmStatus.cancelMsg')"
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
