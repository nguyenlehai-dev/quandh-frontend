<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import MeetingAttendeesTab from '@/modules/meetings/components/tabs/MeetingAttendeesTab.vue'
import MeetingConclusionsTab from '@/modules/meetings/components/tabs/MeetingConclusionsTab.vue'
import MeetingDocumentsTab from '@/modules/meetings/components/tabs/MeetingDocumentsTab.vue'
import MeetingVotesTab from '@/modules/meetings/components/tabs/MeetingVotesTab.vue'
import { createMeeting, fetchMeeting, updateMeeting } from '@/modules/meetings/services/meetingService'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isEditMode = computed(() => !!route.params.id)

const loading = ref(false)
const formData = ref({
  title: '',
  description: '',
  room_name: '',
  location: '',
  start_at: '',
  end_at: '',
  status: 'draft',
  agendas: [],
  attendees: [],
})

const fetchMeetingDetails = async () => {
  loading.value = true
  try {
    const res = await fetchMeeting(route.params.id)
    if (res.data) {
      const formatToInput = dateStr => {
        if (!dateStr) return ''
        const parts = dateStr.split(' ')
        if (parts.length !== 2) return dateStr
        const timePart = parts[0]
        const datePart = parts[1].split('/')
        if (datePart.length !== 3) return dateStr

        return `${datePart[2]}-${datePart[1]}-${datePart[0]}T${timePart.slice(0, 5)}`
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
  }
  catch (err) {
    console.error('Lỗi khi tải dữ liệu cuộc họp', err)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEditMode.value) {
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

const submitForm = async () => {
  loading.value = true
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

    if (isEditMode.value) {
      await updateMeeting(route.params.id, payload)
    }
    else {
      await createMeeting(payload)
    }
    router.push({ name: 'meetings-list' })
  }
  catch (err) {
    console.error('Lỗi khi lưu cuộc họp', err)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon
          variant="text"
          size="small"
          :to="{ name: 'meetings-list' }"
        >
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <h4 class="text-h4 font-weight-bold">
          {{ isEditMode ? 'Chỉnh sửa cuộc họp' : 'Thêm mới cuộc họp' }}
        </h4>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-plus"
          @click="submitForm"
          :loading="loading"
        >
          Lưu & Thêm
        </VBtn>
        <VBtn
          variant="outlined"
          color="warning"
          prepend-icon="tabler-pencil"
          @click="submitForm"
          :loading="loading"
        >
          Lưu & Sửa
        </VBtn>
        <VBtn
          color="success"
          prepend-icon="tabler-check"
          @click="submitForm"
          :loading="loading"
        >
          Lưu & Thoát
        </VBtn>
      </div>
    </div>

    <VCardText
      v-if="loading && isEditMode"
      class="text-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="48"
      />
    </VCardText>

    <VForm
      v-else
      @submit.prevent="submitForm"
    >
      <!-- Section 1: Thông tin chung + Địa điểm & Trạng thái -->
      <VRow>
        <VCol
          cols="12"
          lg="8"
        >
          <div class="meeting-section-card mb-6">
            <div class="meeting-section-header">
              <div class="meeting-section-title">
                <VIcon
                  icon="tabler-info-circle"
                  class="section-icon"
                />
                Thông tin chung
              </div>
            </div>
            <div class="pa-5 text-body-2 text-disabled mb-n2">
              Các thông tin cơ bản về cuộc họp
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
                  <AppTextField
                    v-model="formData.start_at"
                    type="datetime-local"
                    placeholder="Chọn ngày"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-body-2 font-weight-medium mb-1">
                    Ngày kết thúc (*)
                  </div>
                  <AppTextField
                    v-model="formData.end_at"
                    type="datetime-local"
                    placeholder="Chọn ngày"
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
          <div class="meeting-section-card mb-6">
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
                  { title: 'Đã lên lịch', value: 'scheduled' },
                  { title: 'Đang diễn ra', value: 'active' },
                  { title: 'Đã kết thúc', value: 'completed' },
                ]"
                placeholder="Đang diễn ra"
              />
            </div>
          </div>
        </VCol>
      </VRow>

      <!-- Section 2: Tài liệu đính kèm (Edit mode only) -->
      <div
        v-if="isEditMode"
        class="meeting-section-card mb-6"
      >
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
            Thêm
          </VBtn>
        </div>
        <div class="pa-5">
          <MeetingDocumentsTab :meetingId="route.params.id" />
        </div>
      </div>

      <!-- Section 3: Chương trình cuộc họp -->
      <div class="meeting-section-card mb-6">
        <div class="meeting-section-header">
          <div class="meeting-section-title">
            <VIcon
              icon="tabler-list-details"
              class="section-icon"
              style="color: #3b82f6;"
            />
            Chương trình cuộc họp
          </div>
          <div class="text-body-2 text-disabled">
            Nội dung chi tiết agenda
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
                  <AppTextField
                    v-model="agenda.start_time"
                    type="time"
                    density="compact"
                    placeholder="Chọn giờ"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <div class="text-caption text-disabled mb-1">
                    Kết thúc
                  </div>
                  <AppTextField
                    v-model="agenda.end_time"
                    type="time"
                    density="compact"
                    placeholder="Chọn giờ"
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

      <!-- Section 4: Thành phần tham dự -->
      <div class="meeting-section-card mb-6">
        <div class="meeting-section-header">
          <div class="meeting-section-title">
            <VIcon
              icon="tabler-users-group"
              class="section-icon"
              style="color: #8b5cf6;"
            />
            Thành phần tham dự
          </div>
          <div class="text-body-2 text-disabled">
            Nhập danh sách đại biểu tham dự
          </div>
        </div>

        <div
          v-if="isEditMode"
          class="pa-5"
        >
          <MeetingAttendeesTab :meetingId="route.params.id" />
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
    </VForm>
  </div>
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
</style>
