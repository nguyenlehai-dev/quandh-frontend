/**
 * Organization Service
 */
import { API_BASE } from '../configs'

export const fetchOrganizations = params => $api(API_BASE, { params })
export const fetchOrganization = id => $api(`${API_BASE}/${id}`)
export const createOrganization = data => $api(API_BASE, { method: 'POST', body: data })
export const updateOrganization = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteOrganization = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
