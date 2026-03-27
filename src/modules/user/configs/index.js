/**
 * User Module Config
 */

/** Base API path */
export const API_BASE = '/users'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** User statuses */
export const USER_STATUSES = [
  { title: 'Đang hoạt động', value: 'active', color: 'success' },
  { title: 'Chờ duyệt', value: 'pending', color: 'warning' },
  { title: 'Ngưng hoạt động', value: 'inactive', color: 'secondary' },
]

/** User roles */
export const USER_ROLES = [
  { title: 'Admin', value: 'admin', icon: 'tabler-crown', color: 'primary' },
  { title: 'Author', value: 'author', icon: 'tabler-device-desktop', color: 'error' },
  { title: 'Editor', value: 'editor', icon: 'tabler-edit', color: 'warning' },
  { title: 'Maintainer', value: 'maintainer', icon: 'tabler-chart-pie', color: 'info' },
  { title: 'Subscriber', value: 'subscriber', icon: 'tabler-user', color: 'success' },
]

/** Danh sách cột mặc định hiển thị */
export const DEFAULT_COLUMNS = [
  'fullName',
  'email',
  'role',
  'plan',
  'status',
]

/** Permission keys — khớp với Spatie permission trên BE */
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
