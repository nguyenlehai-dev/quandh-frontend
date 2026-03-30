/**
 * Organization Service — CRUDS đầy đủ theo API docs
 */
import { API_BASE } from '../configs'

// ─── CRUD ────────────────────────────────────────
export const fetchOrganizations = params => {
  return $api(API_BASE, { params })
}

export const fetchOrganization = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createOrganization = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateOrganization = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteOrganization = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

// ─── Status ──────────────────────────────────────
export const changeOrganizationStatus = (id, status) => {
  return $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
}

// ─── Tree ────────────────────────────────────────
export const fetchOrganizationTree = params => {
  return $api(`${API_BASE}/tree`, { params })
}

// ─── Bulk Operations ─────────────────────────────
export const bulkDeleteOrganizations = ids => {
  return $api(`${API_BASE}/bulk-delete`, { method: 'POST', body: { ids } })
}

export const bulkUpdateOrganizationStatus = (ids, status) => {
  return $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
}

// ─── Stats ───────────────────────────────────────
export const fetchOrganizationStats = params => {
  return $api(`${API_BASE}/stats`, { params })
}

// ─── Export / Import ─────────────────────────────
export const exportOrganizations = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const downloadOrganizationTemplate = () => {
  return $api(`${API_BASE}/template`, { responseType: 'blob' })
}

export const importOrganizations = file => {
  const formData = new FormData()

  formData.append('file', file)

  return $api(`${API_BASE}/import`, { method: 'POST', body: formData })
}
