/**
 * Meeting Service
 */
import {
  API_BASE, API_VOTES, API_DOCUMENTS, API_CONCLUSIONS,
  API_ATTENDEES, API_ATTENDEE_GROUPS, API_DOCUMENT_TYPES, API_MEETING_TYPES,
  API_ISSUING_AGENCIES, API_ISSUING_LEVELS, API_DOCUMENT_FIELDS, API_DOCUMENT_SIGNERS,
  API_POSTS, API_POST_CATEGORIES,
} from '../configs'

// ===== CUỘC HỌP =====
export const fetchMeetings = params => $api(API_BASE, { params })

/**
 * Lấy lịch họp của tôi (Đại biểu)
 */
export const fetchMyMeetings = params => $api('/my-meetings', { params })
export const fetchMyCalendar = params => $api(`${API_BASE}/my-calendar`, { params })
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
export const openVoting = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/open`, { method: 'PATCH' })
export const closeVoting = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/close`, { method: 'PATCH' })
export const castVote = (meetingId, voteId, choice) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/vote`, { method: 'POST', body: { choice } })
export const fetchVotingResults = (meetingId, voteId) => $api(`${API_BASE}/${meetingId}/votings/${voteId}/results`)

// ===== NGƯỜI DỰ HỌP (SUB-RESOURCE) =====
// ===== NGƯỜI DỰ HỌP (SUB-RESOURCE) =====
export const fetchMeetingParticipants = meetingId => $api(`${API_BASE}/${meetingId}/participants`)
export const createMeetingParticipant = (meetingId, data) => $api(`${API_BASE}/${meetingId}/participants`, { method: 'POST', body: data })
export const updateMeetingParticipant = (meetingId, participantId, data) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'PUT', body: data })
export const deleteMeetingParticipant = (meetingId, participantId) => $api(`${API_BASE}/${meetingId}/participants/${participantId}`, { method: 'DELETE' })
export const selfCheckinMeetingParticipant = (meetingId, data) => $api(`${API_BASE}/${meetingId}/self-checkin`, { method: 'POST', body: data })
export const fetchAvailableDelegates = meetingId => $api(`${API_BASE}/${meetingId}/available-delegates`)

// ===== GHI CHÚ CÁ NHÂN (SUB-RESOURCE) =====
export const fetchPersonalNotes = meetingId => $api(`${API_BASE}/${meetingId}/personal-notes`)
export const createPersonalNote = (meetingId, data) => $api(`${API_BASE}/${meetingId}/personal-notes`, { method: 'POST', body: data })
export const updatePersonalNote = (meetingId, noteId, data) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'PUT', body: data })
export const deletePersonalNote = (meetingId, noteId) => $api(`${API_BASE}/${meetingId}/personal-notes/${noteId}`, { method: 'DELETE' })

// ===== ĐĂNG KÝ PHÁT BIỂU (SUB-RESOURCE) =====
export const fetchSpeechRequests = meetingId => $api(`${API_BASE}/${meetingId}/speech-requests`)
export const createSpeechRequest = meetingId => $api(`${API_BASE}/${meetingId}/speech-requests`, { method: 'POST' })
export const deleteSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}`, { method: 'DELETE' })
export const approveSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}/approve`, { method: 'PATCH' })
export const rejectSpeechRequest = (meetingId, requestId) => $api(`${API_BASE}/${meetingId}/speech-requests/${requestId}/reject`, { method: 'PATCH' })

// ===== BIỂU QUYẾT =====
export const fetchVotes = params => $api(API_VOTES, { params })
export const fetchVote = id => $api(`${API_VOTES}/${id}`)
export const createVote = data => $api(API_VOTES, { method: 'POST', body: data })
export const updateVote = (id, data) => $api(`${API_VOTES}/${id}`, { method: 'PUT', body: data })
export const deleteVote = id => $api(`${API_VOTES}/${id}`, { method: 'DELETE' })
export const exportVotes = params => $api(`${API_BASE}/all-votings/export`, { params, responseType: 'blob' })

// ===== TÀI LIỆU =====
export const fetchDocuments = params => $api(API_DOCUMENTS, { params })
export const fetchDocument = id => $api(`${API_DOCUMENTS}/${id}`)
export const createDocument = data => $api(API_DOCUMENTS, { method: 'POST', body: data })
export const updateDocument = (id, data) => $api(`${API_DOCUMENTS}/${id}`, { method: 'PUT', body: data })
export const deleteDocument = id => $api(`${API_DOCUMENTS}/${id}`, { method: 'DELETE' })
export const exportDocuments = params => $api(`${API_BASE}/all-documents/export`, { params, responseType: 'blob' })

// ===== KẾT LUẬN =====
export const fetchConclusions = params => $api(API_CONCLUSIONS, { params })
export const fetchConclusion = id => $api(`${API_CONCLUSIONS}/${id}`)
export const createConclusion = data => $api(API_CONCLUSIONS, { method: 'POST', body: data })
export const updateConclusion = (id, data) => $api(`${API_CONCLUSIONS}/${id}`, { method: 'PUT', body: data })
export const deleteConclusion = id => $api(`${API_CONCLUSIONS}/${id}`, { method: 'DELETE' })
export const exportConclusions = params => $api(`${API_BASE}/all-conclusions/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: NGƯỜI DỰ HỌP =====
export const fetchAttendees = params => $api(API_ATTENDEES, { params })
export const createAttendee = data => $api(API_ATTENDEES, { method: 'POST', body: data })
export const deleteAttendee = id => $api(`${API_ATTENDEES}/${id}`, { method: 'DELETE' })
export const exportAttendees = params => $api(`${API_BASE}/all-participants/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: NHÓM NGƯỜI DỰ HỌP =====
export const fetchAttendeeGroups = params => $api(API_ATTENDEE_GROUPS, { params })
export const createAttendeeGroup = data => $api(API_ATTENDEE_GROUPS, { method: 'POST', body: data })
export const updateAttendeeGroup = (id, data) => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'PUT', body: data })
export const deleteAttendeeGroup = id => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'DELETE' })
export const exportAttendeeGroups = params => $api(`${API_ATTENDEE_GROUPS}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: LOẠI TÀI LIỆU =====
export const fetchDocumentTypes = params => $api(API_DOCUMENT_TYPES, { params })
export const createDocumentType = data => $api(API_DOCUMENT_TYPES, { method: 'POST', body: data })
export const updateDocumentType = (id, data) => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentType = id => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'DELETE' })
export const exportDocumentTypes = params => $api(`${API_DOCUMENT_TYPES}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: LOẠI CUỘC HỌP =====
export const fetchMeetingTypes = params => $api(API_MEETING_TYPES, { params })
export const createMeetingType = data => $api(API_MEETING_TYPES, { method: 'POST', body: data })
export const updateMeetingType = (id, data) => $api(`${API_MEETING_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteMeetingType = id => $api(`${API_MEETING_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-update`, { method: 'PUT', body: data })
export const exportMeetingTypes = params => $api(`${API_MEETING_TYPES}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: CƠ QUAN BAN HÀNH =====
export const fetchIssuingAgencies = params => $api(API_ISSUING_AGENCIES, { params })
export const createIssuingAgency = data => $api(API_ISSUING_AGENCIES, { method: 'POST', body: data })
export const updateIssuingAgency = (id, data) => $api(`${API_ISSUING_AGENCIES}/${id}`, { method: 'PUT', body: data })
export const deleteIssuingAgency = id => $api(`${API_ISSUING_AGENCIES}/${id}`, { method: 'DELETE' })
export const exportIssuingAgencies = params => $api(`${API_ISSUING_AGENCIES}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: CẤP BAN HÀNH =====
export const fetchIssuingLevels = params => $api(API_ISSUING_LEVELS, { params })
export const createIssuingLevel = data => $api(API_ISSUING_LEVELS, { method: 'POST', body: data })
export const updateIssuingLevel = (id, data) => $api(`${API_ISSUING_LEVELS}/${id}`, { method: 'PUT', body: data })
export const deleteIssuingLevel = id => $api(`${API_ISSUING_LEVELS}/${id}`, { method: 'DELETE' })
export const exportIssuingLevels = params => $api(`${API_ISSUING_LEVELS}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: LĨNH VỰC =====
export const fetchDocumentFields = params => $api(API_DOCUMENT_FIELDS, { params })
export const createDocumentField = data => $api(API_DOCUMENT_FIELDS, { method: 'POST', body: data })
export const updateDocumentField = (id, data) => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentField = id => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'DELETE' })
export const exportDocumentFields = params => $api(`${API_DOCUMENT_FIELDS}/export`, { params, responseType: 'blob' })

// ===== DANH MỤC: NGƯỜI KÝ =====
export const fetchDocumentSigners = params => $api(API_DOCUMENT_SIGNERS, { params })
export const createDocumentSigner = data => $api(API_DOCUMENT_SIGNERS, { method: 'POST', body: data })
export const updateDocumentSigner = (id, data) => $api(`${API_DOCUMENT_SIGNERS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentSigner = id => $api(`${API_DOCUMENT_SIGNERS}/${id}`, { method: 'DELETE' })
export const exportDocumentSigners = params => $api(`${API_DOCUMENT_SIGNERS}/export`, { params, responseType: 'blob' })

// ===== TIN TỨC: BÀI VIẾT =====
export const fetchPosts = params => $api(API_POSTS, { params })
export const createPost = data => $api(API_POSTS, { method: 'POST', body: data })
export const updatePost = (id, data) => $api(`${API_POSTS}/${id}`, { method: 'PUT', body: data })
export const deletePost = id => $api(`${API_POSTS}/${id}`, { method: 'DELETE' })
export const exportPosts = params => $api(`${API_POSTS}/export`, { params, responseType: 'blob' })

// ===== TIN TỨC: THỂ LOẠI BÀI VIẾT =====
export const fetchPostCategories = params => $api(API_POST_CATEGORIES, { params })
export const createPostCategory = data => $api(API_POST_CATEGORIES, { method: 'POST', body: data })
export const updatePostCategory = (id, data) => $api(`${API_POST_CATEGORIES}/${id}`, { method: 'PUT', body: data })
export const deletePostCategory = id => $api(`${API_POST_CATEGORIES}/${id}`, { method: 'DELETE' })
export const exportPostCategories = params => $api(`${API_POST_CATEGORIES}/export`, { params, responseType: 'blob' })
