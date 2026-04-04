import { echo } from '@/plugins/echo'
import { defineStore } from 'pinia'

export const useMeetingStore = defineStore('meeting', {
  state: () => ({
    currentMeetingId: null,
    currentMeeting: null,
    activeAgendaId: null,
    isLiveSyncing: false,
    echoSubscription: null,
    subscribedMeetingId: null,
    lastEvent: null,
  }),

  actions: {
    setCurrentMeeting(meeting) {
      if (meeting) {
        this.currentMeetingId = meeting.id
        this.currentMeeting = meeting
      }
      else {
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

    subscribeToMeeting(meetingId) {
      if (!meetingId) return

      if (this.subscribedMeetingId === meetingId && this.echoSubscription) {
        this.isLiveSyncing = true

        return
      }

      this.unsubscribeFromMeeting()
      this.subscribedMeetingId = meetingId

      this.echoSubscription = echo.private(`meeting.${meetingId}`)
        .listen('.meeting.status.changed', e => this.handleEchoBroadcast('meeting.status.changed', e))
        .listen('.agenda.changed', e => this.handleEchoBroadcast('agenda.changed', e))
        .listen('.meeting.attendance.checked', e => this.handleEchoBroadcast('meeting.attendance.checked', e))
        .listen('.voting.status.changed', e => this.handleEchoBroadcast('voting.status.changed', e))
        .listen('.voting.results.changed', e => this.handleEchoBroadcast('voting.results.changed', e))
        .listen('.speech.request.changed', e => this.handleEchoBroadcast('speech.request.changed', e))

      this.isLiveSyncing = true
    },

    unsubscribeFromMeeting() {
      if (this.subscribedMeetingId) {
        echo.leave(`meeting.${this.subscribedMeetingId}`)
      }

      this.echoSubscription = null
      this.subscribedMeetingId = null
      this.isLiveSyncing = false
    },

    handleEchoBroadcast(type, eventData) {
      this.lastEvent = {
        type,
        ...eventData,
      }

      if (!this.currentMeeting) return

      if (type === 'meeting.status.changed' && eventData.new_status) {
        this.currentMeeting.status = eventData.new_status
      }

      if (type === 'agenda.changed') {
        this.activeAgendaId = eventData.agenda_id
      }

      if (type === 'meeting.attendance.checked' && Array.isArray(this.currentMeeting.participants)) {
        const participant = this.currentMeeting.participants.find(item =>
          item.id === eventData.participant_id || item.user_id === eventData.user_id,
        )

        if (participant) {
          participant['attendance_status'] = eventData.attendance_status
          participant['checkin_at'] = eventData.checkin_at
        }
      }

      if (type === 'voting.status.changed') {
        const votingList = this.currentMeeting.votings || this.currentMeeting.votes || []
        const voting = votingList.find(item => item.id === eventData.voting_id)

        if (voting) {
          voting.status = eventData.status
        }
      }

      if (type === 'voting.results.changed') {
        const votingList = this.currentMeeting.votings || this.currentMeeting.votes || []
        const voting = votingList.find(item => item.id === eventData.voting_id)

        if (voting) {
          voting['results_summary'] = eventData.summary
          voting['agree_count'] = eventData.summary?.agree ?? 0
          voting['disagree_count'] = eventData.summary?.disagree ?? 0
          voting['abstain_count'] = eventData.summary?.abstain ?? 0
        }
      }
    },
  },
})
