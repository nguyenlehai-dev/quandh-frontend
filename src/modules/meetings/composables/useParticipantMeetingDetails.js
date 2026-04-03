/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */

import {
  castVote,
  createPersonalNote,
  createSpeechRequest,
  deleteSpeechRequest,
  fetchAvailableDelegates,
  fetchMeeting,
  fetchMeetingQrToken,
  fetchPersonalNotes,
  fetchSpeechRequests,
  qrCheckinMeeting,
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
  const isQrCheckinDialogOpen = ref(false)
  const qrCheckinToken = ref('')
  const qrCheckinError = ref('')
  const qrTokenPreview = ref('')
  const isSpeechRequestDialogOpen = ref(false)
  const speechRequestError = ref('')
  const speechRequestForm = ref({
    meeting_agenda_id: null,
    content: '',
  })
  const isVotingModalOpen = ref(false)
  const activeVote = ref(null)
  const selectedVoteAnswer = ref(null)
  const isSubmittingVote = ref(false)
  const isSpeakRequested = ref(false)
  const isRequestingSpeak = ref(false)
  const speechRequestId = ref(null)
  const speechRequests = ref([])
  const countdownDisplay = ref('00:00:00')
  const userData = useCookie('userData')

  const unwrapPayload = response => response?.data?.data ?? response?.data ?? response ?? null

  const normalizeMeeting = payload => {
    if (!payload) return null

    const participants = (payload.participants || []).map(participant => ({
      ...participant,
      user: participant.user || (participant.user_id ? {
        id: participant.user_id,
        name: participant.user_name || 'N/A',
        email: participant.user_email || null,
      } : null),
      delegated_user: participant.delegated_user || (participant.delegated_to_id ? {
        id: participant.delegated_to_id,
        name: participant.delegated_user_name || 'N/A',
      } : null),
    }))

    const agendas = (payload.agendas || []).map(agenda => ({
      ...agenda,
      presenter: agenda.presenter || (agenda.presenter_id ? {
        id: agenda.presenter_id,
        name: agenda.presenter_name || '',
      } : null),
    }))

    const votes = (payload.votings || payload.votes || []).map(vote => ({
      ...vote,
      voting_type: 'agree_disagree',
      agree_count: vote.agree_count ?? vote.results_summary?.agree ?? 0,
      disagree_count: vote.disagree_count ?? vote.results_summary?.disagree ?? 0,
      abstain_count: vote.abstain_count ?? vote.results_summary?.abstain ?? 0,
    }))

    return {
      ...payload,
      meeting_type: payload.meeting_type_name || payload.meeting_type?.name || payload.meeting_type || null,
      participants,
      agendas,
      votings: votes,
      votes,
    }
  }

  const normalizeSpeechRequests = payload => {
    const items = Array.isArray(payload) ? payload : []

    return items.map(item => ({
      ...item,
      participant: item.participant ? {
        ...item.participant,
        user: item.participant.user || null,
      } : null,
    }))
  }

  const currentUserParticipant = computed(() => {
    if (!meeting.value?.participants || !userData.value) return null

    return meeting.value.participants.find(participant => participant.user_id === userData.value.id)
  })

  const attendanceStats = computed(() => {
    const participants = meeting.value?.participants || []
    const total = participants.length
    const present = participants.filter(participant => participant.attendance_status === 'present').length
    const absent = participants.filter(participant => participant.attendance_status === 'absent').length
    const delegated = participants.filter(participant => participant.attendance_status === 'delegated').length

    return { total, present, absent, delegated }
  })

  const speechRequestList = computed(() => speechRequests.value.filter(item => item.status === 'pending' || item.status === 'approved'))
  const speechHistoryList = computed(() => speechRequests.value.filter(item => item.status === 'rejected'))
  const speechAgendaOptions = computed(() => (meeting.value?.agendas || []).map(item => ({
    title: item.title,
    value: item.id,
  })))

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
      availableUsers.value = unwrapPayload(res) || []
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
        Object.assign(currentUserParticipant.value, unwrapPayload(res))

      isAbsentDialogOpen.value = false
      isDelegateDialogOpen.value = false
      absenceReason.value = ''
      delegatedToId.value = null
      await loadMeeting()
    }
    catch (error) {
      console.error('Checkin failed:', error)
    }
    finally {
      isCheckinSubmitting.value = false
    }
  }

  const loadQrTokenPreview = async () => {
    if (!route.params.id) return

    try {
      const res = await fetchMeetingQrToken(route.params.id)
      qrTokenPreview.value = unwrapPayload(res)?.qr_token || ''
    }
    catch (error) {
      console.error('Failed to load qr token preview:', error)
    }
  }

  const handleQrCheckin = async () => {
    if (!meeting.value?.id || !qrCheckinToken.value) return

    isCheckinSubmitting.value = true
    qrCheckinError.value = ''
    try {
      const res = await qrCheckinMeeting(meeting.value.id, qrCheckinToken.value)
      if (currentUserParticipant.value)
        Object.assign(currentUserParticipant.value, unwrapPayload(res))

      isQrCheckinDialogOpen.value = false
      qrCheckinToken.value = ''
      await loadMeeting()
    }
    catch (error) {
      console.error('QR checkin failed:', error)
      qrCheckinError.value = error?.response?._data?.message || error?.data?.message || 'Không thể điểm danh bằng QR.'
    }
    finally {
      isCheckinSubmitting.value = false
    }
  }

  const loadMeeting = async () => {
    loading.value = true
    try {
      const [res, notesRes, speechRes] = await Promise.all([
        fetchMeeting(route.params.id),
        fetchPersonalNotes(route.params.id).catch(() => ({ data: [] })),
        fetchSpeechRequests(route.params.id).catch(() => ({ data: [] })),
      ])

      meeting.value = normalizeMeeting(unwrapPayload(res))
      speechRequests.value = normalizeSpeechRequests(unwrapPayload(speechRes) || [])
      meetingStore.setCurrentMeeting(meeting.value)
      meetingStore.subscribeToMeeting(meeting.value.id)

      const currentUserSpeechRequest = speechRequests.value.find(item => item.participant?.user_id === userData.value?.id && item.status === 'pending')
      isSpeakRequested.value = !!currentUserSpeechRequest
      speechRequestId.value = currentUserSpeechRequest?.id || null

      const notes = unwrapPayload(notesRes)

      if (Array.isArray(notes) && notes.length > 0) {
        personalNotes.value = notes[0].content
        personalNoteId.value = notes[0].id
      }
      else {
        personalNotes.value = ''
        personalNoteId.value = null
      }

      startCountdown()
      loadQrTokenPreview()
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
    if (!speechRequestForm.value.meeting_agenda_id || !speechRequestForm.value.content.trim()) return

    isRequestingSpeak.value = true
    speechRequestError.value = ''
    try {
      const res = await createSpeechRequest(meeting.value.id, {
        meeting_agenda_id: speechRequestForm.value.meeting_agenda_id,
        content: speechRequestForm.value.content.trim(),
      })

      speechRequestId.value = unwrapPayload(res)?.id || null
      isSpeakRequested.value = true
      isSpeechRequestDialogOpen.value = false
      speechRequestForm.value = {
        meeting_agenda_id: null,
        content: '',
      }
      await loadMeeting()
    }
    catch (error) {
      console.error('Failed to request speak:', error)
      speechRequestError.value = error?.response?._data?.message || error?.data?.message || 'Không thể đăng ký phát biểu.'
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
      await loadMeeting()
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
      await loadMeeting()
    }
    catch (error) {
      console.error('Failed to submit vote:', error)
    }
    finally {
      isSubmittingVote.value = false
    }
  }

  const resolveStatusLabel = status => {
    if (status === 'active' || status === 'in_progress') return 'Dang dien ra'
    if (status === 'draft' || status === 'scheduled') return 'Chua bat dau'

    return 'Da ket thuc'
  }

  const resolveStatusBadgeClass = status => {
    if (status === 'active' || status === 'in_progress') return 'status-badge-live'
    if (status === 'draft' || status === 'scheduled') return 'status-badge-draft'

    return 'status-badge-completed'
  }

  const getPresenterName = presenterId => {
    if (!presenterId || !meeting.value?.participants) return ''
    const participant = meeting.value.participants.find(item => item.user_id === presenterId)

    return participant?.user?.name || meeting.value.agendas?.find(item => item.presenter_id === presenterId)?.presenter?.name || ''
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

  watch(() => meetingStore.lastEvent, event => {
    if (!event || Number(event.meeting_id) !== Number(meeting.value?.id)) return
    if (event.type !== 'speech.request.changed') return

    loadMeeting()
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
          personalNoteId.value = unwrapPayload(res)?.id
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
    handleQrCheckin,
    handleSelfCheckin,
    isAbsentDialogOpen,
    isCheckinSubmitting,
    isDelegateDialogOpen,
    isQrCheckinDialogOpen,
    isSpeechRequestDialogOpen,
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
    qrCheckinError,
    qrCheckinToken,
    qrTokenPreview,
    requestSpeak,
    resolveStatusBadgeClass,
    resolveStatusLabel,
    selectedVoteAnswer,
    speechAgendaOptions,
    speechHistoryList,
    speechRequestError,
    speechRequestForm,
    speechRequestList,
    speechRequestId,
    submitVote,
  }
}

