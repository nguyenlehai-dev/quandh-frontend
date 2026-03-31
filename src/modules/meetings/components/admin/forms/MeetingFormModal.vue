<script setup>
/* eslint-disable camelcase */

import '@/modules/meetings/assets/meeting-styles.css'
import { useActionFeedback } from '@/composables/useActionFeedback'
import MeetingAttendeesTab from '@/modules/meetings/components/admin/tabs/MeetingAttendeesTab.vue'
import MeetingDocumentsTab from '@/modules/meetings/components/admin/tabs/MeetingDocumentsTab.vue'
import { createMeeting, fetchMeeting, updateMeeting } from '@/modules/meetings/services/meetingService'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  meetingId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'update:meetingId',
  'saved',
])

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const isEditMode = computed(() => !!props.meetingId)

const activeTab = ref('general')
const loading = ref(false)
const submittingAction = ref(null)
const { snackbar, showSuccess, showError } = useActionFeedback()

const dateTimeConfig = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
}

const timeConfig = {
  enableTime: true,
  noCalendar: true,
  dateFormat: 'H:i',
}

const initialFormData = {
  title: '',
  description: '',
  room_name: '',
  location: '',
  start_at: '',
  end_at: '',
  status: 'draft',
  agendas: [],
  attendees: [],
}

const formData = ref(JSON.parse(JSON.stringify(initialFormData)))

