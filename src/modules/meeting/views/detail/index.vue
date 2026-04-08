<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getStoredUserId } from '@/modules/auth/services/authStorage'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingChildEditorDialog from '@/modules/meeting/components/MeetingChildEditorDialog.vue'
import MeetingEditorDialog from '@/modules/meeting/components/MeetingEditorDialog.vue'
import MeetingExportDialog from '@/modules/meeting/components/MeetingExportDialog.vue'
import MeetingImportDialog from '@/modules/meeting/components/MeetingImportDialog.vue'
import { MEETING_CHILD_TABS, MEETING_STATUS_OPTIONS, getOptionColor, getOptionTitle } from '@/modules/meeting/configs/meetingOptions'
import { getCoreUsers } from '@/modules/user-management/services/coreUsers'
import {
  checkInMeetingByQr,
  createMeetingChild,
  deleteMeetingChild,
  getMeeting,
  getMeetingPublicOptions,
  regenerateMeetingQrToken,
  updateMeeting,
  updateMeetingChild,
} from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel, toMeetingPayload } from '@/modules/meeting/utils/meetingAdapters'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const meetingId = computed(() => route.params.id)
const meeting = ref(null)
const meetingTypes = ref([])
const userOptions = ref([])
const activeTab = ref('participants')
const isLoading = ref(false)
const isEditorDialogVisible = ref(false)
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isChildDialogVisible = ref(false)
const isChildViewMode = ref(false)
const isChildDeleteDialogVisible = ref(false)
const editedChildItem = ref(null)
const pendingChildDelete = ref(null)
const selectedChildRows = ref([])
const selectedChildBulkAction = ref()
const qrCodeDataUrl = ref('')
const isGeneratingQr = ref(false)
const isQrScannerDialogVisible = ref(false)
const scannerVideoRef = ref()
const scannerStream = ref(null)
const scannerLoopTimer = ref(null)
const scannerErrorMessage = ref('')
const manualQrInput = ref('')
const isStartingScanner = ref(false)
const isSubmittingCheckIn = ref(false)

const activeChildConfig = computed(() => MEETING_CHILD_TABS.find(item => item.key === activeTab.value) ?? MEETING_CHILD_TABS[0])
const meetingTypeItems = computed(() => meetingTypes.value.map(item => ({
  title: item.name ?? item.title,
  value: item.id ?? item.value,
})))

const childSelectItems = computed(() => ({
  user_id: userOptions.value,
}))

const childRows = computed(() => {
  if (!meeting.value)
    return []

  return (meeting.value[activeChildConfig.value.responseKey] ?? []).map(item => ({
    ...item,
    createdAt: item.createdAt ?? item.created_at ?? 'N/A',
    updatedAt: item.updatedAt ?? item.updated_at ?? 'N/A',
    createdBy: item.createdBy ?? item.created_by_name ?? item.created_by ?? 'N/A',
    updatedBy: item.updatedBy ?? item.updated_by_name ?? item.updated_by ?? 'N/A',
  }))
})

const overviewCards = computed(() => [
  {
    title: 'Người tham dự',
    value: meeting.value?.participantsCount ?? 0,
    icon: 'tabler-users',
    color: 'primary',
  },
  {
    title: 'Chương trình',
    value: meeting.value?.agendasCount ?? 0,
    icon: 'tabler-list-details',
    color: 'info',
  },
  {
    title: 'Tài liệu',
    value: meeting.value?.documentsCount ?? 0,
    icon: 'tabler-files',
    color: 'success',
  },
  {
    title: 'Biểu quyết',
    value: meeting.value?.votingsCount ?? 0,
    icon: 'tabler-chart-bar',
    color: 'warning',
  },
])

const childHeaders = [
  { title: 'STT', key: 'stt', sortable: false, align: 'center' },
  { title: 'TÊN MODULE', key: 'module' },
  { title: 'NGÀY TẠO', key: 'createdAt' },
  { title: 'CẬP NHẬT', key: 'updatedAt' },
  { title: 'TRẠNG THÁI', key: 'status', align: 'center' },
  { title: 'HÀNH ĐỘNG', key: 'actions', sortable: false, align: 'center' },
]

const childBulkActions = computed(() => {
  const statusActions = (activeChildConfig.value.statusOptions ?? []).map(item => ({
    title: `Chuyển ${item.title.toLowerCase()}`,
    value: item.value,
  }))

  return [
    ...statusActions,
    { title: 'Xóa', value: 'delete' },
  ]
})

