/* eslint-disable camelcase, padding-line-between-statements */

import * as XLSX from 'xlsx'
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
export const downloadAttendeeGroupImportTemplate = () => {
  const rows = [
    {
      name: 'Dai bieu chinh thuc',
      description: 'Nhom dai bieu chinh thuc tham du hop',
      status: 'active',
      meeting_type_id: 1,
    },
    {
      name: 'Khach moi',
      description: 'Khach moi tham du theo tung cuoc hop',
      status: 'active',
      meeting_type_id: '',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'description', 'status', 'meeting_type_id'],
  })
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 18 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'AttendeeGroups')
  XLSX.writeFile(workbook, 'attendee-groups-import-template.xlsx')
}

export const fetchAttendeeGroupMembers = attendeeGroupId => $api(`${API_ATTENDEE_GROUPS}/${attendeeGroupId}/members`)
export const createAttendeeGroupMember = (attendeeGroupId, data) => $api(`${API_ATTENDEE_GROUPS}/${attendeeGroupId}/members`, { method: 'POST', body: data })
export const updateAttendeeGroupMember = (attendeeGroupId, memberId, data) => $api(`${API_ATTENDEE_GROUPS}/${attendeeGroupId}/members/${memberId}`, { method: 'PUT', body: data })
export const deleteAttendeeGroupMember = (attendeeGroupId, memberId) => $api(`${API_ATTENDEE_GROUPS}/${attendeeGroupId}/members/${memberId}`, { method: 'DELETE' })

export const fetchDocumentTypes = params => $api(API_DOCUMENT_TYPES, { params })
export const createDocumentType = data => $api(API_DOCUMENT_TYPES, { method: 'POST', body: data })
export const updateDocumentType = (id, data) => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentType = id => $api(`${API_DOCUMENT_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/bulk-status`, { method: 'PATCH', body: data })
export const changeDocumentTypeStatus = (id, status) => $api(`${API_DOCUMENT_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentTypes = params => $api(`${API_DOCUMENT_TYPES}/export`, { params, responseType: 'blob' })
export const importDocumentTypes = data => $api(`${API_DOCUMENT_TYPES}/import`, { method: 'POST', body: data })
export const downloadDocumentTypeImportTemplate = () => {
  const rows = [
    {
      name: 'Tai lieu trinh bay',
      description: 'Tai lieu dung trong phien hop',
      status: 'active',
      meeting_type_id: 1,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'description', 'status', 'meeting_type_id'],
  })
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 18 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'DocumentTypes')
  XLSX.writeFile(workbook, 'meeting-document-types-import-template.xlsx')
}

export const fetchMeetingTypes = params => $api(API_MEETING_TYPES, { params })
export const createMeetingType = data => $api(API_MEETING_TYPES, { method: 'POST', body: data })
export const updateMeetingType = (id, data) => $api(`${API_MEETING_TYPES}/${id}`, { method: 'PUT', body: data })
export const deleteMeetingType = id => $api(`${API_MEETING_TYPES}/${id}`, { method: 'DELETE' })
export const bulkDeleteMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateMeetingTypes = data => $api(`${API_MEETING_TYPES}/bulk-status`, { method: 'PATCH', body: data })
export const changeMeetingTypeStatus = (id, status) => $api(`${API_MEETING_TYPES}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportMeetingTypes = params => $api(`${API_MEETING_TYPES}/export`, { params, responseType: 'blob' })
export const importMeetingTypes = data => $api(`${API_MEETING_TYPES}/import`, { method: 'POST', body: data })
export const downloadMeetingTypeImportTemplate = () => {
  const rows = [
    {
      name: 'Hop giao ban',
      description: 'Loai cuoc hop giao ban dinh ky',
      status: 'active',
    },
    {
      name: 'Hop chuyen de',
      description: 'Loai cuoc hop chuyen de',
      status: 'active',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'description', 'status'],
  })
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 16 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'MeetingTypes')
  XLSX.writeFile(workbook, 'meeting-types-import-template.xlsx')
}

export const fetchDocumentFields = params => $api(API_DOCUMENT_FIELDS, { params })
export const createDocumentField = data => $api(API_DOCUMENT_FIELDS, { method: 'POST', body: data })
export const updateDocumentField = (id, data) => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'PUT', body: data })
export const deleteDocumentField = id => $api(`${API_DOCUMENT_FIELDS}/${id}`, { method: 'DELETE' })
export const bulkDeleteDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/bulk-delete`, { method: 'POST', body: data })
export const bulkUpdateDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/bulk-status`, { method: 'PATCH', body: data })
export const changeDocumentFieldStatus = (id, status) => $api(`${API_DOCUMENT_FIELDS}/${id}/status`, { method: 'PATCH', body: { status } })
export const exportDocumentFields = params => $api(`${API_DOCUMENT_FIELDS}/export`, { params, responseType: 'blob' })
export const importDocumentFields = data => $api(`${API_DOCUMENT_FIELDS}/import`, { method: 'POST', body: data })
export const downloadDocumentFieldImportTemplate = () => {
  const rows = [
    {
      name: 'Nhan su',
      description: 'Linh vuc tai lieu lien quan nhan su',
      status: 'active',
    },
    {
      name: 'Tai chinh',
      description: 'Linh vuc tai lieu lien quan tai chinh',
      status: 'active',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'description', 'status'],
  })
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 16 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'DocumentFields')
  XLSX.writeFile(workbook, 'meeting-document-fields-import-template.xlsx')
}
