<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import MeetingChildEditorDialog from '@/modules/meeting/components/MeetingChildEditorDialog.vue'
import MeetingEditorDialog from '@/modules/meeting/components/MeetingEditorDialog.vue'
import { MEETING_CHILD_TABS, MEETING_STATUS_OPTIONS, getOptionColor, getOptionTitle } from '@/modules/meeting/configs/meetingOptions'
import {
  createMeetingChild,
  deleteMeetingChild,
  getMeeting,
  getMeetingPublicOptions,
  regenerateMeetingQrToken,
  updateMeeting,
  updateMeetingChild,
} from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel, toMeetingPayload } from '@/modules/meeting/utils/meetingAdapters'

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const meetingId = computed(() => route.params.id)
const meeting = ref(null)
const meetingTypes = ref([])
const activeTab = ref('participants')
const isLoading = ref(false)
const isEditorDialogVisible = ref(false)
const isChildDialogVisible = ref(false)
const isChildDeleteDialogVisible = ref(false)
const editedChildItem = ref(null)
const pendingChildDelete = ref(null)

const activeChildConfig = computed(() => MEETING_CHILD_TABS.find(item => item.key === activeTab.value) ?? MEETING_CHILD_TABS[0])
const meetingTypeItems = computed(() => meetingTypes.value.map(item => ({
  title: item.name ?? item.title,
  value: item.id ?? item.value,
})))

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
  try {
    const response = await getMeetingPublicOptions('meeting-types')

    meetingTypes.value = response.data ?? []
  }
  catch {
    meetingTypes.value = []
  }
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

const openCreateChildDialog = () => {
  editedChildItem.value = null
  isChildDialogVisible.value = true
}

const openEditChildDialog = item => {
  editedChildItem.value = { ...item }
  isChildDialogVisible.value = true
}

const sanitizeChildPayload = payload => Object.entries(payload).reduce((acc, [key, value]) => {
  if (key === 'id' || value === '' || value === undefined)
    return acc

  acc[key] = value

  return acc
}, {})

const handleSaveChild = async formData => {
  const payload = sanitizeChildPayload(formData)

  if (formData.id)
    await updateMeetingChild(meetingId.value, activeChildConfig.value.key, formData.id, payload)
  else
    await createMeetingChild(meetingId.value, activeChildConfig.value.key, payload)

  isChildDialogVisible.value = false
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

  await deleteMeetingChild(meetingId.value, activeChildConfig.value.key, pendingChildDelete.value.id)
  pendingChildDelete.value = null
  await loadMeeting()
  showSnackbar('Đã xóa dữ liệu chi tiết.')
}

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
          prepend-icon="tabler-qrcode"
          :disabled="!meeting"
          @click="handleRegenerateQrToken"
        >
          Tạo lại QR
        </VBtn>

        <VBtn
          prepend-icon="tabler-pencil"
          :disabled="!meeting"
          @click="isEditorDialogVisible = true"
        >
          Cập nhật
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
                  {{ meeting.startAt || 'N/A' }} -> {{ meeting.endAt || 'N/A' }}
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
            <div class="text-sm text-medium-emphasis mb-2">
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
          <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4">
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

            <VBtn
              prepend-icon="tabler-plus"
              @click="openCreateChildDialog"
            >
              Thêm mới
            </VBtn>
          </VCardText>

          <VDivider />

          <VDataTable
            :headers="childHeaders"
            :items="childRows"
            item-value="id"
            class="text-no-wrap"
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
      @save="handleSaveChild"
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
