/**
 * User Service — CRUDS đầy đủ theo API docs
 */
import { API_BASE } from '../configs'

// ─── CRUD ────────────────────────────────────────
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

// ─── Status ──────────────────────────────────────
export const changeUserStatus = (id, status) => {
  return $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
}

// ─── Bulk Operations ─────────────────────────────
export const bulkDeleteUsers = ids => {
  return $api(`${API_BASE}/bulk-delete`, { method: 'POST', body: { ids } })
}

export const bulkUpdateUserStatus = (ids, status) => {
  return $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
}

// ─── Stats ───────────────────────────────────────
export const fetchUserStats = params => {
  return $api(`${API_BASE}/stats`, { params })
}

// ─── Export / Import ─────────────────────────────
export const exportUsers = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const importUsers = file => {
  const formData = new FormData()

  formData.append('file', file)

  return $api(`${API_BASE}/import`, { method: 'POST', body: formData })
}
