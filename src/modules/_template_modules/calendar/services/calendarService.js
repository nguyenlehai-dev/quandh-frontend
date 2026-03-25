/**
 * Calendar Service
 *
 * Tất cả API calls liên quan đến Calendar.
 */
import { API_BASE } from '../configs'

/**
 * Lấy danh sách events
 * @param {Object} params - Query params (start, end, type...)
 */
export const fetchEvents = params => {
  return $api(API_BASE, { params })
}

/**
 * Tạo mới event
 * @param {import('../models/Event').CalendarEvent} data
 */
export const createEvent = data => {
  return $api(API_BASE, {
    method: 'POST',
    body: data,
  })
}

/**
 * Cập nhật event
 * @param {number} id
 * @param {Partial<import('../models/Event').CalendarEvent>} data
 */
export const updateEvent = (id, data) => {
  return $api(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * Xóa event
 * @param {number} id
 */
export const deleteEvent = id => {
  return $api(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
}
