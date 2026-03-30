/**
 * Permissions Module Utils
 */

/**
 * Format permission name sang dạng đọc được
 * @param {string} name - e.g. 'user.view'
 * @returns {string} - e.g. 'User View'
 */
export const formatPermissionName = name => {
  if (!name) return ''

  return name
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Kiểm tra user có permission không
 * @param {Array<string>} userPermissions
 * @param {string} requiredPermission
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions?.length) return false

  return userPermissions.includes(requiredPermission)
}
