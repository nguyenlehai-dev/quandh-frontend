/**
 * Role Service
 */
import { API_BASE } from '../configs'

export const fetchRoles = params => {
  return $api(API_BASE, { params })
}

export const fetchRole = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createRole = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateRole = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteRole = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const assignPermissions = (id, permissions) => {
  return $api(`${API_BASE}/${id}/permissions`, { method: 'PUT', body: { permissions } })
}
