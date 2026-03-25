/**
 * Calendar Module Config
 */

/** Base API path */
export const API_BASE = '/calendar'

/** Danh sách màu sắc sự kiện */
export const EVENT_COLORS = {
  Business: 'primary',
  Holiday: 'success',
  Personal: 'error',
  Family: 'warning',
  ETC: 'info',
}

/** Danh sách loại sự kiện */
export const EVENT_TYPES = [
  'Business',
  'Holiday',
  'Personal',
  'Family',
  'ETC',
]

/** Permission keys cho module này */
export const PERMISSIONS = {
  VIEW: 'calendar.view',
  CREATE: 'calendar.create',
  EDIT: 'calendar.edit',
  DELETE: 'calendar.delete',
}
