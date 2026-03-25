/**
 * Employee Model
 *
 * Định nghĩa cấu trúc dữ liệu của Employee.
 * Dùng để validate, transform, hoặc tạo default values.
 */

/**
 * @typedef {Object} Employee
 * @property {number|null} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string} department
 * @property {string} position
 * @property {string} status - 'active' | 'inactive' | 'on_leave'
 * @property {string|null} avatar
 * @property {string|null} joinDate
 * @property {number|null} salary
 */

/** Employee mặc định khi tạo mới */
export const blankEmployee = {
  id: null,
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  status: 'active',
  avatar: null,
  joinDate: null,
  salary: null,
}

/**
 * Các status có thể có của Employee
 * @type {Array<{title: string, value: string, color: string}>}
 */
export const employeeStatuses = [
  { title: 'Đang làm việc', value: 'active', color: 'success' },
  { title: 'Nghỉ việc', value: 'inactive', color: 'error' },
  { title: 'Nghỉ phép', value: 'on_leave', color: 'warning' },
]

/**
 * Resolve status color
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusColor = status => {
  return employeeStatuses.find(s => s.value === status)?.color || 'secondary'
}

/**
 * Resolve status title
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusTitle = status => {
  return employeeStatuses.find(s => s.value === status)?.title || status
}
