/**
 * Email Module Config
 */

/** Base API path */
export const API_BASE = '/email'

/** Email folders */
export const FOLDERS = [
  { title: 'Inbox', value: 'inbox', icon: 'tabler-mail' },
  { title: 'Sent', value: 'sent', icon: 'tabler-send' },
  { title: 'Draft', value: 'draft', icon: 'tabler-file' },
  { title: 'Starred', value: 'starred', icon: 'tabler-star' },
  { title: 'Spam', value: 'spam', icon: 'tabler-alert-octagon' },
  { title: 'Trash', value: 'trash', icon: 'tabler-trash' },
]

/** Email labels */
export const LABELS = [
  { title: 'Personal', value: 'personal', color: 'success' },
  { title: 'Company', value: 'company', color: 'primary' },
  { title: 'Important', value: 'important', color: 'warning' },
  { title: 'Private', value: 'private', color: 'error' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'email.view',
  SEND: 'email.send',
  DELETE: 'email.delete',
}
