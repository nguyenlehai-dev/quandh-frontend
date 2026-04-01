/**
 * System Settings Service
 */
import { API_GENERAL, API_NOTIFICATION } from '../configs'

export const fetchGeneralSettings = () => $api(API_GENERAL)
export const updateGeneralSettings = data => $api(API_GENERAL, { method: 'PUT', body: data })
export const fetchNotificationSettings = () => $api(API_NOTIFICATION)
export const updateNotificationSettings = data => $api(API_NOTIFICATION, { method: 'PUT', body: data })
