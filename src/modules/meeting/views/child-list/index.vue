<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingChildEditorDialog from '@/modules/meeting/components/MeetingChildEditorDialog.vue'
import MeetingExportDialog from '@/modules/meeting/components/MeetingExportDialog.vue'
import MeetingImportDialog from '@/modules/meeting/components/MeetingImportDialog.vue'
import { MEETING_CHILD_TABS, getOptionColor, getOptionTitle } from '@/modules/meeting/configs/meetingOptions'
import {
  createMeetingChild,
  deleteMeetingChild,
  getMeeting,
  getMeetings,
  updateMeetingChild,
} from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel } from '@/modules/meeting/utils/meetingAdapters'
import { getCoreUsers } from '@/modules/user-management/services/coreUsers'
import * as XLSX from 'xlsx'

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const searchQuery = ref('')
const selectedMeetingId = ref()
const selectedStatus = ref()
const isLoading = ref(false)
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isChildDialogVisible = ref(false)
const isChildViewMode = ref(false)
const isDeleteDialogVisible = ref(false)
const isStatusDialogVisible = ref(false)
const editedChildItem = ref(null)
const pendingDeleteItem = ref(null)
const pendingStatusAction = ref(null)
const selectedRows = ref([])
const selectedBulkAction = ref()
const itemsPerPage = ref(10)
const page = ref(1)

const rawMeetings = ref([])
const meetingDetails = ref([])
const userOptions = ref([])

const activeChildConfig = computed(() => MEETING_CHILD_TABS.find(item => item.key === route.meta.meetingChildKey) ?? MEETING_CHILD_TABS[0])
const pageTitle = computed(() => route.meta.title ?? activeChildConfig.value.title)
const pageDescription = computed(() => route.meta.description ?? `${activeChildConfig.value.title} được quản trị tập trung theo toàn bộ cuộc họp.`)

const meetingItems = computed(() => rawMeetings.value.map(item => ({
  title: `${item.title} (${item.code || `#${item.id}`})`,
  value: item.id,
})))

const childSelectItems = computed(() => ({
  user_id: userOptions.value,
}))

const headers = computed(() => [
  { title: 'STT', key: 'stt', sortable: false, align: 'center' },
  { title: 'TÊN MODULE', key: 'module' },
  { title: 'CUỘC HỌP', key: 'meeting' },
  { title: 'NGÀY TẠO', key: 'createdAt' },
  { title: 'CẬP NHẬT', key: 'updatedAt' },
  { title: 'TRẠNG THÁI', key: 'status', align: 'center' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, align: 'center' },
])

const bulkActions = computed(() => {
  const statusActions = (activeChildConfig.value.statusOptions ?? []).map(item => ({
    title: `Chuyển ${item.title.toLowerCase()}`,
    value: item.value,
  }))

  return [
    ...statusActions,
    { title: 'Xóa', value: 'delete' },
  ]
})

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const allChildRows = computed(() => meetingDetails.value.flatMap(meeting => {
  const rows = meeting[activeChildConfig.value.responseKey] ?? []

  return rows.map(item => ({
    ...item,
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    meetingCode: meeting.code,
    meetingStatus: meeting.status,
    rowKey: `${meeting.id}-${item.id}`,
    createdAt: item.createdAt ?? item.created_at ?? 'N/A',
    updatedAt: item.updatedAt ?? item.updated_at ?? 'N/A',
    createdBy: item.createdBy ?? item.created_by_name ?? item.created_by ?? 'N/A',
    updatedBy: item.updatedBy ?? item.updated_by_name ?? item.updated_by ?? 'N/A',
  }))
}))

const filteredChildRows = computed(() => allChildRows.value.filter(item => {
  const normalizedMeetingId = selectedMeetingId.value ? Number(selectedMeetingId.value) : null
  const matchesMeeting = !normalizedMeetingId || item.meetingId === normalizedMeetingId
  const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value
  const haystack = [
    item.title,
    item.name,
    item.content,
    item.position,
    item.document_number,
    item.user?.name,
    item.user?.email,
    item.meetingTitle,
    item.meetingCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const matchesSearch = !normalizedSearch.value || haystack.includes(normalizedSearch.value)

  return matchesMeeting && matchesStatus && matchesSearch
}))

const paginatedRows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value

  return filteredChildRows.value.slice(start, start + itemsPerPage.value)
})

const exportScopeOptions = computed(() => {
  const options = [
    { title: 'Toàn bộ dữ liệu đã lọc', value: 'filtered' },
    { title: 'Trang hiện tại', value: 'page' },
  ]

  if (selectedRows.value.length)
    options.unshift({ title: `Dòng đang chọn (${selectedRows.value.length})`, value: 'selected' })

  return options
})

