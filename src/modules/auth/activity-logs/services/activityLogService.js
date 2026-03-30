import { API_BASE } from '../configs'

export const fetchActivityLogs = params => $api(API_BASE, {
  params,
})

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
