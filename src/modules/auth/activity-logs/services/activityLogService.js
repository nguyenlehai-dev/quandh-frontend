import { API_BASE } from '../configs'

export const fetchActivityLogs = params => $api(API_BASE, {
  params,
})

export const fetchActivityLog = id => $api(`${API_BASE}/${id}`)

export const fetchActivityLogStats = params => $api(`${API_BASE}/stats`, {
  params,
})

export const exportActivityLogs = params => $api(`${API_BASE}/export`, {
  params,
  responseType: 'blob',
})

export const bulkDeleteActivityLogs = ids => $api(`${API_BASE}/bulk-delete`, {
  method: 'POST',
  body: { ids },
})

export const deleteActivityLog = id => $api(`${API_BASE}/${id}`, {
  method: 'DELETE',
})

export const deleteActivityLogsByDate = payload => $api(`${API_BASE}/delete-by-date`, {
  method: 'POST',
  body: payload,
})

export const clearAllActivityLogs = () => $api(`${API_BASE}/clear`, {
  method: 'POST',
})