const resolveChildPrimaryText = item => item.title
  || item.name
  || item.content
  || item.position
  || item.document_number
  || item.user?.name
  || `#${item.id}`

const resolveChildSecondaryText = item => item.description
  || item.user?.email
  || item.review_note
  || item.document?.title
  || item.agenda?.title
  || item.remind_at
  || 'Không có mô tả'

const resolveChildStatusTitle = item => {
  if (!item.status)
    return 'N/A'

  return getOptionTitle(activeChildConfig.value.statusOptions ?? [], item.status)
}

const resolveChildStatusColor = item => {
  if (!item.status)
    return 'secondary'

  return getOptionColor(activeChildConfig.value.statusOptions ?? [], item.status)
}

const sanitizeChildPayload = payload => Object.entries(payload).reduce((acc, [key, value]) => {
  if (key === 'id' || key === 'meetingId' || value === '' || value === undefined)
    return acc

  acc[key] = value

  return acc
}, {})

const normalizeImportedChildValue = (field, value) => {
  if (value === '')
    return undefined

  if (['user_id', 'sort_order', 'duration_minutes', 'meeting_id'].includes(field)) {
    const parsedValue = Number(value)

    return Number.isNaN(parsedValue) ? value : parsedValue
  }

  return value
}

const readWorkbookRows = async file => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  return XLSX.utils.sheet_to_json(worksheet, { defval: '' })
}

