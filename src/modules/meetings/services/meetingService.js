/**
 * Meeting Service
 */
import {
  API_BASE, API_VOTES, API_DOCUMENTS, API_CONCLUSIONS,
  API_ATTENDEES, API_ATTENDEE_GROUPS, API_DOCUMENT_TYPES, API_MEETING_TYPES,
} from '../configs'

// ===== CUỘC HỌP =====
export const fetchMeetings = params => $api(API_BASE, { params })
export const fetchMeeting = id => $api(`${API_BASE}/${id}`)
export const createMeeting = data => $api(API_BASE, { method: 'POST', body: data })
export const updateMeeting = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteMeeting = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
export const exportMeetings = params => $api(`${API_BASE}/export`, { params, responseType: 'blob' })

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
