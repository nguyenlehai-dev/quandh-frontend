/**
 * Permission Model
 */

/**
 * @typedef {Object} Permission
 * @property {number|null} id
 * @property {string} name - Machine name (e.g. 'user.view')
 * @property {string} displayName
 * @property {string|null} description
 * @property {string} module - Module mà permission thuộc về
 * @property {string} createdAt
 */

export const blankPermission = {
  id: null,
  name: '',
  displayName: '',
  description: null,
  module: '',
  createdAt: null,
}

/**
 * Group permissions theo module
 * @param {Array<Permission>} permissions
 * @returns {Object} - { moduleName: [permissions] }
 */
export const groupByModule = permissions => {
  return permissions.reduce((groups, perm) => {
    const module = perm.module || 'other'

    if (!groups[module]) groups[module] = []
    groups[module].push(perm)

    return groups
  }, {})
}
