/**
 * Kanban Module Config
 */

/** Base API path */
export const API_BASE = '/kanban'

/** Column types mặc định */
export const DEFAULT_COLUMNS = [
  { title: 'To Do', value: 'todo', color: 'info' },
  { title: 'In Progress', value: 'in_progress', color: 'warning' },
  { title: 'Done', value: 'done', color: 'success' },
]

/** Card priorities */
export const PRIORITIES = [
  { title: 'Low', value: 'low', color: 'info' },
  { title: 'Medium', value: 'medium', color: 'warning' },
  { title: 'High', value: 'high', color: 'error' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'kanban.view',
  CREATE: 'kanban.create',
  EDIT: 'kanban.edit',
  DELETE: 'kanban.delete',
}
