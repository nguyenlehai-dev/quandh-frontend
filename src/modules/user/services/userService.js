/**
 * User Service
 */
import { API_BASE } from '../configs'

export const fetchUsers = params => {
  return $api(API_BASE, { params })
}

export const fetchUser = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createUser = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateUser = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteUser = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const exportUsers = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const updateUserStatus = (id, status) => {
  return $api(`${API_BASE}/${id}/status`, { method: 'PUT', body: { status } })
}
