/**
 * User Model
 */

/**
 * @typedef {Object} User
 * @property {number|null} id
 * @property {string} fullName
 * @property {string} email
 * @property {string|null} phone
 * @property {string} role - 'admin' | 'author' | 'editor' | 'maintainer' | 'subscriber'
 * @property {string} status - 'active' | 'pending' | 'inactive'
 * @property {string|null} currentPlan
 * @property {string|null} avatar
 * @property {string|null} billing
 * @property {string|null} company
 * @property {string|null} country
 */

export const blankUser = {
  id: null,
  fullName: '',
  email: '',
  phone: null,
  role: 'subscriber',
  status: 'active',
  currentPlan: null,
  avatar: null,
  billing: null,
  company: null,
  country: null,
}

/**
 * Các status có thể có
 * @type {Array<{title: string, value: string, color: string}>}
 */
export const userStatuses = [
  { title: 'Đang hoạt động', value: 'active', color: 'success' },
  { title: 'Chờ duyệt', value: 'pending', color: 'warning' },
  { title: 'Ngưng hoạt động', value: 'inactive', color: 'secondary' },
]

/**
 * Resolve status color
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusColor = status => {
  return userStatuses.find(s => s.value === status)?.color || 'primary'
}

/**
 * Resolve role variant (color + icon)
 * @param {string} role
 * @returns {{ color: string, icon: string }}
 */
export const resolveRoleVariant = role => {
  const variants = {
    admin: { color: 'primary', icon: 'tabler-crown' },
    author: { color: 'error', icon: 'tabler-device-desktop' },
    editor: { color: 'warning', icon: 'tabler-edit' },
    maintainer: { color: 'info', icon: 'tabler-chart-pie' },
    subscriber: { color: 'success', icon: 'tabler-user' },
  }

  return variants[role?.toLowerCase()] || { color: 'primary', icon: 'tabler-user' }
}
