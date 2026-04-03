<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import viLocale from '@fullcalendar/core/locales/vi'
import { fetchMyCalendar } from '@/modules/meetings/services/meetingService'
import '@/modules/meetings/assets/meeting-styles.css'

const router = useRouter()
const isLoading = ref(false)

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locales: [viLocale],
  locale: 'vi',
  headerToolbar: {
    start: 'prev,next,title',
    end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
  },
  events: fetchEvents,
  eventClick: handleEventClick,
  height: 'auto',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false,
  },
  eventClassNames: function(arg) {
    const status = arg.event.extendedProps.calendar
    let colorClass = 'bg-primary'
    if (status === 'draft') colorClass = 'bg-secondary'
    else if (status === 'active') colorClass = 'bg-info'
    else if (status === 'in_progress') colorClass = 'bg-warning'
    else if (status === 'completed') colorClass = 'bg-success'
    
    return [colorClass, 'rounded', 'px-2', 'py-1', 'text-white']
  },
  eventContent: function (arg) {
    let wrap = document.createElement('div')
    let timeWrap = document.createElement('div')
    timeWrap.classList.add('text-caption', 'font-weight-bold')
    timeWrap.innerHTML = arg.timeText
    
    let titleWrap = document.createElement('div')
    titleWrap.innerHTML = arg.event.title
    titleWrap.style.whiteSpace = 'normal'

    wrap.appendChild(timeWrap)
    wrap.appendChild(titleWrap)
    
    return { domNodes: [wrap] }
  },
})

async function fetchEvents(info, successCallback, failureCallback) {
  isLoading.value = true
  try {
    const res = await fetchMyCalendar({
      start: info.startStr,
      end: info.endStr,
    })

    const data = res.data?.data || res.data || []

    successCallback(data)
  } catch (error) {
    console.error('Failed to load my calendar', error)
    failureCallback(error)
  } finally {
    isLoading.value = false
  }
}

function handleEventClick(clickInfo) {
  clickInfo.jsEvent.preventDefault()
  if (clickInfo.event.id) {
    router.push({ name: 'meetings-participant-details', params: { id: clickInfo.event.id } })
  }
}
</script>

<template>
  <section>
    <div class="meeting-section-card pb-5">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-calendar"
            class="section-icon"
          />
          Lịch họp của tôi
        </div>
      </div>
      <VCardText class="position-relative">
        <VOverlay
          :model-value="isLoading"
          contained
          class="align-center justify-center"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </VOverlay>
        <FullCalendar
          class="my-calendar-wrapper mt-4"
          :options="calendarOptions"
        />
      </VCardText>
    </div>
  </section>
</template>

<style lang="scss">
.my-calendar-wrapper {
  .fc-event {
    border: none;
    cursor: pointer;
    margin-block-end: 2px;
  }

  .fc-event-main {
    padding-block: 2px;
    padding-inline: 4px;
  }

  .fc-toolbar-title {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
  }

  .fc-button-primary {
    text-transform: capitalize !important;
  }

  .fc-col-header-cell-cushion {
    font-weight: 600;
    text-transform: capitalize;
  }

  .bg-secondary {
    background-color: rgb(var(--v-theme-secondary)) !important;
  }

  .bg-info {
    background-color: rgb(var(--v-theme-info)) !important;
  }

  .bg-warning {
    background-color: rgb(var(--v-theme-warning)) !important;
  }

  .bg-success {
    background-color: rgb(var(--v-theme-success)) !important;
  }
}
</style>
