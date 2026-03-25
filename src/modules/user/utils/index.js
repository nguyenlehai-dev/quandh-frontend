/**
 * User Module Utils
 */

/**
 * Resolve user role variant
 * @param {string} role
 * @returns {{ color: string, icon: string }}
 */
export const resolveUserRoleVariant = role => {
  const variants = {
    admin: { color: 'primary', icon: 'tabler-crown' },
    author: { color: 'error', icon: 'tabler-device-desktop' },
    editor: { color: 'warning', icon: 'tabler-edit' },
    maintainer: { color: 'info', icon: 'tabler-chart-pie' },
    subscriber: { color: 'success', icon: 'tabler-user' },
  }

  return variants[role?.toLowerCase()] || { color: 'primary', icon: 'tabler-user' }
}

/**
 * Resolve user status color
 * @param {string} status
 * @returns {string}
 */
export const resolveUserStatusVariant = status => {
  const colors = {
    active: 'success',
    pending: 'warning',
    inactive: 'secondary',
  }

  return colors[status?.toLowerCase()] || 'primary'
}

/**
 * Tạo avatar text từ tên đầy đủ
 * @param {string} fullName
 * @returns {string}
 */
export const getAvatarText = fullName => {
  if (!fullName) return ''

  return fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
