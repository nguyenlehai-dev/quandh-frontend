import { API_BASE } from '../configs'

export const fetchStandardRootModules = params => $api(API_BASE, { params })
export const fetchStandardRootModule = id => $api(`${API_BASE}/${id}`)
export const createStandardRootModule = data => $api(API_BASE, { method: 'POST', body: data })
export const updateStandardRootModule = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteStandardRootModule = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
