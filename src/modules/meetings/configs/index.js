/**
 * Meetings Module Config
 */

/** Base API path */
export const API_BASE = '/meetings'

/** API paths cho sub-resources */
export const API_VOTES = '/meetings/votes'
export const API_DOCUMENTS = '/meetings/documents'
export const API_CONCLUSIONS = '/meetings/conclusions'
export const API_ATTENDEES = '/meetings/attendees'
export const API_ATTENDEE_GROUPS = '/meetings/attendee-groups'
export const API_DOCUMENT_TYPES = '/meetings/meeting-document-types'
export const API_MEETING_TYPES = '/meetings/meeting-types'
export const API_ISSUING_AGENCIES = '/meetings/meeting-issuing-agencies'
export const API_DOCUMENT_FIELDS = '/meetings/meeting-document-fields'
export const API_DOCUMENT_SIGNERS = '/meetings/meeting-document-signers'

/** So dong mac dinh tren 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Cac tuy chon items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Trang thai cuoc hop */
export const MEETING_STATUSES = [
  { title: 'Nhap', value: 'draft', color: 'secondary' },
  { title: 'Kich hoat', value: 'active', color: 'info' },
  { title: 'Dang hop', value: 'in_progress', color: 'warning' },
  { title: 'Ket thuc', value: 'completed', color: 'success' },
]

/** Danh sach cot mac dinh hien thi */
export const DEFAULT_COLUMNS = [
  'title',
  'meetingType',
  'startTime',
  'status',
  'attendeesCount',
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'meeting.view',
  CREATE: 'meeting.create',
  EDIT: 'meeting.edit',
  DELETE: 'meeting.delete',
  EXPORT: 'meeting.export',
}
