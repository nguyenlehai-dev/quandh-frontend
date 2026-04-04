import { API_BASE } from '../configs'

export const fetchSystemSettings = () => $api(API_BASE)

export const fetchPublicSystemSettings = () => $api(`${API_BASE}/public`)

export const fetchSystemSetting = key => $api(`${API_BASE}/${key}`)

export const updateSystemSettings = payload => $api(API_BASE, {
  method: 'PUT',
  body: payload,
})

export const normalizeSettingGroups = response => response?.data ?? response ?? {}

export const pickSettingGroup = (groups, groupName, fallback = {}) => groups?.[groupName] ?? fallback
