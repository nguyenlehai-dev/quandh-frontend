/**
 * Activity Logs Module Config
 */
export const API_BASE = '/activity-logs'
export const DEFAULT_PER_PAGE = 25
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]
export const DEFAULT_COLUMNS = ['user', 'action', 'description', 'createdAt']
export const PERMISSIONS = {
  VIEW: 'activity-log.view',
  DELETE: 'activity-log.delete',
}
