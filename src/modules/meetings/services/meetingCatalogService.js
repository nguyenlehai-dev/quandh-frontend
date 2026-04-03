import {
  API_ATTENDEE_GROUPS,
  API_DOCUMENT_FIELDS,
  API_DOCUMENT_TYPES,
  API_MEETING_TYPES,
} from '../configs'

export const fetchAttendeeGroups = params => $api(API_ATTENDEE_GROUPS, { params })
export const fetchAttendeeGroup = id => $api(`${API_ATTENDEE_GROUPS}/${id}`)
export const createAttendeeGroup = data => $api(API_ATTENDEE_GROUPS, { method: 'POST', body: data })
export const updateAttendeeGroup = (id, data) => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'PUT', body: data })
export const deleteAttendeeGroup = id => $api(`${API_ATTENDEE_GROUPS}/${id}`, { method: 'DELETE' })
export const bulkDeleteAttendeeGroups = data => $api(`${API_ATTENDEE_GROUPS}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateAttendeeGroups = data => $api(`${API_ATTENDEE_GROUPS}/bulk-status`, { method: 'PATCH', body: data })
export const changeAttendeeGroupStatus = (id, status) => $api(`${API_ATTENDEE_GROUPS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportAttendeeGroups = params => $api(`${API_ATTENDEE_GROUPS}/export`, { params, responseType: 'blob' })
export const importAttendeeGroups = data => $api(`${API_ATTENDEE_GROUPS}/import`, { method: 'POST', body: data })

export const fetchDocumentTypes = params => $api(API_DOCUMENT_TYPES, { params })
export const createDocumentType = data => $api(API_DOCUMENT_TYPES, { method: 'POST', body: data })
export const updateDocumentType = (id, data) => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentType = id => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/bulk-status`, { method: 'PATCH', body: data })
export const changeDocumentTypeStatus = (id, status) => $api(`${API_DOCUMENT_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentTypes = params => $api(`${API_DOCUMENT_TYPES}/export`, { params, responseType: 'blob' })
export const importDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/import`, { method: 'POST', body: data })

export const fetchMeetingTypes = params => $api(API_MEETING_TYPES, { params })
export const createMeetingType = data => $api(API_MEETING_TYPES, { method: 'POST', body: data })
export const updateMeetingType = (id, data) => $api(`${API_MEETING_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteMeetingType = id => $api(`${API_MEETING_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-status`, { method: 'PATCH', body: data })
export const changeMeetingTypeStatus = (id, status) => $api(`${API_MEETING_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportMeetingTypes = params => $api(`${API_MEETING_TYPES}/export`, { params, responseType: 'blob' })
export const importMeetingTypes = data => $api(`${API_MEETING_TYPES}/import`, { method: 'POST', body: data })

export const fetchDocumentFields = params => $api(API_DOCUMENT_FIELDS, { params })
export const createDocumentField = data => $api(API_DOCUMENT_FIELDS, { method: 'POST', body: data })
export const updateDocumentField = (id, data) => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentField = id => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'DELETE' })
export const bulkDeleteDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/bulk-status`, { method: 'PATCH', body: data })
export const changeDocumentFieldStatus = (id, status) => $api(`${API_DOCUMENT_FIELDS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentFields = params => $api(`${API_DOCUMENT_FIELDS}/export`, { params, responseType: 'blob' })
export const importDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/import`, { method: 'POST', body: data })
