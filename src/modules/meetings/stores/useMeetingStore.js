import { echo } from '@/plugins/echo'
import { defineStore } from 'pinia'

export const useMeetingStore = defineStore('meeting', {
  state: () => ({
    // ID cuộc họp hiện tại đang được truy cập (dùng cho Live Controller hoặc khi đại biểu xem chi tiết)
    currentMeetingId: null,
    
    // Cuộc họp hiện tại
    currentMeeting: null,
    
    // ID của Agenda đang được kích hoạt hiện tại
    activeAgendaId: null,

    // Trạng thái đồng bộ (Websockets)
    isLiveSyncing: false,
    echoSubscription: null,
  }),

  actions: {
    setCurrentMeeting(meeting) {
      if (meeting) {
        this.currentMeetingId = meeting.id
        this.currentMeeting = meeting
      } else {
        this.currentMeetingId = null
        this.currentMeeting = null
      }
    },

    setActiveAgenda(agendaId) {
      this.activeAgendaId = agendaId
    },

    setSyncStatus(status) {
      this.isLiveSyncing = status
    },
    
    // Quản lý WebSockets Connection
    subscribeToMeeting(meetingId) {
      if (!meetingId) return
      
      this.unsubscribeFromMeeting()
      
      this.echoSubscription = echo.private(`meeting.${meetingId}`)
        .listen('.meeting.status.changed', e => {
          this.handleEchoBroadcast(e)
        })
        .listen('.agenda.changed', e => {
          this.activeAgendaId = e.agenda_id
        })
        
      this.isLiveSyncing = true
    },

    unsubscribeFromMeeting() {
      if (this.currentMeetingId) {
        echo.leaveChannel(`meeting.${this.currentMeetingId}`)
      }
      this.echoSubscription = null
      this.isLiveSyncing = false
    },

    // Nơi đây chứa action parse WebSockets Data payload
    handleEchoBroadcast(eventData) {
      console.log('Meeting WS Broadcast Received:', eventData)
      if (eventData.new_status) {
        this.currentMeeting.status = eventData.new_status
      } else if (eventData.status) {
        this.currentMeeting.status = eventData.status
      }
      if (eventData.meeting) {
        this.currentMeeting = { ...this.currentMeeting, ...eventData.meeting }
      }
    },
  },
})
