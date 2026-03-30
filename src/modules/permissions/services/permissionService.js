/**
 * Permission Service — CRUDS đầy đủ theo API docs
 */
import { API_BASE } from '../configs'

// ─── CRUD ────────────────────────────────────────
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

// ─── Tree ────────────────────────────────────────
export const fetchPermissionTree = params => {
  return $api(`${API_BASE}/tree`, { params })
}

// ─── Bulk Operations ─────────────────────────────
export const bulkDeletePermissions = ids => {
  return $api(`${API_BASE}/bulk-delete`, { method: 'POST', body: { ids } })
}

// ─── Stats ───────────────────────────────────────
export const fetchPermissionStats = params => {
  return $api(`${API_BASE}/stats`, { params })
}

// ─── Export / Import ─────────────────────────────
export const exportPermissions = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const downloadPermissionTemplate = () => {
  return $api(`${API_BASE}/template`, { responseType: 'blob' })
}

export const importPermissions = file => {
  const formData = new FormData()

  formData.append('file', file)

  return $api(`${API_BASE}/import`, { method: 'POST', body: formData })
}
