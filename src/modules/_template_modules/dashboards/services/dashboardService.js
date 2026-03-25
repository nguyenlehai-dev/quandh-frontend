/**
 * Dashboard Service
 *
 * Tất cả API calls liên quan đến Dashboard data.
 */
import { API_BASE } from '../configs'

/**
 * Lấy dữ liệu Analytics dashboard
 */
export const fetchAnalyticsData = () => {
  return $api(`${API_BASE}/analytics`)
}

/**
 * Lấy dữ liệu CRM dashboard
 */
export const fetchCrmData = () => {
  return $api(`${API_BASE}/crm`)
}

/**
 * Lấy dữ liệu Ecommerce dashboard
 */
export const fetchEcommerceData = () => {
  return $api(`${API_BASE}/ecommerce`)
}

/**
 * Lấy thống kê tổng quan
 * @param {Object} params - { period: 'week' | 'month' | 'year' }
 */
export const fetchStatistics = params => {
  return $api(`${API_BASE}/statistics`, { params })
}
