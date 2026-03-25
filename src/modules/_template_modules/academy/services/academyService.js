/**
 * Academy Service
 *
 * Tất cả API calls liên quan đến Academy.
 */
import { API_BASE } from '../configs'

/**
 * Lấy danh sách khóa học
 * @param {Object} params - Query params (page, perPage, search, category, status...)
 */
export const fetchCourses = params => {
  return $api(API_BASE, { params })
}

/**
 * Lấy chi tiết 1 khóa học
 * @param {number} id
 */
export const fetchCourse = id => {
  return $api(`${API_BASE}/${id}`)
}

/**
 * Tạo mới khóa học
 * @param {import('../models/Course').Course} data
 */
export const createCourse = data => {
  return $api(API_BASE, {
    method: 'POST',
    body: data,
  })
}

/**
 * Cập nhật khóa học
 * @param {number} id
 * @param {Partial<import('../models/Course').Course>} data
 */
export const updateCourse = (id, data) => {
  return $api(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * Xóa khóa học
 * @param {number} id
 */
export const deleteCourse = id => {
  return $api(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Xuất Excel danh sách khóa học
 * @param {Object} params - Filters
 */
export const exportCourses = params => {
  return $api(`${API_BASE}/export`, {
    params,
    responseType: 'blob',
  })
}
