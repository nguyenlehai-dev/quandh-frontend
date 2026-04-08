<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingCatalogEditorDialog from '@/modules/meeting/components/MeetingCatalogEditorDialog.vue'
import { CATALOG_STATUS_OPTIONS, MEETING_CATALOGS, getOptionColor, getOptionTitle } from '@/modules/meeting/configs/meetingOptions'
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

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const searchQuery = ref('')
const selectedStatus = ref()
const selectedMeetingType = ref()
const isEditorDialogVisible = ref(false)
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
  { title: 'TÊN MODULE', key: 'module' },
  { title: 'NGÀY TẠO', key: 'createdAt' },
  { title: 'CẬP NHẬT', key: 'updatedAt' },
  { title: 'TRẠNG THÁI', key: 'status', align: 'center' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, align: 'center' },
]

const bulkActions = [
  { title: 'Bật hoạt động', value: 'active' },
  { title: 'Tạm tắt', value: 'inactive' },
  { title: 'Xóa', value: 'delete' },
]

const widgetData = computed(() => [
  {
    title: 'Tổng dữ liệu',
    value: `${stats.value.total ?? 0}`,
    desc: catalogConfig.value.title,
    icon: catalogConfig.value.icon,
    iconColor: 'primary',
  },
  {
    title: 'Hoạt động',
    value: `${stats.value.active ?? 0}`,
    desc: 'Đang bật',
    icon: 'tabler-toggle-right',
    iconColor: 'success',
  },
  {
    title: 'Tạm tắt',
    value: `${stats.value.inactive ?? 0}`,
    desc: 'Đang tắt',
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
        ? `Tài khoản hiện tại không có quyền truy cập ${catalogConfig.value.title}.`
        : getCoreErrorMessage(failedResult.reason, `Không thể tải ${catalogConfig.value.title}.`),
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
  isEditorDialogVisible.value = true
}

const openEditDialog = item => {
  editedItem.value = { ...item }
  isEditorDialogVisible.value = true
}

const handleSaveItem = async formData => {
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
  showSnackbar(formData.id ? 'Đã cập nhật danh mục.' : 'Đã thêm mới danh mục.')
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
    showSnackbar('Đã xóa các danh mục đã chọn.')

    return
  }

  if (pendingDeleteId.value === null)
    return

  await deleteMeetingCatalog(resource.value, pendingDeleteId.value)
  selectedRows.value = selectedRows.value.filter(id => id !== pendingDeleteId.value)
  pendingDeleteId.value = null
  await refreshCatalog()
  showSnackbar('Đã xóa danh mục.')
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
  showSnackbar('Đã cập nhật trạng thái danh mục.')
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
        <VCardSubtitle>Danh mục nền phục vụ module Họp không giấy.</VCardSubtitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm kiếm"
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
              placeholder="Loại cuộc họp"
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
              placeholder="Trạng thái"
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
          placeholder="Hành động"
          :items="bulkActions"
          style="inline-size: 13rem;"
          @update:model-value="handleBulkAction"
        />

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <VBtn
            variant="tonal"
            color="secondary"
            :icon="$vuetify.display.smAndDown ? 'tabler-refresh' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-refresh'"
            @click="resetFilters"
          >
            <span v-if="!$vuetify.display.smAndDown">Đặt lại</span>
          </VBtn>

          <VBtn
            :icon="$vuetify.display.smAndDown ? 'tabler-plus' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-plus'"
            @click="openCreateDialog"
          >
            <span v-if="!$vuetify.display.smAndDown">Thêm mới</span>
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
              {{ item.position || item.meetingTypeName || item.description || 'Không có mô tả' }}
            </span>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="d-flex align-center justify-center gap-2">
            <VSwitch
              :model-value="item.status === 'active'"
              color="primary"
              density="compact"
              class="mt-0"
              @update:model-value="requestStatusChange(item)"
            />
            <VChip
              size="small"
              label
              :color="getOptionColor(CATALOG_STATUS_OPTIONS, item.status)"
            >
              {{ getOptionTitle(CATALOG_STATUS_OPTIONS, item.status) }}
            </VChip>
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
      :meeting-types="meetingTypeItems"
      @save="handleSaveItem"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      confirmation-question="Bạn chắc chắn muốn xóa dữ liệu danh mục đã chọn?"
      confirm-title="Đã xóa"
      confirm-msg="Dữ liệu danh mục đã được xóa."
      cancel-title="Đã hủy"
      cancel-msg="Dữ liệu danh mục được giữ nguyên."
      @confirm="confirmDeleteItem"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isStatusDialogVisible"
      confirmation-question="Bạn chắc chắn muốn cập nhật trạng thái danh mục?"
      confirm-title="Đã cập nhật"
      confirm-msg="Trạng thái danh mục đã được cập nhật."
      cancel-title="Đã hủy"
      cancel-msg="Trạng thái danh mục được giữ nguyên."
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
