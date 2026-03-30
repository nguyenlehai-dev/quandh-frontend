import { API_BASE } from '../configs'

export const fetchMeetingDocuments = meetingId => $api(`${API_BASE}/${meetingId}/documents`)
export const createMeetingDocument = (meetingId, data) => $api(`${API_BASE}/${meetingId}/documents`, { method: 'POST', body: data })
export const deleteMeetingDocument = (meetingId, docId) => $api(`${API_BASE}/${meetingId}/documents/${docId}`, { method: 'DELETE' })

export const fetchMeetingConclusions = meetingId => $api(`${API_BASE}/${meetingId}/conclusions`)
export const createMeetingConclusion = (meetingId, data) => $api(`${API_BASE}/${meetingId}/conclusions`, { method: 'POST', body: data })
export const updateMeetingConclusion = (meetingId, conclusionId, data) => $api(`${API_BASE}/${meetingId}/conclusions/${conclusionId}`, { method: 'PUT', body: data })
export const deleteMeetingConclusion = (meetingId, conclusionId) => $api(`${API_BASE}/${meetingId}/conclusions/${conclusionId}`, { method: 'DELETE' })

export const fetchMeetingVotes = meetingId => $api(`${API_BASE}/${meetingId}/votings`)
export const createMeetingVote = (meetingId, data) => $api(`${API_BASE}/${meetingId}/votings`, { method: 'POST', body: data })
export const updateMeetingVote = (meetingId, voteId, data) => $api(`${API_BASE}/${meetingId}/votings/${voteId}`, { method: 'PUT', body: data })
export const deleteMeetingVote = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}`, { method: 'DELETE' })
export const openVoting = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/open`, { method: 'PATCH' })
export const closeVoting = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/close`, { method: 'PATCH' })
export const castVote = (meetingId, voteId, choice) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/vote`, { method: 'POST', body: { choice } })
export const fetchVotingResults = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/results`)

export const fetchMeetingParticipants = meetingId => $api(`${API_BASE}/${meetingId}/participants`)
export const createMeetingParticipant = (meetingId, data) => $api(`${API_BASE}/${meetingId}/participants`, { method: 'POST', body: data })
export const updateMeetingParticipant = (meetingId, participantId, data) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'PUT', body: data })
export const deleteMeetingParticipant = (meetingId, participantId) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'DELETE' })
export const selfCheckinMeetingParticipant = (meetingId, data) => $api(`${API_BASE}/${meetingId}/self-checkin`, { method: 'POST', body: data })
export const fetchAvailableDelegates = meetingId => $api(`${API_BASE}/${meetingId}/available-delegates`)

export const fetchPersonalNotes = meetingId => $api(`${API_BASE}/${meetingId}/personal-notes`)
export const createPersonalNote = (meetingId, data) => $api(`${API_BASE}/${meetingId}/personal-notes`, { method: 'POST', body: data })
export const updatePersonalNote = (meetingId, noteId, data) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'PUT', body: data })
export const deletePersonalNote = (meetingId, noteId) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'DELETE' })

export const fetchSpeechRequests = meetingId => $api(`${API_BASE}/${meetingId}/speech-requests`)
export const createSpeechRequest = meetingId => $api(`${API_BASE}/${meetingId}/speech-requests`, { method: 'POST' })
export const deleteSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}`, { method: 'DELETE' })
export const approveSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}/approve`, { method: 'PATCH' })
export const rejectSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}/reject`, { method: 'PATCH' })
