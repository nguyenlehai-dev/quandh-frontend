/**
 * Role Model
 */

/**
 * @typedef {Object} Role
 * @property {number|null} id
 * @property {string} name
 * @property {string} displayName
 * @property {string|null} description
 * @property {Array<string>} permissions - Danh sách permission names
 * @property {number} usersCount - Số user có role này
 * @property {string} createdAt
 */

export const blankRole = {
  id: null,
  name: '',
  displayName: '',
  description: null,
  permissions: [],
  usersCount: 0,
  createdAt: null,
}

/**
 * Resolve role color
 * @param {string} roleName
 * @returns {string}
 */
export const resolveRoleColor = roleName => {
  const colors = {
    admin: 'error',
    editor: 'info',
    author: 'warning',
    maintainer: 'success',
    subscriber: 'primary',
  }

  return colors[roleName?.toLowerCase()] || 'secondary'
}

/**
 * Resolve role icon
 * @param {string} roleName
 * @returns {string}
 */
export const resolveRoleIcon = roleName => {
  const icons = {
    admin: 'tabler-crown',
    editor: 'tabler-edit',
    author: 'tabler-device-desktop',
    maintainer: 'tabler-chart-pie',
    subscriber: 'tabler-user',
  }

  return icons[roleName?.toLowerCase()] || 'tabler-user'
}
