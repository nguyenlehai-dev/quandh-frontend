/**
 * Role Service — CRUDS đầy đủ theo API docs
 */
import { API_BASE } from '../configs'

// ─── CRUD ────────────────────────────────────────
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

// ─── Bulk Operations ─────────────────────────────
export const bulkDeleteRoles = ids => {
  return $api(`${API_BASE}/bulk-delete`, { method: 'POST', body: { ids } })
}

// ─── Stats ───────────────────────────────────────
export const fetchRoleStats = params => {
  return $api(`${API_BASE}/stats`, { params })
}

// ─── Export / Import ─────────────────────────────
export const exportRoles = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const importRoles = file => {
  const formData = new FormData()

  formData.append('file', file)

  return $api(`${API_BASE}/import`, { method: 'POST', body: formData })
}
