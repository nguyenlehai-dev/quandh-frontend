/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */

import {
  castVote,
  createPersonalNote,
  createSpeechRequest,
  deleteSpeechRequest,
  fetchAvailableDelegates,
  fetchMeeting,
  fetchPersonalNotes,
  selfCheckinMeetingParticipant,
  updatePersonalNote,
} from '@/modules/meetings/services/meetingService'
import { useMeetingStore } from '@/modules/meetings/stores/useMeetingStore'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useParticipantMeetingDetails() {
  const route = useRoute()
  const meetingStore = useMeetingStore()

  const loading = ref(true)
  const meeting = ref(null)
  const activeTab = ref('agenda')
  const personalNotes = ref('')
  const personalNoteId = ref(null)
  const isSavingNote = ref(false)
  const lastSaved = ref(null)
  const isCheckinSubmitting = ref(false)
  const isAbsentDialogOpen = ref(false)
  const absenceReason = ref('')
  const isDelegateDialogOpen = ref(false)
  const delegatedToId = ref(null)
  const availableUsers = ref([])
  const isVotingModalOpen = ref(false)
  const activeVote = ref(null)
  const selectedVoteAnswer = ref(null)
  const isSubmittingVote = ref(false)
  const isSpeakRequested = ref(false)
  const isRequestingSpeak = ref(false)
  const speechRequestId = ref(null)
  const countdownDisplay = ref('00:00:00')
  const userData = useCookie('userData')

  const currentUserParticipant = computed(() => {
    if (!meeting.value?.participants || !userData.value) return null

    return meeting.value.participants.find(participant => participant.user_id === userData.value.id)
  })

  const attendanceStats = computed(() => {
    const participants = meeting.value?.participants || []
    const total = participants.length
    const present = participants.filter(participant => participant.attendance_status === 'present').length
    const absent = participants.filter(participant => participant.attendance_status === 'absent').length
    const guest = participants.filter(participant => participant.meeting_role === 'guest').length

    return { total, present, absent, guest }
  })

  let countdownInterval = null
  let initialLoad = true

  const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval)

    countdownInterval = setInterval(() => {
      if (!meeting.value?.end_at) {
        countdownDisplay.value = '00:00:00'

        return
      }

      let endTime
      const raw = meeting.value.end_at
      if (raw.includes('/')) {
        const parts = raw.split(' ')
        const timePart = parts[0]
        const datePart = parts[1]?.split('/') || []
        if (datePart.length === 3)
          endTime = new Date(`${datePart[2]}-${datePart[1]}-${datePart[0]}T${timePart}`)
      }
      if (!endTime) endTime = new Date(raw)

      const now = new Date()
      const diff = Math.max(0, endTime - now)
      const hours = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')

      countdownDisplay.value = `${hours}:${minutes}:${seconds}`
    }, 1000)
  }

  const loadAvailableUsers = async () => {
    if (availableUsers.value.length > 0) return
    if (!meeting.value?.id) return

    try {
      const res = await fetchAvailableDelegates(meeting.value.id)
      availableUsers.value = res.data || []
    }
    catch (error) {
      console.error('Failed to load users for delegation:', error)
    }
  }

  const handleSelfCheckin = async status => {
    if (!meeting.value?.id) return
    isCheckinSubmitting.value = true

    const payload = { attendance_status: status }
    if (status === 'absent') payload.absence_reason = absenceReason.value
    if (status === 'delegated') payload.delegated_to_id = delegatedToId.value

    try {
      const res = await selfCheckinMeetingParticipant(meeting.value.id, payload)
      if (currentUserParticipant.value)
        Object.assign(currentUserParticipant.value, res.data.data)

      isAbsentDialogOpen.value = false
      isDelegateDialogOpen.value = false
    }
    catch (error) {
      console.error('Checkin failed:', error)
    }
    finally {
      isCheckinSubmitting.value = false
    }
  }

  const loadMeeting = async () => {
    loading.value = true
    try {
      const [res, notesRes] = await Promise.all([
        fetchMeeting(route.params.id),
        fetchPersonalNotes(route.params.id).catch(() => ({ data: [] })),
      ])

      meeting.value = res.data
      meetingStore.setCurrentMeeting(meeting.value)
      meetingStore.subscribeToMeeting(meeting.value.id)

      if (notesRes.data && notesRes.data.length > 0) {
        personalNotes.value = notesRes.data[0].content
        personalNoteId.value = notesRes.data[0].id
      }

      startCountdown()
    }
    catch (error) {
      console.error('Failed to load meeting details', error)
    }
    finally {
      loading.value = false
    }
  }

  const requestSpeak = async () => {
    if (!meeting.value?.id) return

    isRequestingSpeak.value = true
    try {
      const res = await createSpeechRequest(meeting.value.id)
      speechRequestId.value = res.data?.id || null
      isSpeakRequested.value = true
    }
    catch (error) {
      console.error('Failed to request speak:', error)
    }
    finally {
      isRequestingSpeak.value = false
    }
  }

  const cancelSpeakRequest = async () => {
    if (!meeting.value?.id || !speechRequestId.value) return

    try {
      await deleteSpeechRequest(meeting.value.id, speechRequestId.value)
      isSpeakRequested.value = false
      speechRequestId.value = null
    }
    catch (error) {
      console.error('Failed to cancel speak request:', error)
    }
  }

  const submitVote = async () => {
    if (!activeVote.value || selectedVoteAnswer.value === null) return

    isSubmittingVote.value = true
    try {
      await castVote(meeting.value.id, activeVote.value.id, selectedVoteAnswer.value)
      isVotingModalOpen.value = false
      activeVote.value = null
      selectedVoteAnswer.value = null
    }
    catch (error) {
      console.error('Failed to submit vote:', error)
    }
    finally {
      isSubmittingVote.value = false
    }
  }

  const resolveStatusLabel = status => {
    if (status === 'active' || status === 'in_progress') return 'Äang diá»…n ra'
    if (status === 'draft' || status === 'scheduled') return 'ChÆ°a báº¯t Ä‘áº§u'

    return 'ÄÃ£ káº¿t thÃºc'
  }

  const resolveStatusBadgeClass = status => {
    if (status === 'active' || status === 'in_progress') return 'status-badge-live'
    if (status === 'draft' || status === 'scheduled') return 'status-badge-draft'

    return 'status-badge-completed'
  }

  const getPresenterName = presenterId => {
    if (!presenterId || !meeting.value?.participants) return ''
    const participant = meeting.value.participants.find(item => item.user_id === presenterId)

    return participant?.user?.name || ''
  }

  const getChairperson = () => {
    if (!meeting.value?.participants) return null

    return meeting.value.participants.find(participant => ['chairperson', 'chair'].includes(participant.meeting_role || participant.role))
  }

  const getSecretary = () => {
    if (!meeting.value?.participants) return null

    return meeting.value.participants.find(participant => participant.meeting_role === 'secretary' || participant.role === 'secretary')
  }

  onMounted(() => {
    loadMeeting()
  })

  onUnmounted(() => {
    meetingStore.unsubscribeFromMeeting()
    if (countdownInterval) clearInterval(countdownInterval)
  })

  watch(() => meetingStore.currentMeeting, newValue => {
    if (newValue)
      meeting.value.status = newValue.status
  }, { deep: true })

  watchDebounced(
    personalNotes,
    async newValue => {
      if (initialLoad) {
        initialLoad = false

        return
      }
      if (!meeting.value?.id) return

      isSavingNote.value = true
      try {
        if (personalNoteId.value) {
          await updatePersonalNote(meeting.value.id, personalNoteId.value, { content: newValue })
        }
        else {
          const res = await createPersonalNote(meeting.value.id, { content: newValue })
          personalNoteId.value = res.data.id
        }
        lastSaved.value = new Date().toLocaleTimeString('vi-VN')
      }
      catch (error) {
        console.error('Failed to save note', error)
      }
      finally {
        isSavingNote.value = false
      }
    },
    { debounce: 1500, maxWait: 5000 },
  )

  return {
    absenceReason,
    activeTab,
    activeVote,
    attendanceStats,
    availableUsers,
    cancelSpeakRequest,
    countdownDisplay,
    currentUserParticipant,
    delegatedToId,
    getChairperson,
    getPresenterName,
    getSecretary,
    handleSelfCheckin,
    isAbsentDialogOpen,
    isCheckinSubmitting,
    isDelegateDialogOpen,
    isRequestingSpeak,
    isSavingNote,
    isSpeakRequested,
    isSubmittingVote,
    isVotingModalOpen,
    lastSaved,
    loadAvailableUsers,
    loading,
    meeting,
    personalNotes,
    requestSpeak,
    resolveStatusBadgeClass,
    resolveStatusLabel,
    selectedVoteAnswer,
    speechRequestId,
    submitVote,
  }
}
