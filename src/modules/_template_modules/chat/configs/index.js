/**
 * Chat Module Config
 */

/** Base API path */
export const API_BASE = '/chat'

/** Loại tin nhắn */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
}

/** Trạng thái tin nhắn */
export const MESSAGE_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
}

/** Trạng thái online */
export const USER_STATUSES = [
  { title: 'Online', value: 'online', color: 'success' },
  { title: 'Away', value: 'away', color: 'warning' },
  { title: 'Do Not Disturb', value: 'busy', color: 'error' },
  { title: 'Offline', value: 'offline', color: 'secondary' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'chat.view',
  SEND: 'chat.send',
  DELETE: 'chat.delete',
}
