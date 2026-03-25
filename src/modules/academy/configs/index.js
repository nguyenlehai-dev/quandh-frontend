/**
 * Academy Module Config
 */

/** Base API path */
export const API_BASE = '/academy'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Danh sách category */
export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design',
  'Marketing',
  'Business',
  'Data Science',
]

/** Danh sách cột mặc định hiển thị */
export const DEFAULT_COLUMNS = [
  'title',
  'instructor',
  'category',
  'duration',
  'students',
  'status',
]

/** Permission keys cho module này */
export const PERMISSIONS = {
  VIEW: 'academy.view',
  CREATE: 'academy.create',
  EDIT: 'academy.edit',
  DELETE: 'academy.delete',
  EXPORT: 'academy.export',
}