const fetchMeetingDetails = async () => {
  if (!props.meetingId) {
    formData.value = JSON.parse(JSON.stringify(initialFormData))
    
    return
  }

  loading.value = true
  try {
    const res = await fetchMeeting(props.meetingId)
    if (res.data) {
      const formatToInput = dateStr => {
        if (!dateStr) return ''
        const parts = dateStr.split(' ')
        if (parts.length !== 2) return dateStr
        const timePart = parts[0]
        const datePart = parts[1].split('/')
        if (datePart.length !== 3) return dateStr

        return `${datePart[2]}-${datePart[1]}-${datePart[0]} ${timePart.slice(0, 5)}`
      }

      formData.value = {
        title: res.data.title || '',
        description: res.data.description || '',
        location: res.data.location || '',
        start_at: formatToInput(res.data.start_at),
        end_at: formatToInput(res.data.end_at),
        status: res.data.status || 'draft',
        agendas: res.data.agendas || [],
        attendees: res.data.participants || [],
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu', err)
    showError(err, 'Không thể tải dữ liệu cuộc họp.')
  } finally {
    loading.value = false
  }
}

watch(isDialogVisible, val => {
  if (val) {
    activeTab.value = 'general'
    fetchMeetingDetails()
  }
})

watch(() => props.meetingId, () => {
  if (isDialogVisible.value) {
    fetchMeetingDetails()
  }
})

const addAgendaItem = () => {
  formData.value.agendas.push({
    title: '',
    duration: 0,
    presenter_id: null,
    start_time: '',
    end_time: '',
  })
}

const removeAgendaItem = index => {
  formData.value.agendas.splice(index, 1)
}

const addAttendeeItem = () => {
  formData.value.attendees.push({
    name: '',
    position: '',
    type: 'internal',
  })
}

const removeAttendeeItem = index => {
  formData.value.attendees.splice(index, 1)
}

const submitForm = async actionType => {
  submittingAction.value = actionType
  try {
    const formatToBackend = datetimeLocal => {
      if (!datetimeLocal) return ''
      
      return datetimeLocal.replace('T', ' ') + ':00'
    }

    const payload = {
      ...formData.value,
      start_at: formatToBackend(formData.value.start_at),
      end_at: formatToBackend(formData.value.end_at),
    }

    let savedMeetingId = props.meetingId

    if (isEditMode.value) {
      await updateMeeting(props.meetingId, payload)
      showSuccess('Cập nhật cuộc họp thành công.')
    } else {
      const resp = await createMeeting(payload)

      savedMeetingId = resp.data.id || resp.id
      showSuccess('Tạo cuộc họp thành công.')
    }

    // Refresh parent list
    emit('saved')

    if (actionType === 'save-add') {
      formData.value = JSON.parse(JSON.stringify(initialFormData))
      emit('update:meetingId', null)
      activeTab.value = 'general'
    } else if (actionType === 'save-edit') {
      emit('update:meetingId', savedMeetingId)
    } else {
      isDialogVisible.value = false
    }
  } catch (err) {
    console.error('Lỗi lưu', err)
    showError(err, 'Không thể lưu cuộc họp.')
  } finally {
    submittingAction.value = null
  }
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    max-width="1200"
    persistent
    scrollable
    transition="dialog-bottom-transition"
  >
    <VCard
      class="d-flex flex-column"
      style="height: 90vh;"
    >
      <VCardItem
        class="pb-0 border-b bg-surface"
        style="z-index: 10;"
      >
        <div class="d-flex align-center justify-space-between w-100">
          <VCardTitle class="text-h4 font-weight-bold">
            {{ isEditMode ? 'Chỉnh sửa cuộc họp' : 'Thêm mới cuộc họp' }}
          </VCardTitle>
          <VBtn
            icon
            variant="text"
            color="default"
            size="small"
            @click="isDialogVisible = false"
          >
            <VIcon
              icon="tabler-x"
              size="24"
            />
          </VBtn>
        </div>
        
        <VTabs
          v-model="activeTab"
          class="mt-4"
        >
          <VTab value="general">
            Thông tin chung
          </VTab>
          <VTab value="agenda">
            Chương trình
          </VTab>
          <VTab value="participants">
            Thành phần tham dự
          </VTab>
          <VTab
            v-if="isEditMode"
            value="documents"
          >
            Tài liệu đính kèm
          </VTab>
        </VTabs>
      </VCardItem>

      <VCardText
        class="pa-6"
        style="flex-grow: 1; overflow-y: auto; overflow-x: hidden; background-color: rgb(var(--v-theme-background));"
      >
        <div
          v-if="loading && isEditMode"
          class="d-flex justify-center align-center h-100"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="48"
          />
        </div>
        
        <VWindow
          v-else
          v-model="activeTab"
          :touch="false"
          :transition="false"
          :reverse-transition="false"
        >
          <!-- General Tab -->
          <VWindowItem value="general">
            <VRow>
              <VCol
                cols="12"
                lg="8"
              >
                <div class="meeting-section-card">
                  <div class="meeting-section-header">
                    <div class="meeting-section-title">
                      <VIcon
                        icon="tabler-info-circle"
                        class="section-icon"
                      />
                      Thông tin chung
                    </div>
                  </div>
                  <div class="pa-5">
                    <VRow>
                      <VCol cols="12">
                        <div class="text-body-2 font-weight-medium mb-1">
                          Tên cuộc họp (*)
                        </div>
                        <AppTextField
                          v-model="formData.title"
                          placeholder="Nhập tên cuộc họp"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="6"
                      >
                        <div class="text-body-2 font-weight-medium mb-1">
                          Ngày bắt đầu (*)
                        </div>
                        <AppDateTimePicker
                          v-model="formData.start_at"
                          placeholder="Chọn ngày giờ"
                          :config="dateTimeConfig"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="6"
                      >
                        <div class="text-body-2 font-weight-medium mb-1">
                          Ngày kết thúc (*)
                        </div>
                        <AppDateTimePicker
                          v-model="formData.end_at"
                          placeholder="Chọn ngày giờ"
                          :config="dateTimeConfig"
                        />
                      </VCol>
                      <VCol cols="12">
                        <div class="text-body-2 font-weight-medium mb-1">
                          Nội dung tóm tắt
                        </div>
                        <AppTextarea
                          v-model="formData.description"
                          rows="4"
                          placeholder="Nhập nội dung tóm tắt..."
                        />
                      </VCol>
                    </VRow>
                  </div>
                </div>
              </VCol>

              <VCol
                cols="12"
                lg="4"
              >
                <div class="meeting-section-card">
                  <div class="meeting-section-header">
                    <div class="meeting-section-title">
                      <VIcon
                        icon="tabler-map-pin"
                        class="section-icon"
                        style="color: #f97316;"
                      />
                      Địa điểm & Trạng thái
                    </div>
                  </div>
                  <div class="pa-5">
                    <div class="text-body-2 font-weight-medium mb-1">
                      Địa điểm (*)
                    </div>
                    <AppTextField
                      v-model="formData.location"
                      placeholder="Phòng họp giao ban"
                      class="mb-5"
                    />
                    <div class="text-body-2 font-weight-medium mb-1">
                      Trạng thái
                    </div>
                    <AppSelect
                      v-model="formData.status"
                      :items="[
                        { title: 'Bản nháp', value: 'draft' },
                        { title: 'Kích hoạt', value: 'active' },
                        { title: 'Đang diễn ra', value: 'in_progress' },
                        { title: 'Đã kết thúc', value: 'completed' },
                      ]"
                      placeholder="Đang diễn ra"
                    />
                  </div>
                </div>
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- Agenda Tab -->
          <VWindowItem value="agenda">
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-list-details"
                    class="section-icon"
                    style="color: #3b82f6;"
                  />
                  Chương trình cuộc họp
                </div>
              </div>
              <div class="pa-5">
                <VBtn
                  class="mb-4"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-plus"
                  @click="addAgendaItem"
                >
                  Thêm Chương Trình
                </VBtn>

                <template v-if="formData.agendas.length > 0">
                  <div
                    v-for="(agenda, index) in formData.agendas"
                    :key="index"
                    class="agenda-edit-row"
                  >
                    <div class="agenda-edit-number">
                      {{ index + 1 }}
                    </div>
                    <VRow class="flex-grow-1">
                      <VCol
                        cols="12"
                        md="3"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Bắt đầu
                        </div>
                        <AppDateTimePicker
                          v-model="agenda.start_time"
                          density="compact"
                          placeholder="Chọn giờ"
                          :config="timeConfig"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="3"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Kết thúc
                        </div>
                        <AppDateTimePicker
                          v-model="agenda.end_time"
                          density="compact"
                          placeholder="Chọn giờ"
                          :config="timeConfig"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="3"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Nội dung
                        </div>
                        <AppTextField
                          v-model="agenda.title"
                          density="compact"
                          placeholder="Nhập nội dung..."
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="3"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Người phụ trách
                        </div>
                        <AppTextField
                          v-model="agenda.presenter_name"
                          density="compact"
                          placeholder="Tên người PT"
                        />
                      </VCol>
                    </VRow>
                    <IconBtn
                      color="error"
                      @click="removeAgendaItem(index)"
                    >
                      <VIcon icon="tabler-trash" />
                    </IconBtn>
                  </div>
                </template>

                <VAlert
                  v-else
                  type="info"
                  variant="tonal"
                >
                  Chưa có chương trình họp. Nhấn "Thêm Chương Trình" để bắt đầu.
                </VAlert>
              </div>
            </div>
          </VWindowItem>

          <!-- Participants Tab -->
          <VWindowItem value="participants">
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-users-group"
                    class="section-icon"
                    style="color: #8b5cf6;"
                  />
                  Thành phần tham dự
                </div>
              </div>

              <div
                v-if="isEditMode"
                class="pa-5"
              >
                <MeetingAttendeesTab :meeting-id="props.meetingId" />
              </div>

              <div
                v-else
                class="pa-5"
              >
                <VBtn
                  class="mb-4"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-plus"
                  @click="addAttendeeItem"
                >
                  Thêm Người
                </VBtn>

                <template v-if="formData.attendees.length > 0">
                  <div
                    v-for="(attendee, index) in formData.attendees"
                    :key="index"
                    class="agenda-edit-row"
                  >
                    <div class="agenda-edit-number">
                      {{ index + 1 }}
                    </div>
                    <VRow class="flex-grow-1">
                      <VCol
                        cols="12"
                        md="4"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Họ và tên
                        </div>
                        <AppTextField
                          v-model="attendee.name"
                          density="compact"
                          placeholder="Ví dụ: Nguyễn Văn A"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="4"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Chức vụ / Vị trí
                        </div>
                        <AppSelect
                          v-model="attendee.position"
                          :items="[
                            { title: 'Chủ tọa', value: 'chairperson' },
                            { title: 'Thư ký', value: 'secretary' },
                            { title: 'Đại biểu', value: 'member' },
                            { title: 'Khách mời', value: 'guest' },
                          ]"
                          density="compact"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="4"
                      >
                        <div class="text-caption text-disabled mb-1">
                          Kiểu đại biểu
                        </div>
                        <AppSelect
                          v-model="attendee.type"
                          :items="[
                            { title: 'Nội bộ', value: 'internal' },
                            { title: 'Khách mời', value: 'external' },
                          ]"
                          density="compact"
                        />
                      </VCol>
                    </VRow>
                    <IconBtn
                      color="error"
                      @click="removeAttendeeItem(index)"
                    >
                      <VIcon icon="tabler-trash" />
                    </IconBtn>
                  </div>
                </template>

                <VAlert
                  v-else
                  type="info"
                  variant="tonal"
                >
                  Chưa có thành phần tham dự. Nhấn "Thêm Người" để bắt đầu.
                </VAlert>
              </div>
            </div>
          </VWindowItem>

          <!-- Documents Tab -->
          <VWindowItem
            v-if="isEditMode"
            value="documents"
          >
            <div class="meeting-section-card">
              <div class="meeting-section-header">
                <div class="meeting-section-title">
                  <VIcon
                    icon="tabler-paperclip"
                    class="section-icon"
                    style="color: #10b981;"
                  />
                  Tài liệu đính kèm
                </div>
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-plus"
                >
                  Thêm Tài Liệu
                </VBtn>
              </div>
              <div class="pa-5">
                <MeetingDocumentsTab :meeting-id="props.meetingId" />
              </div>
            </div>
          </VWindowItem>
        </VWindow>
      </VCardText>
      
      <VCardActions class="border-t bg-surface px-6 py-4">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="!!submittingAction"
          @click="isDialogVisible = false"
        >
          Hủy
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-plus"
          :disabled="!!submittingAction && submittingAction !== 'save-add'"
          :loading="submittingAction === 'save-add'"
          @click="submitForm('save-add')"
        >
          Lưu & Thêm
        </VBtn>
        <VBtn
          variant="outlined"
          color="warning"
          prepend-icon="tabler-pencil"
          :disabled="!!submittingAction && submittingAction !== 'save-edit'"
          :loading="submittingAction === 'save-edit'"
          @click="submitForm('save-edit')"
        >
          Lưu & Sửa
        </VBtn>
        <VBtn
          color="success"
          prepend-icon="tabler-check"
          :disabled="!!submittingAction && submittingAction !== 'save-exit'"
          :loading="submittingAction === 'save-exit'"
          @click="submitForm('save-exit')"
        >
          Lưu & Thoát
        </VBtn>
      </VCardActions>
    </VCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </VDialog>
</template>

<style scoped>
.agenda-edit-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-block-end: 1px solid #f3f4f6;
}

.agenda-edit-row:last-child {
  border-block-end: none;
}

.agenda-edit-number {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 28px;
  block-size: 28px;
  border-radius: 50%;
  background: #f3f0ff;
  color: #7c3aed;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-block-start: 26px;
}

:deep(.v-window) {
  overflow: visible;
}

:deep(.v-window__container) {
  overflow: visible;
}
</style>
