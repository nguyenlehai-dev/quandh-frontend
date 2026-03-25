/**
 * Permission Service
 */
import { API_BASE } from '../configs'

export const fetchPermissions = params => {
  return $api(API_BASE, { params })
}

export const fetchPermission = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createPermission = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updatePermission = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deletePermission = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}