const childExportScopeOptions = computed(() => {
  const options = [
    { title: 'Toàn bộ dữ liệu đang hiển thị', value: 'page' },
  ]

  if (selectedChildRows.value.length)
    options.unshift({ title: `Dòng đang chọn (${selectedChildRows.value.length})`, value: 'selected' })

  return options
})

const meetingCheckInPayload = computed(() => {
  if (!meeting.value?.qrToken)
    return ''

  return JSON.stringify({
    meeting_id: meeting.value.id,
    qr_token: meeting.value.qrToken,
    type: 'meeting-check-in',
  })
})

const meetingTimeRange = computed(() => {
  if (!meeting.value)
    return 'N/A'

  return `${meeting.value.startAt || 'N/A'} -> ${meeting.value.endAt || 'N/A'}`
})

const currentUserId = computed(() => getStoredUserId())

const loadMeeting = async () => {
  isLoading.value = true

  try {
    const response = await getMeeting(meetingId.value)

    meeting.value = mapMeetingToViewModel(response.data)
  }
  catch (error) {
    showSnackbar(
      isCoreForbiddenError(error)
        ? 'Tài khoản hiện tại không có quyền xem chi tiết cuộc họp.'
        : getCoreErrorMessage(error, 'Không thể tải chi tiết cuộc họp.'),
      'error',
    )
  }
  finally {
    isLoading.value = false
  }
}

const loadReferenceData = async () => {
  const [meetingTypesResult, usersResult] = await Promise.allSettled([
    getMeetingPublicOptions('meeting-types'),
    getCoreUsers({
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
      status: 'active',
    }),
  ])

  meetingTypes.value = meetingTypesResult.status === 'fulfilled'
    ? (meetingTypesResult.value.data ?? [])
    : []

  userOptions.value = usersResult.status === 'fulfilled'
    ? (usersResult.value.data ?? []).map(item => ({
        title: `${item.name} (${item.email})`,
        value: item.id,
      }))
    : []
}

const handleSaveMeeting = async formData => {
  await updateMeeting(formData.id, toMeetingPayload(formData))
  isEditorDialogVisible.value = false
  await loadMeeting()
  showSnackbar('Đã cập nhật cuộc họp.')
}

const handleRegenerateQrToken = async () => {
  await regenerateMeetingQrToken(meetingId.value)
  await loadMeeting()
  showSnackbar('Đã tạo lại QR token.')
}

const generateQrCode = async () => {
  if (!meetingCheckInPayload.value) {
    qrCodeDataUrl.value = ''

    return
  }

  isGeneratingQr.value = true

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(meetingCheckInPayload.value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    })
  }
  catch {
    qrCodeDataUrl.value = ''
  }
  finally {
    isGeneratingQr.value = false
  }
}

const handleCopyQrToken = async () => {
  if (!meeting.value?.qrToken)
    return

  try {
    await navigator.clipboard.writeText(meeting.value.qrToken)
    showSnackbar('Đã sao chép QR token.')
  }
  catch {
    showSnackbar('Không thể sao chép QR token.', 'error')
  }
}

const stopQrScanner = () => {
  if (scannerLoopTimer.value) {
    window.clearTimeout(scannerLoopTimer.value)
    scannerLoopTimer.value = null
  }

  scannerStream.value?.getTracks()?.forEach(track => track.stop())
  scannerStream.value = null
}

const extractQrToken = rawValue => {
  if (!rawValue)
    return ''

  try {
    const parsedValue = JSON.parse(rawValue)

    return parsedValue?.qr_token ?? rawValue
  }
  catch {
    return rawValue
  }
}

const submitMeetingCheckIn = async rawValue => {
  const qrToken = extractQrToken(rawValue).trim()

  if (!qrToken) {
    showSnackbar('Không đọc được QR token.', 'error')

    return
  }

  isSubmittingCheckIn.value = true

  try {
    await checkInMeetingByQr({
      qr_token: qrToken,
      user_id: currentUserId.value ?? undefined,
    })
    stopQrScanner()
    isQrScannerDialogVisible.value = false
    manualQrInput.value = ''
    activeTab.value = 'participants'
    await loadMeeting()
    showSnackbar('Check-in thành công. Trạng thái người dự họp đã được cập nhật.')
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, 'Không thể check-in bằng QR.'), 'error')
  }
  finally {
    isSubmittingCheckIn.value = false
  }
}

