/**
 * Meetings Module Config
 */

/** Base API paths */
export const API_BASE = '/meetings'
export const API_ADMIN_MEETINGS = '/admin/meetings'
export const API_PARTICIPANT = '/participant'

/** Admin aggregate APIs */
export const API_VOTES = `${API_ADMIN_MEETINGS}/all-votings`
export const API_DOCUMENTS = `${API_ADMIN_MEETINGS}/all-documents`
export const API_CONCLUSIONS = `${API_ADMIN_MEETINGS}/all-conclusions`
export const API_ATTENDEES = `${API_ADMIN_MEETINGS}/all-participants`

/** Catalog APIs */
export const API_ATTENDEE_GROUPS = '/attendee-groups'
export const API_DOCUMENT_TYPES = '/meeting-document-types'
export const API_MEETING_TYPES = '/meeting-types'
export const API_DOCUMENT_FIELDS = '/meeting-document-fields'

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
  VIEW: 'meetings.index',
  CREATE: 'meetings.store',
  EDIT: 'meetings.update',
  DELETE: 'meetings.destroy',
  EXPORT: 'meetings.export',
}
