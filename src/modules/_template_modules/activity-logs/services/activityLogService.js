/**
 * Activity Log Service
 */
import { API_BASE } from '../configs'

export const fetchActivityLogs = params => $api(API_BASE, { params })
export const fetchActivityLog = id => $api(`${API_BASE}/${id}`)
export const deleteActivityLog = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
export const exportActivityLogs = params => $api(`${API_BASE}/export`, { params, responseType: 'blob' })
