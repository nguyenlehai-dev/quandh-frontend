<script setup>
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
const currentTab = ref('general')

const loading = ref(false)
const formData = ref({
  title: '',
  description: '',
  room_name: '', // Keeping empty as fallback, though API uses location
  location: '',
  start_at: '',
  end_at: '',
  status: 'draft',
  agendas: [],
})

const fetchMeetingDetails = async () => {
  loading.value = true
  try {
    const res = await fetchMeeting(route.params.id)
    if (res.data) {
      // Convert "08:00:00 01/04/2026" to "2026-04-01T08:00"
      const formatToInput = (dateStr) => {
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
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu cuộc họp', err)
  } finally {
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
  })
}

const removeAgendaItem = (index) => {
  formData.value.agendas.splice(index, 1)
}

const submitForm = async () => {
  loading.value = true
  try {
    // Format back to YYYY-MM-DD HH:mm:ss for backend
    const formatToBackend = (datetimeLocal) => {
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
    } else {
      await createMeeting(payload)
    }
    router.push({ name: 'meetings-list' })
  } catch (err) {
    console.error('Lỗi khi lưu cuộc họp', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Tabs Navigation -->
    <VTabs
      v-model="currentTab"
      class="v-tabs-pill mb-6"
    >
      <VTab value="general">Thông tin chung</VTab>
      <VTab value="attendees" :disabled="!isEditMode">Người dự họp</VTab>
      <VTab value="documents" :disabled="!isEditMode">Tài liệu</VTab>
      <VTab value="votes" :disabled="!isEditMode">Biểu quyết</VTab>
      <VTab value="conclusions" :disabled="!isEditMode">Kết luận</VTab>
    </VTabs>

    <VWindow
      v-model="currentTab"
      class="mt-6 disable-tab-transition"
      :touch="false"
    >
      <!-- Tab Thông tin chung -->
      <VWindowItem value="general">
        <VCard :title="isEditMode ? 'Chỉnh sửa Cuộc họp' : 'Tạo mới Cuộc họp'">
          <VCardText v-if="loading" class="text-center pa-5">
            <VProgressCircular indeterminate color="primary" />
          </VCardText>
          
          <VCardText v-else>
          <VForm @submit.prevent="submitForm">
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.title"
                  label="Tên cuộc họp"
                  placeholder="Nhập tên cuộc họp"
                  required
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.location"
                  label="Phòng họp (Location)"
                  placeholder="Nhập tên/địa điểm phòng họp"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.start_at"
                  label="Thời gian bắt đầu"
                  type="datetime-local"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.end_at"
                  label="Thời gian kết thúc"
                  type="datetime-local"
                />
              </VCol>

              <VCol cols="12">
                <AppTextarea
                  v-model="formData.description"
                  label="Mô tả / Nội dung vắn tắt"
                  rows="3"
                />
              </VCol>

              <!-- Agenda Editor -->
              <VCol cols="12">
                <div class="d-flex justify-space-between align-center mt-4 mb-2">
                  <h6 class="text-h6">
                    Chương trình họp (Agenda)
                  </h6>
                  <VBtn
                    size="small"
                    prepend-icon="tabler-plus"
                    @click="addAgendaItem"
                  >
                    Thêm mục
                  </VBtn>
                </div>

                <template v-if="formData.agendas.length > 0">
                  <VCard
                    v-for="(agenda, index) in formData.agendas"
                    :key="index"
                    class="mb-4 bg-var-theme-background border"
                    variant="flat"
                  >
                    <VCardText class="d-flex gap-4 align-start">
                      <div class="flex-grow-1">
                        <AppTextField
                          v-model="agenda.title"
                          label="Tiêu đề mục họp"
                          class="mb-4"
                        />
                        <AppTextField
                          v-model="agenda.duration"
                          label="Thời lượng (phút)"
                          type="number"
                        />
                      </div>
                      <IconBtn
                        color="error"
                        @click="removeAgendaItem(index)"
                      >
                        <VIcon icon="tabler-trash" />
                      </IconBtn>
                    </VCardText>
                  </VCard>
                </template>
                <VAlert
                  v-else
                  type="info"
                  variant="tonal"
                >
                  Chưa có chương trình họp nào. Nhấn "Thêm mục" để bắt đầu.
                </VAlert>
              </VCol>
            </VRow>

            <div class="d-flex gap-4 mt-6">
              <VBtn type="submit" :loading="loading">
                {{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}
              </VBtn>
              <VBtn color="secondary" variant="tonal" :to="{ name: 'meetings-list' }">
                Hủy bỏ
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
      </VWindowItem>

      <!-- Tab Người dự họp -->
      <VWindowItem value="attendees">
        <MeetingAttendeesTab v-if="isEditMode" :meetingId="route.params.id" />
      </VWindowItem>

      <!-- Tab Tài liệu -->
      <VWindowItem value="documents">
        <MeetingDocumentsTab v-if="isEditMode" :meetingId="route.params.id" />
      </VWindowItem>

      <!-- Tab Biểu quyết -->
      <VWindowItem value="votes">
        <MeetingVotesTab v-if="isEditMode" :meetingId="route.params.id" />
      </VWindowItem>

      <!-- Tab Kết luận -->
      <VWindowItem value="conclusions">
        <MeetingConclusionsTab v-if="isEditMode" :meetingId="route.params.id" />
      </VWindowItem>
    </VWindow>
  </div>
</template>
