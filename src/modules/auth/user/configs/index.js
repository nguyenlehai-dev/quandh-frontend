/**
 * User Module Config
 */
import { DEFAULT_PER_PAGE_OPTIONS } from '../../shared/config'

export const API_BASE = '/users'
export const DEFAULT_PER_PAGE = 10
export const PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS

export const USER_STATUSES = [
  { title: 'Dang hoat dong', value: 'active', color: 'success' },
  { title: 'Tam khoa', value: 'inactive', color: 'warning' },
  { title: 'Bi cam', value: 'banned', color: 'error' },
]

export const USER_ROLES = [
  { title: 'Admin', value: 'admin', icon: 'tabler-crown', color: 'primary' },
  { title: 'Author', value: 'author', icon: 'tabler-device-desktop', color: 'error' },
  { title: 'Editor', value: 'editor', icon: 'tabler-edit', color: 'warning' },
  { title: 'Maintainer', value: 'maintainer', icon: 'tabler-chart-pie', color: 'info' },
  { title: 'Subscriber', value: 'subscriber', icon: 'tabler-user', color: 'success' },
]

export const DEFAULT_COLUMNS = ['fullName', 'email', 'role', 'plan', 'status']

export const PERMISSIONS = {
  VIEW: 'user.view',
  CREATE: 'user.create',
  EDIT: 'user.edit',
  DELETE: 'user.delete',
  EXPORT: 'user.export',
  IMPORT: 'user.import',
  BULK_DELETE: 'user.bulkDestroy',
  BULK_STATUS: 'user.bulkUpdateStatus',
  STATS: 'user.stats',
  CHANGE_STATUS: 'user.changeStatus',
}