const scanQrFrame = async detector => {
  if (!isQrScannerDialogVisible.value || !scannerVideoRef.value)
    return

  try {
    const barcodes = await detector.detect(scannerVideoRef.value)

    if (barcodes.length) {
      await submitMeetingCheckIn(barcodes[0].rawValue)

      return
    }
  }
  catch {
    scannerErrorMessage.value = 'Không thể đọc QR từ camera hiện tại.'
  }

  scannerLoopTimer.value = window.setTimeout(() => {
    scanQrFrame(detector)
  }, 350)
}

const startQrScanner = async () => {
  if (!isQrScannerDialogVisible.value)
    return

  stopQrScanner()

  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    scannerErrorMessage.value = 'Trình duyệt hiện tại không hỗ trợ mở camera.'

    return
  }

  if (typeof window.BarcodeDetector === 'undefined') {
    scannerErrorMessage.value = 'Trình duyệt hiện tại chưa hỗ trợ quét QR trực tiếp. Bạn có thể dán QR token để check-in.'

    return
  }

  isStartingScanner.value = true
  scannerErrorMessage.value = ''

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
      },
      audio: false,
    })

    scannerStream.value = stream

    await nextTick()

    if (!scannerVideoRef.value) {
      scannerErrorMessage.value = 'Không thể khởi tạo khung quét QR.'

      return
    }

    scannerVideoRef.value.srcObject = stream
    await scannerVideoRef.value.play()

    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    await scanQrFrame(detector)
  }
  catch {
    scannerErrorMessage.value = 'Không thể mở camera để quét QR.'
  }
  finally {
    isStartingScanner.value = false
  }
}

const openQrScannerDialog = async () => {
  manualQrInput.value = ''
  scannerErrorMessage.value = ''
  isQrScannerDialogVisible.value = true
  await nextTick()
  await startQrScanner()
}

const closeQrScannerDialog = () => {
  isQrScannerDialogVisible.value = false
}

const openCreateChildDialog = () => {
  editedChildItem.value = null
  isChildViewMode.value = false
  isChildDialogVisible.value = true
}

const openEditChildDialog = item => {
  editedChildItem.value = { ...item }
  isChildViewMode.value = false
  isChildDialogVisible.value = true
}

const openViewChildDialog = item => {
  editedChildItem.value = { ...item }
  isChildViewMode.value = true
  isChildDialogVisible.value = true
}

const sanitizeChildPayload = payload => Object.entries(payload).reduce((acc, [key, value]) => {
  if (key === 'id' || value === '' || value === undefined)
    return acc

  acc[key] = value

  return acc
}, {})

const handleSaveChild = async formData => {
  if (isChildViewMode.value) {
    isChildDialogVisible.value = false

    return
  }

  const payload = sanitizeChildPayload(formData)

  if (formData.id)
    await updateMeetingChild(meetingId.value, activeChildConfig.value.key, formData.id, payload)
  else
    await createMeetingChild(meetingId.value, activeChildConfig.value.key, payload)

  isChildDialogVisible.value = false
  selectedChildRows.value = []
  selectedChildBulkAction.value = undefined
  await loadMeeting()
  showSnackbar(formData.id ? 'Đã cập nhật dữ liệu chi tiết.' : 'Đã thêm dữ liệu chi tiết.')
}

const requestDeleteChild = item => {
  pendingChildDelete.value = item
  isChildDeleteDialogVisible.value = true
}

const confirmDeleteChild = async isConfirmed => {
  if (!isConfirmed || !pendingChildDelete.value)
    return

  const deletedId = pendingChildDelete.value.id

  await deleteMeetingChild(meetingId.value, activeChildConfig.value.key, deletedId)
  pendingChildDelete.value = null
  selectedChildRows.value = selectedChildRows.value.filter(id => id !== deletedId)
  await loadMeeting()
  showSnackbar('Đã xóa dữ liệu chi tiết.')
}

const handleChildBulkAction = async action => {
  if (!action || !selectedChildRows.value.length)
    return

  const targetIds = [...selectedChildRows.value]

  if (action === 'delete') {
    await Promise.all(targetIds.map(id => deleteMeetingChild(meetingId.value, activeChildConfig.value.key, id)))
    showSnackbar('Đã xóa các dữ liệu chi tiết đã chọn.')
  }
  else {
    await Promise.all(targetIds.map(id => updateMeetingChild(meetingId.value, activeChildConfig.value.key, id, { status: action })))
    showSnackbar('Đã cập nhật trạng thái cho các dữ liệu đã chọn.')
  }

  selectedChildRows.value = []
  selectedChildBulkAction.value = undefined
  await loadMeeting()
}