const exportRowsToWorkbook = rows => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => {
    const baseRow = {
      meeting_id: item.meetingId,
      meeting_title: item.meetingTitle,
      meeting_code: item.meetingCode,
      id: item.id,
      title: item.title ?? item.name ?? '',
      content: item.content ?? '',
      description: item.description ?? '',
      status: item.status ?? '',
      created_at: item.createdAt,
      created_by: item.createdBy,
      updated_at: item.updatedAt,
      updated_by: item.updatedBy,
    }

    activeChildConfig.value.fields.forEach(field => {
      const rawValue = item[field]

      baseRow[field] = typeof rawValue === 'object' ? JSON.stringify(rawValue) : rawValue
    })

    return baseRow
  }))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, activeChildConfig.value.key)
  XLSX.writeFileXLSX(workbook, `${activeChildConfig.value.key}-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

const loadReferenceData = async () => {
  const [meetingsResult, usersResult] = await Promise.allSettled([
    getMeetings({
      limit: 100,
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
    getCoreUsers({
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
      status: 'active',
    }),
  ])

  rawMeetings.value = meetingsResult.status === 'fulfilled'
    ? (meetingsResult.value.data ?? []).map(mapMeetingToViewModel)
    : []

  userOptions.value = usersResult.status === 'fulfilled'
    ? (usersResult.value.data ?? []).map(item => ({
        title: `${item.name} (${item.email})`,
        value: item.id,
      }))
    : []
}

const loadChildRows = async () => {
  isLoading.value = true

  try {
    const targetMeetings = rawMeetings.value.length
      ? rawMeetings.value
      : (await getMeetings({ limit: 100, page: 1 })).data.map(mapMeetingToViewModel)

    const detailResults = await Promise.all(targetMeetings.map(item => getMeeting(item.id)))

    meetingDetails.value = detailResults.map(result => mapMeetingToViewModel(result.data))
  }
  catch (error) {
    meetingDetails.value = []
    showSnackbar(
      isCoreForbiddenError(error)
        ? 'Tài khoản hiện tại không có quyền truy cập dữ liệu cuộc họp.'
        : getCoreErrorMessage(error, 'Không thể tải dữ liệu quản trị cuộc họp.'),
      'error',
    )
  }
  finally {
    isLoading.value = false
  }
}

const refreshPageData = async () => {
  await loadReferenceData()
  await loadChildRows()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedMeetingId.value = undefined
  selectedStatus.value = undefined
}

const openCreateDialog = () => {
  editedChildItem.value = selectedMeetingId.value ? { meetingId: selectedMeetingId.value } : null
  isChildViewMode.value = false
  isChildDialogVisible.value = true
}

const openEditDialog = item => {
  editedChildItem.value = { ...item }
  isChildViewMode.value = false
  isChildDialogVisible.value = true
}

const openViewDialog = item => {
  editedChildItem.value = { ...item }
  isChildViewMode.value = true
  isChildDialogVisible.value = true
}

const handleSaveChild = async formData => {
  const targetMeetingId = Number(formData.meetingId)

  if (!targetMeetingId) {
    showSnackbar('Vui lòng chọn cuộc họp.', 'warning')

    return
  }

  const payload = sanitizeChildPayload(formData)

  if (formData.id)
    await updateMeetingChild(targetMeetingId, activeChildConfig.value.key, formData.id, payload)
  else
    await createMeetingChild(targetMeetingId, activeChildConfig.value.key, payload)

  isChildDialogVisible.value = false
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await loadChildRows()
  showSnackbar(formData.id ? 'Đã cập nhật dữ liệu.' : 'Đã thêm mới dữ liệu.')
}

const requestDeleteItem = item => {
  pendingDeleteItem.value = item
  isDeleteDialogVisible.value = true
}

const confirmDelete = async isConfirmed => {
  if (!isConfirmed || !pendingDeleteItem.value)
    return

  await deleteMeetingChild(pendingDeleteItem.value.meetingId, activeChildConfig.value.key, pendingDeleteItem.value.id)
  selectedRows.value = selectedRows.value.filter(rowKey => rowKey !== pendingDeleteItem.value?.rowKey)
  pendingDeleteItem.value = null
  await loadChildRows()
  showSnackbar('Đã xóa dữ liệu.')
}

const requestBulkAction = action => {
  if (!action || !selectedRows.value.length)
    return

  const targetItems = allChildRows.value.filter(item => selectedRows.value.includes(item.rowKey))

  if (!targetItems.length)
    return

  pendingStatusAction.value = {
    action,
    items: targetItems,
  }

  if (action === 'delete')
    isDeleteDialogVisible.value = true
  else
    isStatusDialogVisible.value = true
}

const confirmBulkDelete = async isConfirmed => {
  if (!isConfirmed || !pendingStatusAction.value?.items?.length)
    return

  await Promise.all(
    pendingStatusAction.value.items.map(item => deleteMeetingChild(item.meetingId, activeChildConfig.value.key, item.id)),
  )
  pendingStatusAction.value = null
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await loadChildRows()
  showSnackbar('Đã xóa các dữ liệu đã chọn.')
}

const confirmStatusChange = async isConfirmed => {
  if (!isConfirmed || !pendingStatusAction.value?.items?.length)
    return

  await Promise.all(
    pendingStatusAction.value.items.map(item => updateMeetingChild(item.meetingId, activeChildConfig.value.key, item.id, { status: pendingStatusAction.value.action })),
  )
  pendingStatusAction.value = null
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await loadChildRows()
  showSnackbar('Đã cập nhật trạng thái dữ liệu.')
}

const handleExport = scope => {
  const selectedItems = allChildRows.value.filter(item => selectedRows.value.includes(item.rowKey))

  if (scope === 'selected') {
    exportRowsToWorkbook(selectedItems)
    showSnackbar('Đã xuất dữ liệu.')

    return
  }

  if (scope === 'page') {
    exportRowsToWorkbook(paginatedRows.value)
    showSnackbar('Đã xuất dữ liệu.')

    return
  }

  exportRowsToWorkbook(filteredChildRows.value)
  showSnackbar('Đã xuất dữ liệu.')
}

const handleImport = async file => {
  const rows = await readWorkbookRows(file)

  if (!rows.length) {
    showSnackbar('Tệp nhập không có dữ liệu.', 'warning')

    return
  }

  for (const row of rows) {
    const meetingId = normalizeImportedChildValue('meeting_id', row.meeting_id ?? row.meetingId ?? selectedMeetingId.value)

    if (!meetingId)
      continue

    const payload = activeChildConfig.value.fields.reduce((acc, field) => {
      const importedValue = normalizeImportedChildValue(field, row[field])

      if (importedValue !== undefined)
        acc[field] = importedValue

      return acc
    }, {})

    const fallbackValue = row.title || row.name || row.content || row.position

    if (!payload[activeChildConfig.value.requiredField] && fallbackValue)
      payload[activeChildConfig.value.requiredField] = fallbackValue

    if (!payload[activeChildConfig.value.requiredField])
      continue

    await createMeetingChild(meetingId, activeChildConfig.value.key, payload)
  }

  await loadChildRows()
  showSnackbar('Đã nhập dữ liệu.')
}

watch([searchQuery, selectedMeetingId, selectedStatus], () => {
  page.value = 1
  selectedRows.value = []
  selectedBulkAction.value = undefined
})

watch(() => route.fullPath, async () => {
  searchQuery.value = ''
  selectedMeetingId.value = undefined
  selectedStatus.value = undefined
  selectedRows.value = []
  selectedBulkAction.value = undefined
  await refreshPageData()
})

onMounted(async () => {
  hydratePendingSnackbar()
  await refreshPageData()
})
</script>

<template>
  <section>
    <VCard>
      <VCardItem class="pb-4">
        <VCardTitle>{{ pageTitle }}</VCardTitle>
        <VCardSubtitle>{{ pageDescription }}</VCardSubtitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="searchQuery"
              :placeholder="`Tìm kiếm ${activeChildConfig.title.toLowerCase()}`"
              prepend-inner-icon="tabler-search"
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="selectedMeetingId"
              placeholder="Cuộc họp"
              :items="meetingItems"
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
              :items="activeChildConfig.statusOptions ?? []"
              clearable
              clear-icon="tabler-x"
              :disabled="!(activeChildConfig.statusOptions?.length)"
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
          @update:model-value="requestBulkAction"
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
            <span v-if="!$vuetify.display.smAndDown">Nhập dữ liệu</span>
          </VBtn>

          <VBtn
            variant="tonal"
            color="secondary"
            :icon="$vuetify.display.smAndDown ? 'tabler-upload' : undefined"
            :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-upload'"
            @click="isExportDialogVisible = true"
          >
            <span v-if="!$vuetify.display.smAndDown">Xuất dữ liệu</span>
          </VBtn>

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
        :items="paginatedRows"
        item-value="rowKey"
        :items-length="filteredChildRows.length"
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
            <span class="font-weight-medium text-high-emphasis">{{ resolveChildPrimaryText(item) }}</span>
            <span class="text-sm text-medium-emphasis">{{ resolveChildSecondaryText(item) }}</span>
          </div>
        </template>

        <template #item.meeting="{ item }">
          <div class="d-flex flex-column">
            <RouterLink
              :to="{ name: 'apps-meetings-detail', params: { id: item.meetingId } }"
              class="font-weight-medium text-link"
            >
              {{ item.meetingTitle }}
            </RouterLink>
            <span class="text-sm text-medium-emphasis">{{ item.meetingCode || `#${item.meetingId}` }}</span>
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

        <template #item.status="{ item }">
          <div class="d-flex align-center justify-center">
            <VChip
              v-if="item.status"
              size="small"
              label
              :color="resolveChildStatusColor(item)"
            >
              {{ resolveChildStatusTitle(item) }}
            </VChip>
            <span v-else>N/A</span>
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

            <IconBtn @click="requestDeleteItem(item)">
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
                {{ paginationMeta({ page, itemsPerPage }, filteredChildRows.length) }}
              </p>

              <VPagination
                :model-value="page"
                active-color="primary"
                :length="Math.max(Math.ceil(filteredChildRows.length / itemsPerPage), 1)"
                :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.max(Math.ceil(filteredChildRows.length / itemsPerPage), 1), 5)"
                @update:model-value="page = $event"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <MeetingChildEditorDialog
      v-model:is-dialog-visible="isChildDialogVisible"
      :child-config="activeChildConfig"
      :child-item="editedChildItem"
      :is-read-only="isChildViewMode"
      :meeting-items="meetingItems"
      :lock-meeting="Boolean(editedChildItem?.id)"
      :select-items="childSelectItems"
      @save="handleSaveChild"
    />

    <MeetingImportDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      :dialog-title="`Nhập dữ liệu ${activeChildConfig.title.toLowerCase()}`"
      :alert-text="`Hỗ trợ .xlsx, .xls, .csv. Cột bắt buộc: meeting_id, ${activeChildConfig.requiredField}. Có thể dùng các cột: ${activeChildConfig.fields.join(', ')}.`"
      @import="handleImport"
    />

    <MeetingExportDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      :dialog-title="`Xuất dữ liệu ${activeChildConfig.title.toLowerCase()}`"
      alert-text="Dữ liệu sẽ được xuất theo từng dòng và gắn kèm thông tin cuộc họp."
      :selected-count="selectedRows.length"
      :scope-options="exportScopeOptions"
      @export="handleExport"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      confirmation-question="Bạn chắc chắn muốn xóa dữ liệu đã chọn?"
      confirm-title="Đã xóa"
      confirm-msg="Dữ liệu đã được xóa."
      cancel-title="Đã hủy"
      cancel-msg="Dữ liệu được giữ nguyên."
      @confirm="pendingStatusAction?.action === 'delete' ? confirmBulkDelete($event) : confirmDelete($event)"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isStatusDialogVisible"
      confirmation-question="Bạn chắc chắn muốn cập nhật trạng thái dữ liệu đã chọn?"
      confirm-title="Đã cập nhật"
      confirm-msg="Trạng thái dữ liệu đã được cập nhật."
      cancel-title="Đã hủy"
      cancel-msg="Trạng thái dữ liệu được giữ nguyên."
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
