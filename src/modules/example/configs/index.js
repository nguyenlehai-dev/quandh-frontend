/**
 * Employee Module Config
 *
 * Cấu hình chung cho module: API endpoints, pagination, permissions...
 */

/** Base API path */
export const API_BASE = '/employees'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Danh sách phòng ban */
export const DEPARTMENTS = [
  'Kỹ thuật',
  'Kinh doanh',
  'Nhân sự',
  'Marketing',
  'Kế toán',
  'Hành chính',
]

/** Danh sách cột mặc định hiển thị */
export const DEFAULT_COLUMNS = [
  'fullName',
  'email',
  'department',
  'position',
  'status',
  'joinDate',
]

/** Permission keys cho module này */
export const PERMISSIONS = {
  VIEW: 'employee.view',
  CREATE: 'employee.create',
  EDIT: 'employee.edit',
  DELETE: 'employee.delete',
  EXPORT: 'employee.export',
}
