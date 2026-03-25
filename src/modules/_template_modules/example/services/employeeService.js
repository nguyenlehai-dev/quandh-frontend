/**
 * Employee Service
 *
 * Tất cả API calls liên quan đến Employee.
 * Tách biệt logic gọi API ra khỏi component/store.
 */
import { API_BASE } from '../configs'

/**
 * Lấy danh sách nhân viên
 * @param {Object} params - Query params (page, perPage, search, department, status...)
 */
export const fetchEmployees = params => {
  return $api(API_BASE, { params })
}

/**
 * Lấy chi tiết 1 nhân viên
 * @param {number} id
 */
export const fetchEmployee = id => {
  return $api(`${API_BASE}/${id}`)
}

/**
 * Tạo mới nhân viên
 * @param {import('../models/Employee').Employee} data
 */
export const createEmployee = data => {
  return $api(API_BASE, {
    method: 'POST',
    body: data,
  })
}

/**
 * Cập nhật nhân viên
 * @param {number} id
 * @param {Partial<import('../models/Employee').Employee>} data
 */
export const updateEmployee = (id, data) => {
  return $api(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * Xóa nhân viên
 * @param {number} id
 */
export const deleteEmployee = id => {
  return $api(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Xuất Excel danh sách nhân viên
 * @param {Object} params - Filters
 */
export const exportEmployees = params => {
  return $api(`${API_BASE}/export`, {
    params,
    responseType: 'blob',
  })
}
