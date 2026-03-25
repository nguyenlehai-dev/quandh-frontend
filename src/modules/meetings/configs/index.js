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

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Trạng thái cuộc họp */
export const MEETING_STATUSES = [
  { title: 'Đang lên lịch', value: 'scheduled', color: 'info' },
  { title: 'Đang diễn ra', value: 'in_progress', color: 'warning' },
  { title: 'Đã hoàn thành', value: 'completed', color: 'success' },
  { title: 'Đã hủy', value: 'cancelled', color: 'error' },
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
