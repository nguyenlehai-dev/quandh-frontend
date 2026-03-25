/**
 * Meeting Service
 */
import {
  API_BASE, API_VOTES, API_DOCUMENTS, API_CONCLUSIONS,
  API_ATTENDEES, API_ATTENDEE_GROUPS, API_DOCUMENT_TYPES, API_MEETING_TYPES,
} from '../configs'

// ===== CUỘC HỌP =====
export const fetchMeetings = params => $api(API_BASE, { params })

/**
 * Lấy lịch họp của tôi (Đại biểu)
 */
export const fetchMyMeetings = params => $api('/my-meetings', { params })
export const fetchMeeting = id => $api(`${API_BASE}/${id}`)
export const createMeeting = data => $api(API_BASE, { method: 'POST', body: data })
export const updateMeeting = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteMeeting = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
export const exportMeetings = params => $api(`${API_BASE}/export`, { params, responseType: 'blob' })
export const changeMeetingStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const setActiveAgenda = (meetingId, agendaId) => $api(`${API_BASE}/${meetingId}/agendas/${agendaId}/set-active`, { method: 'PATCH' })

// ===== TÀI LIỆU CUỘC HỌP (SUB-RESOURCE) =====
export const fetchMeetingDocuments = meetingId => $api(`${API_BASE}/${meetingId}/documents`)
export const createMeetingDocument = (meetingId, data) => $api(`${API_BASE}/${meetingId}/documents`, { method: 'POST', body: data })
export const deleteMeetingDocument = (meetingId, docId) => $api(`${API_BASE}/${meetingId}/documents/${docId}`, { method: 'DELETE' })

// ===== KẾT LUẬN (SUB-RESOURCE) =====
export const fetchMeetingConclusions = meetingId => $api(`${API_BASE}/${meetingId}/conclusions`)
export const createMeetingConclusion = (meetingId, data) => $api(`${API_BASE}/${meetingId}/conclusions`, { method: 'POST', body: data })
export const updateMeetingConclusion = (meetingId, conclusionId, data) => $api(`${API_BASE}/${meetingId}/conclusions/${conclusionId}`, { method: 'PUT', body: data })
export const deleteMeetingConclusion = (meetingId, conclusionId) => $api(`${API_BASE}/${meetingId}/conclusions/${conclusionId}`, { method: 'DELETE' })

// ===== BIỂU QUYẾT (SUB-RESOURCE) =====
export const fetchMeetingVotes = meetingId => $api(`${API_BASE}/${meetingId}/votings`)
export const createMeetingVote = (meetingId, data) => $api(`${API_BASE}/${meetingId}/votings`, { method: 'POST', body: data })
export const updateMeetingVote = (meetingId, voteId, data) => $api(`${API_BASE}/${meetingId}/votings/${voteId}`, { method: 'PUT', body: data })
export const deleteMeetingVote = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}`, { method: 'DELETE' })

// ===== NGƯỜI DỰ HỌP (SUB-RESOURCE) =====
export const fetchMeetingParticipants = meetingId => $api(`${API_BASE}/${meetingId}/participants`)
export const createMeetingParticipant = (meetingId, data) => $api(`${API_BASE}/${meetingId}/participants`, { method: 'POST', body: data })
export const updateMeetingParticipant = (meetingId, participantId, data) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'PUT', body: data })
export const deleteMeetingParticipant = (meetingId, participantId) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'DELETE' })

// ===== GHI CHÚ CÁ NHÂN (SUB-RESOURCE) =====
export const fetchPersonalNotes = meetingId => $api(`${API_BASE}/${meetingId}/personal-notes`)
export const createPersonalNote = (meetingId, data) => $api(`${API_BASE}/${meetingId}/personal-notes`, { method: 'POST', body: data })
export const updatePersonalNote = (meetingId, noteId, data) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'PUT', body: data })
export const deletePersonalNote = (meetingId, noteId) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'DELETE' })

// ===== BIỂU QUYẾT =====
export const fetchVotes = params => $api(API_VOTES, { params })
export const fetchVote = id => $api(`${API_VOTES}/${id}`)
export const createVote = data => $api(API_VOTES, { method: 'POST', body: data })
export const updateVote = (id, data) => $api(`${API_VOTES}/${id}`, { method: 'PUT', body: data })
export const deleteVote = id => $api(`${API_VOTES}/${id}`, { method: 'DELETE' })

// ===== TÀI LIỆU =====
export const fetchDocuments = params => $api(API_DOCUMENTS, { params })
export const fetchDocument = id => $api(`${API_DOCUMENTS}/${id}`)
export const createDocument = data => $api(API_DOCUMENTS, { method: 'POST', body: data })
export const updateDocument = (id, data) => $api(`${API_DOCUMENTS}/${id}`, { method: 'PUT', body: data })
export const deleteDocument = id => $api(`${API_DOCUMENTS}/${id}`, { method: 'DELETE' })

// ===== KẾT LUẬN =====
export const fetchConclusions = params => $api(API_CONCLUSIONS, { params })
export const fetchConclusion = id => $api(`${API_CONCLUSIONS}/${id}`)
export const createConclusion = data => $api(API_CONCLUSIONS, { method: 'POST', body: data })
export const updateConclusion = (id, data) => $api(`${API_CONCLUSIONS}/${id}`, { method: 'PUT', body: data })
export const deleteConclusion = id => $api(`${API_CONCLUSIONS}/${id}`, { method: 'DELETE' })

// ===== DANH MỤC: NGƯỜI DỰ HỌP =====
export const fetchAttendees = params => $api(API_ATTENDEES, { params })
export const createAttendee = data => $api(API_ATTENDEES, { method: 'POST', body: data })
export const deleteAttendee = id => $api(`${API_ATTENDEES}/${id}`, { method: 'DELETE' })

// ===== DANH MỤC: NHÓM NGƯỜI DỰ HỌP =====
export const fetchAttendeeGroups = params => $api(API_ATTENDEE_GROUPS, { params })
export const createAttendeeGroup = data => $api(API_ATTENDEE_GROUPS, { method: 'POST', body: data })
export const updateAttendeeGroup = (id, data) => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'PUT', body: data })
export const deleteAttendeeGroup = id => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'DELETE' })

// ===== DANH MỤC: LOẠI TÀI LIỆU =====
export const fetchDocumentTypes = params => $api(API_DOCUMENT_TYPES, { params })
export const createDocumentType = data => $api(API_DOCUMENT_TYPES, { method: 'POST', body: data })
export const updateDocumentType = (id, data) => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentType = id => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'DELETE' })

// ===== DANH MỤC: LOẠI CUỘC HỌP =====
export const fetchMeetingTypes = params => $api(API_MEETING_TYPES, { params })
export const createMeetingType = data => $api(API_MEETING_TYPES, { method: 'POST', body: data })
export const updateMeetingType = (id, data) => $api(`${API_MEETING_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteMeetingType = id => $api(`${API_MEETING_TYPES}/${id}`, { method: 'DELETE' })
