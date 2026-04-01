import {
  API_ATTENDEE_GROUPS,
  API_DOCUMENT_FIELDS,
  API_DOCUMENT_SIGNERS,
  API_DOCUMENT_TYPES,
  API_ISSUING_AGENCIES,
  API_MEETING_TYPES,
} from '../configs'

export const fetchAttendeeGroups = params => $api(API_ATTENDEE_GROUPS, { params })
export const createAttendeeGroup = data => $api(API_ATTENDEE_GROUPS, { method: 'POST', body: data })
export const updateAttendeeGroup = (id, data) => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'PUT', body: data })
export const deleteAttendeeGroup = id => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'DELETE' })
export const changeAttendeeGroupStatus = (id, status) => $api(`${API_ATTENDEE_GROUPS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportAttendeeGroups = params => $api(`${API_ATTENDEE_GROUPS}/export`, { params, responseType: 'blob' })

export const fetchDocumentTypes = params => $api(API_DOCUMENT_TYPES, { params })
export const createDocumentType = data => $api(API_DOCUMENT_TYPES, { method: 'POST', body: data })
export const updateDocumentType = (id, data) => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentType = id => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'DELETE' })
export const changeDocumentTypeStatus = (id, status) => $api(`${API_DOCUMENT_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentTypes = params => $api(`${API_DOCUMENT_TYPES}/export`, { params, responseType: 'blob' })

export const fetchMeetingTypes = params => $api(API_MEETING_TYPES, { params })
export const createMeetingType = data => $api(API_MEETING_TYPES, { method: 'POST', body: data })
export const updateMeetingType = (id, data) => $api(`${API_MEETING_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteMeetingType = id => $api(`${API_MEETING_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-status`, { method: 'PATCH', body: data })
export const changeMeetingTypeStatus = (id, status) => $api(`${API_MEETING_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportMeetingTypes = params => $api(`${API_MEETING_TYPES}/export`, { params, responseType: 'blob' })

export const fetchIssuingAgencies = params => $api(API_ISSUING_AGENCIES, { params })
export const createIssuingAgency = data => $api(API_ISSUING_AGENCIES, { method: 'POST', body: data })
export const updateIssuingAgency = (id, data) => $api(`${API_ISSUING_AGENCIES}/${id}`, { method: 'PUT', body: data })
export const deleteIssuingAgency = id => $api(`${API_ISSUING_AGENCIES}/${id}`, { method: 'DELETE' })
export const changeIssuingAgencyStatus = (id, status) => $api(`${API_ISSUING_AGENCIES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportIssuingAgencies = params => $api(`${API_ISSUING_AGENCIES}/export`, { params, responseType: 'blob' })

export const fetchDocumentFields = params => $api(API_DOCUMENT_FIELDS, { params })
export const createDocumentField = data => $api(API_DOCUMENT_FIELDS, { method: 'POST', body: data })
export const updateDocumentField = (id, data) => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentField = id => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'DELETE' })
export const changeDocumentFieldStatus = (id, status) => $api(`${API_DOCUMENT_FIELDS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentFields = params => $api(`${API_DOCUMENT_FIELDS}/export`, { params, responseType: 'blob' })

export const fetchDocumentSigners = params => $api(API_DOCUMENT_SIGNERS, { params })
export const createDocumentSigner = data => $api(API_DOCUMENT_SIGNERS, { method: 'POST', body: data })
export const updateDocumentSigner = (id, data) => $api(`${API_DOCUMENT_SIGNERS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentSigner = id => $api(`${API_DOCUMENT_SIGNERS}/${id}`, { method: 'DELETE' })
export const changeDocumentSignerStatus = (id, status) => $api(`${API_DOCUMENT_SIGNERS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentSigners = params => $api(`${API_DOCUMENT_SIGNERS}/export`, { params, responseType: 'blob' })
