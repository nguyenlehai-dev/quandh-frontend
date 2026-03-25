/**
 * Employee Module Utils
 *
 * Các hàm tiện ích dùng riêng trong module Employee.
 */

/**
 * Format salary thành chuỗi tiền tệ VNĐ
 * @param {number} value
 * @returns {string}
 */
export const formatSalary = value => {
  if (!value && value !== 0) return '—'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Tạo initials từ tên đầy đủ (dùng cho avatar placeholder)
 * @param {string} fullName
 * @returns {string}
 */
export const getInitials = fullName => {
  if (!fullName) return ''

  return fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Build query string cho export
 * @param {Object} filters
 * @returns {Object}
 */
export const buildExportParams = filters => {
  const params = {}

  if (filters.search) params.search = filters.search
  if (filters.department) params.department = filters.department
  if (filters.status) params.status = filters.status

  return params
}
