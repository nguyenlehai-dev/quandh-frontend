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
export const API_DOCUMENT_TYPES = '/document-types'
export const API_MEETING_TYPES = '/meetings/meeting-types'
export const API_ISSUING_AGENCIES = '/issuing-agencies'
export const API_ISSUING_LEVELS = '/issuing-levels'
export const API_DOCUMENT_FIELDS = '/document-fields'
export const API_DOCUMENT_SIGNERS = '/document-signers'
export const API_POSTS = '/posts'
export const API_POST_CATEGORIES = '/post-categories'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Trạng thái cuộc họp (khớp backend: draft, active, in_progress, completed) */
export const MEETING_STATUSES = [
  { title: 'Nháp', value: 'draft', color: 'secondary' },
  { title: 'Kích hoạt', value: 'active', color: 'info' },
  { title: 'Đang họp', value: 'in_progress', color: 'warning' },
  { title: 'Kết thúc', value: 'completed', color: 'success' },
]

/** Danh sách cột mặc định hiển thị */
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
