/**
 * Course Model
 *
 * Định nghĩa cấu trúc dữ liệu của Course.
 */

/**
 * @typedef {Object} Course
 * @property {number|null} id
 * @property {string} title
 * @property {string} description
 * @property {string} instructor
 * @property {string} category
 * @property {number} duration - Thời lượng (phút)
 * @property {number} students - Số học viên
 * @property {number} rating
 * @property {string} status - 'draft' | 'published' | 'archived'
 * @property {string|null} thumbnail
 * @property {string|null} startDate
 */

/** Course mặc định khi tạo mới */
export const blankCourse = {
  id: null,
  title: '',
  description: '',
  instructor: '',
  category: '',
  duration: 0,
  students: 0,
  rating: 0,
  status: 'draft',
  thumbnail: null,
  startDate: null,
}

/**
 * Các status có thể có của Course
 * @type {Array<{title: string, value: string, color: string}>}
 */
export const courseStatuses = [
  { title: 'Bản nháp', value: 'draft', color: 'warning' },
  { title: 'Đã xuất bản', value: 'published', color: 'success' },
  { title: 'Lưu trữ', value: 'archived', color: 'secondary' },
]

/**
 * Resolve status color
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusColor = status => {
  return courseStatuses.find(s => s.value === status)?.color || 'secondary'
}

/**
 * Resolve status title
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusTitle = status => {
  return courseStatuses.find(s => s.value === status)?.title || status
}
