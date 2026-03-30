/**
 * Roles Module Utils
 */

/**
 * Format role name sang dạng displayable
 * @param {string} name
 * @returns {string}
 */
export const formatRoleName = name => {
  if (!name) return ''

  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Đếm số permissions theo module
 * @param {Array<string>} permissions
 * @returns {Object} - { module: count }
 */
export const countPermissionsByModule = permissions => {
  if (!permissions?.length) return {}

  return permissions.reduce((counts, perm) => {
    const module = perm.split('.')[0] || 'other'

    counts[module] = (counts[module] || 0) + 1

    return counts
  }, {})
}
