<script setup>
import { fetchMyMeetings as apiFetchMyMeetings } from '@/modules/meetings/services/meetingService'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

const router = useRouter()

const searchQuery = ref('')
const meetings = ref([])
const loading = ref(false)
const refCalendar = ref()

const loadMyMeetings = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    const res = await apiFetchMyMeetings(params)

    let fetchedMeetings = Array.isArray(res.data) ? res.data : (res.data?.data || [])

    meetings.value = fetchedMeetings
  } catch (error) {
    console.error('Lỗi khi tải Lịch họp của tôi', error)
  } finally {
    loading.value = false
  }
}

const resolveStatusColor = status => {
  switch (status) {
  case 'pending': return 'warning'
  case 'in_progress':
  case 'active': return 'success'
  case 'inactive':
  case 'completed': return 'error'
  default: return 'primary'
  }
}

// Parse backend date format "HH:mm:ss DD/MM/YYYY" to ISO for FullCalendar
const parseBackendDate = dateStr => {
  if (!dateStr) return null
  if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')
    if (parts.length !== 2) return dateStr
    const timePart = parts[0]
    const datePart = parts[1].split('/')
    if (datePart.length !== 3) return dateStr

    return `${datePart[2]}-${datePart[1]}-${datePart[0]}T${timePart}`
  }

  return dateStr
}

// Convert Api 'meetings' array to FullCalendar Events format
const calendarOptions = computed(() => {
  const events = meetings.value.map(meeting => {
    return {
      id: meeting.id,
      title: meeting.title,
      start: parseBackendDate(meeting.start_at) || parseBackendDate(meeting.start_time),
      allDay: false,
      extendedProps: {
        status: meeting.status,
        meetingId: meeting.id,
      },
    }
  })

  return {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today',
    },
    events: events,
    forceEventDuration: true,
    editable: false,
    dayMaxEvents: 2,
    navLinks: true,
    contentHeight: 600,
    displayEventTime: true,
    displayEventEnd: false,
    
    // Customize event styling
    eventClassNames({ event: calendarEvent }) {
      const colorName = resolveStatusColor(calendarEvent._def.extendedProps.status)

      return [`bg-light-${colorName} text-${colorName}`]
    },

    // Navigate on Click
    eventClick({ event: clickedEvent, jsEvent }) {
      jsEvent.preventDefault()

      const meetingId = clickedEvent._def.extendedProps.meetingId

      if (meetingId) {
        router.push({ name: 'meetings-participant-details', params: { id: meetingId } })
      }
    },
  }
})

onMounted(() => {
  loadMyMeetings()
})
</script>

<template>
  <VRow class="match-height">
    <!-- Cột Trái: Danh sách Thẻ Lịch Họp -->
    <VCol cols="12">
      <VCard
        title="Danh sách chi tiết Lịch Họp"
        class="h-100"
      >
        <VCardText class="d-flex align-center flex-wrap gap-4">
          <AppTextField
            v-model="searchQuery"
            placeholder="Tìm kiếm lịch họp..."
            density="compact"
            style="max-inline-size: 300px;"
            append-inner-icon="tabler-search"
            @keyup.enter="loadMyMeetings"
          />
          <VSpacer />
          <VBtn
            color="primary"
            variant="tonal"
            @click="loadMyMeetings"
          >
            Làm mới
          </VBtn>
        </VCardText>
        <VDivider />

        <VCardText
          v-if="loading"
          class="text-center pa-5"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </VCardText>

        <VCardText
          v-else-if="meetings.length === 0"
          class="text-center pa-10"
        >
          <VIcon
            icon="tabler-folder-off"
            size="48"
            class="text-disabled mb-2"
          />
          <p class="text-body-1 text-disabled mb-0">
            Bạn hiện không có lịch họp nào.
          </p>
        </VCardText>

        <VCardText
          v-else
          class="scrollable-meetings-list custom-scrollbar"
        >
          <VRow>
            <VCol
              v-for="meeting in meetings"
              :key="meeting.id"
              cols="12"
              sm="6"
            >
              <VCard
                variant="outlined"
                class="h-100 hover-elevation shadow-sm"
              >
                <VCardItem>
                  <template #title>
                    <div class="text-h6 text-primary text-truncate">
                      {{ meeting.title }}
                    </div>
                  </template>
                  <template #subtitle>
                    <div class="d-flex align-center mt-1 gap-2">
                      <VIcon
                        icon="tabler-calendar"
                        size="16"
                      />
                      <span>{{ meeting.start_at || meeting.start_time || 'Chưa xác định' }}</span>
                    </div>
                  </template>
                </VCardItem>
                
                <VCardText class="pt-2">
                  <div class="d-flex align-center gap-2 mb-2">
                    <VIcon
                      icon="tabler-map-pin"
                      size="16"
                      class="text-disabled"
                    />
                    <span class="text-body-2">{{ meeting.location || 'Phòng trực tuyến' }}</span>
                  </div>
                  <div class="text-body-2 text-truncate line-clamp-2 text-medium-emphasis">
                    {{ meeting.description || 'Không có mô tả chi tiết.' }}
                  </div>
                </VCardText>
                
                <VCardActions class="justify-end px-4 pb-4 mt-auto">
                  <VBtn 
                    variant="elevated" 
                    color="primary" 
                    :to="{ name: 'meetings-participant-details', params: { id: meeting.id } }"
                  >
                    Vào phòng họp
                  </VBtn>
                </VCardActions>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Cột Phải: Lịch Sinh Động -->
    <VCol
      cols="12"
      class="mt-4"
    >
      <VCard class="h-100">
        <VCardText>
          <div class="calendar-wrapper">
            <FullCalendar
              ref="refCalendar"
              :options="calendarOptions"
            />
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

// Ensure the calendar styling works properly inside the card
.calendar-wrapper {
  .fc-event {
    cursor: pointer;
  }
}
</style>

<style scoped lang="scss">
.hover-elevation {
  transition: all 0.3s ease;
}

.hover-elevation:hover {
  box-shadow: 0 4px 15px rgb(0 0 0 / 10%) !important;
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.scrollable-meetings-list {
  max-block-size: 500px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Custom scrollbar for webkit */
.custom-scrollbar::-webkit-scrollbar {
  inline-size: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(var(--v-theme-on-surface), 0.2);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--v-theme-on-surface), 0.4);
}

/* Trong bảng lịch, rút ngắn text nếu quá dài */
:deep(.fc-event-title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.fc-event) {
  padding-block: 2px;
  padding-inline: 4px;
}
</style>