const exportChildRowsToWorkbook = (rows, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(item => {
    const baseRow = {
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
  XLSX.writeFileXLSX(workbook, fileName)
}

const handleExportChildren = async scope => {
  const rows = scope === 'selected'
    ? childRows.value.filter(item => selectedChildRows.value.includes(item.id))
    : childRows.value

  exportChildRowsToWorkbook(rows, `${activeChildConfig.value.key}-${new Date().toISOString().slice(0, 10)}.xlsx`)
  showSnackbar('Đã xuất dữ liệu chi tiết cuộc họp.')
}

const readWorkbookRows = async file => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  return XLSX.utils.sheet_to_json(worksheet, { defval: '' })
}

const normalizeImportedChildValue = value => {
  if (value === '')
    return undefined

  return value
}

const handleImportChildren = async file => {
  const rows = await readWorkbookRows(file)

  if (!rows.length) {
    showSnackbar('Tệp nhập không có dữ liệu.', 'warning')

    return
  }

  for (const row of rows) {
    const payload = activeChildConfig.value.fields.reduce((acc, field) => {
      const importedValue = normalizeImportedChildValue(row[field])

      if (importedValue !== undefined)
        acc[field] = importedValue

      return acc
    }, {})

    const fallbackValue = row.title || row.name || row.content || row.position

    if (!payload[activeChildConfig.value.requiredField] && fallbackValue)
      payload[activeChildConfig.value.requiredField] = fallbackValue

    if (!payload[activeChildConfig.value.requiredField])
      continue

    await createMeetingChild(meetingId.value, activeChildConfig.value.key, payload)
  }

  await loadMeeting()
  showSnackbar('Đã nhập dữ liệu chi tiết cuộc họp.')
}

const resetChildToolbar = async () => {
  selectedChildRows.value = []
  selectedChildBulkAction.value = undefined
  await loadMeeting()
}

watch(activeTab, () => {
  selectedChildRows.value = []
  selectedChildBulkAction.value = undefined
})

watch(meetingCheckInPayload, generateQrCode, { immediate: true })

watch(isQrScannerDialogVisible, isVisible => {
  if (!isVisible) {
    stopQrScanner()
    scannerErrorMessage.value = ''
    manualQrInput.value = ''
  }
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

onMounted(async () => {
  hydratePendingSnackbar()
  await Promise.all([
    loadReferenceData(),
    loadMeeting(),
  ])
})

onBeforeUnmount(() => {
  stopQrScanner()
})
</script>

<template>
  <section>
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <VBtn
          variant="text"
          color="secondary"
          prepend-icon="tabler-arrow-left"
          class="px-0 mb-2"
          @click="router.push({ name: 'apps-meetings' })"
        >
          Danh sách Cuộc họp
        </VBtn>
        <h4 class="text-h4 mb-1">
          {{ meeting?.title || 'Chi tiết cuộc họp' }}
        </h4>
        <p class="text-body-1 mb-0">
          Người quản trị quản lý tổng quan cuộc họp trong màn này.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          :icon="$vuetify.display.smAndDown ? 'tabler-scan' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-scan'"
          :disabled="!meeting?.qrToken"
          @click="openQrScannerDialog"
        >
          <span v-if="!$vuetify.display.smAndDown">Quét check-in</span>
        </VBtn>

        <VBtn
          variant="tonal"
          color="secondary"
          :icon="$vuetify.display.smAndDown ? 'tabler-qrcode' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-qrcode'"
          :disabled="!meeting"
          @click="handleRegenerateQrToken"
        >
          <span v-if="!$vuetify.display.smAndDown">Tạo lại QR</span>
        </VBtn>

        <VBtn
          :icon="$vuetify.display.smAndDown ? 'tabler-pencil' : undefined"
          :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-pencil'"
          :disabled="!meeting"
          @click="isEditorDialogVisible = true"
        >
          <span v-if="!$vuetify.display.smAndDown">Cập nhật</span>
        </VBtn>
      </div>
    </div>

    <VProgressLinear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-6"
    />

    <VRow v-if="meeting">
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="mb-6">
          <VCardText>
            <div class="d-flex flex-wrap align-center justify-space-between gap-4">
              <div>
                <div class="text-sm text-medium-emphasis mb-1">
                  {{ meeting.code || 'Chưa có mã' }} · {{ meeting.meetingTypeName }}
                </div>
                <h5 class="text-h5 mb-2">
                  {{ meeting.title }}
                </h5>
                <div class="text-body-1">
                  {{ meeting.description || 'Chưa có mô tả.' }}
                </div>
              </div>

              <VChip
                label
                :color="getOptionColor(MEETING_STATUS_OPTIONS, meeting.status)"
              >
                {{ getOptionTitle(MEETING_STATUS_OPTIONS, meeting.status) }}
              </VChip>
            </div>
          </VCardText>

          <VDivider />

          <VCardText>
            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-sm text-medium-emphasis">
                  Địa điểm
                </div>
                <div class="text-body-1 text-high-emphasis">
                  {{ meeting.location || 'N/A' }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-sm text-medium-emphasis">
                  Thời gian
                </div>
                <div class="text-body-1 text-high-emphasis">
                  {{ meetingTimeRange }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-sm text-medium-emphasis">
                  Người tạo
                </div>
                <div class="text-body-1 text-high-emphasis">
                  {{ meeting.createdBy }} · {{ meeting.createdAt }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-sm text-medium-emphasis">
                  Người cập nhật
                </div>
                <div class="text-body-1 text-high-emphasis">
                  {{ meeting.updatedBy }} · {{ meeting.updatedAt }}
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-6">
          <VCardText>
            <div class="d-flex align-center justify-space-between gap-3 mb-3">
              <div class="text-sm text-medium-emphasis">
                QR check-in
              </div>

              <VBtn
                variant="tonal"
                color="secondary"
                size="small"
                prepend-icon="tabler-copy"
                :disabled="!meeting.qrToken"
                @click="handleCopyQrToken"
              >
                Sao chép token
              </VBtn>
            </div>

            <div class="d-flex flex-column align-center gap-3">
              <VProgressCircular
                v-if="isGeneratingQr"
                indeterminate
                color="primary"
              />

              <VImg
                v-else-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                width="220"
                height="220"
                cover
                class="rounded border-sm"
              />

              <VAlert
                v-else
                color="warning"
                variant="tonal"
                density="comfortable"
              >
                Chưa có QR để quét.
              </VAlert>

              <div class="text-center text-body-2 text-medium-emphasis">
                Quét mã để lấy payload check-in của cuộc họp hiện tại.
              </div>
            </div>

            <div class="text-sm text-medium-emphasis mt-4 mb-2">
              QR token
            </div>
            <code class="text-wrap">{{ meeting.qrToken || 'Chưa có QR token' }}</code>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        v-for="card in overviewCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <div class="text-body-1 text-high-emphasis">
                {{ card.title }}
              </div>
              <h4 class="text-h4">
                {{ card.value }}
              </h4>
            </div>
            <VAvatar
              :color="card.color"
              variant="tonal"
              rounded
              size="42"
            >
              <VIcon
                :icon="card.icon"
                size="26"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard>
          <VCardText class="pb-2">
            <VTabs v-model="activeTab">
              <VTab
                v-for="tab in MEETING_CHILD_TABS"
                :key="tab.key"
                :value="tab.key"
              >
                <VIcon
                  :icon="tab.icon"
                  size="18"
                  class="me-2"
                />
                {{ tab.title }}
              </VTab>
            </VTabs>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex justify-end flex-wrap gap-4">
            <div class="d-flex align-center justify-end flex-wrap gap-4 w-100">
              <AppSelect
                v-if="selectedChildRows.length"
                v-model="selectedChildBulkAction"
                placeholder="Hành động"
                :items="childBulkActions"
                style="inline-size: 13rem;"
                @update:model-value="handleChildBulkAction"
              />

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
                @click="resetChildToolbar"
              >
                <span v-if="!$vuetify.display.smAndDown">Đặt lại</span>
              </VBtn>

              <VBtn
                :icon="$vuetify.display.smAndDown ? 'tabler-plus' : undefined"
                :prepend-icon="$vuetify.display.smAndDown ? undefined : 'tabler-plus'"
                @click="openCreateChildDialog"
              >
                <span v-if="!$vuetify.display.smAndDown">Thêm mới</span>
              </VBtn>
            </div>
          </VCardText>

          <VDivider />

          <VDataTable
            v-model:model-value="selectedChildRows"
            :headers="childHeaders"
            :items="childRows"
            item-value="id"
            class="text-no-wrap"
            show-select
          >
            <template #item.stt="{ index }">
              <div class="d-flex align-center justify-center">
                {{ index + 1 }}
              </div>
            </template>

            <template #item.module="{ item }">
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-high-emphasis">{{ resolveChildPrimaryText(item) }}</span>
                <span class="text-sm text-medium-emphasis">{{ resolveChildSecondaryText(item) }}</span>
              </div>
            </template>

            <template #item.status="{ item }">
              <div class="d-flex align-center justify-center">
                <VChip
                  size="small"
                  label
                  :color="resolveChildStatusColor(item)"
                >
                  {{ resolveChildStatusTitle(item) }}
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
                <IconBtn @click="openViewChildDialog(item)">
                  <VIcon icon="tabler-eye" />
                </IconBtn>

                <IconBtn @click="openEditChildDialog(item)">
                  <VIcon icon="tabler-pencil" />
                </IconBtn>

                <IconBtn @click="requestDeleteChild(item)">
                  <VIcon icon="tabler-trash" />
                </IconBtn>
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCol>
    </VRow>

    <MeetingEditorDialog
      v-if="meeting"
      v-model:is-dialog-visible="isEditorDialogVisible"
      :meeting="meeting"
      :meeting-types="meetingTypeItems"
      @save="handleSaveMeeting"
    />

    <MeetingChildEditorDialog
      v-model:is-dialog-visible="isChildDialogVisible"
      :child-config="activeChildConfig"
      :child-item="editedChildItem"
      :is-read-only="isChildViewMode"
      :select-items="childSelectItems"
      @save="handleSaveChild"
    />

    <MeetingImportDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      :dialog-title="`Nhập dữ liệu ${activeChildConfig.title.toLowerCase()}`"
      :alert-text="`Hỗ trợ .xlsx, .xls, .csv. Cột bắt buộc: ${activeChildConfig.requiredField}. Có thể dùng các cột: ${activeChildConfig.fields.join(', ')}.`"
      @import="handleImportChildren"
    />

    <MeetingExportDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      :dialog-title="`Xuất dữ liệu ${activeChildConfig.title.toLowerCase()}`"
      alert-text="Dữ liệu chi tiết cuộc họp sẽ được xuất dưới dạng tệp Excel .xlsx."
      :selected-count="selectedChildRows.length"
      :scope-options="childExportScopeOptions"
      @export="handleExportChildren"
    />

    <ConfirmDialog
      v-model:is-dialog-visible="isChildDeleteDialogVisible"
      confirmation-question="Bạn chắc chắn muốn xóa dữ liệu chi tiết này?"
      confirm-title="Đã xóa"
      confirm-msg="Dữ liệu chi tiết đã được xóa."
      cancel-title="Đã hủy"
      cancel-msg="Dữ liệu chi tiết được giữ nguyên."
      @confirm="confirmDeleteChild"
    />

    <VDialog
      v-model="isQrScannerDialogVisible"
      max-width="720"
      persistent
    >
      <VCard title="Quét QR check-in">
        <VCardText>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Quét mã QR của cuộc họp để cập nhật người dùng hiện tại sang trạng thái tham dự.
          </div>

          <div class="border rounded pa-2 mb-4">
            <video
              ref="scannerVideoRef"
              autoplay
              muted
              playsinline
              class="w-100 rounded d-block"
              style="min-block-size: 320px; background: rgb(var(--v-theme-surface-variant)); object-fit: cover;"
            />
          </div>

          <VAlert
            v-if="isStartingScanner"
            color="info"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            Đang khởi tạo camera để quét QR.
          </VAlert>

          <VAlert
            v-if="scannerErrorMessage"
            color="warning"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            {{ scannerErrorMessage }}
          </VAlert>

          <VTextField
            v-model="manualQrInput"
            label="QR token hoặc nội dung QR"
            placeholder="Dán QR token để check-in thủ công"
            prepend-inner-icon="tabler-qrcode"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="justify-end flex-wrap gap-3 pa-4">
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-refresh"
            :loading="isStartingScanner"
            @click="startQrScanner"
          >
            Mở lại camera
          </VBtn>

          <VBtn
            variant="tonal"
            color="secondary"
            @click="closeQrScannerDialog"
          >
            Đóng
          </VBtn>

          <VBtn
            prepend-icon="tabler-check"
            :disabled="!manualQrInput.trim()"
            :loading="isSubmittingCheckIn"
            @click="submitMeetingCheckIn(manualQrInput)"
          >
            Check-in
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

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
