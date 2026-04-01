/**
 * Email Service
 */
import { API_BASE } from '../configs'

export const fetchEmails = params => {
  return $api(API_BASE, { params })
}

export const fetchEmail = id => {
  return $api(`${API_BASE}/${id}`)
}

export const sendEmail = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateEmail = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PATCH', body: data })
}

export const deleteEmail = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const moveToFolder = (id, folder) => {
  return $api(`${API_BASE}/${id}/move`, { method: 'POST', body: { folder } })
}

export const toggleStar = id => {
  return $api(`${API_BASE}/${id}/star`, { method: 'POST' })
}

export const markAsRead = ids => {
  return $api(`${API_BASE}/mark-read`, { method: 'POST', body: { ids } })
}
