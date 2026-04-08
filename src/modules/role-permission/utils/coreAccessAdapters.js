const uniq = values => [...new Set(values.filter(Boolean))]

export const flattenPermissionTree = (nodes = []) => nodes.flatMap(node => [
  node,
  ...flattenPermissionTree(node.children ?? []),
])

export const mapCoreRoleToOption = role => ({
  title: role.name,
  value: role.id,
})

export const buildPermissionGroupsFromTree = permissionTree => permissionTree.map(group => ({
  id: group.id,
  description: group.description,
  permissions: (group.children ?? []).map(permission => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
  })),
  title: group.description || group.name,
}))

export const buildPermissionNameIdLookup = permissionTree => {
  const lookup = {}

  flattenPermissionTree(permissionTree).forEach(permission => {
    lookup[permission.name] = permission.id
  })

  return lookup
}

export const buildPermissionRoleAssignments = (permissions = [], roles = []) => permissions.map(permission => ({
  ...permission,
  assignedRoleIds: roles
    .filter(role => (role.permissions ?? []).includes(permission.name))
    .map(role => role.id),
  assignedRoleNames: roles
    .filter(role => (role.permissions ?? []).includes(permission.name))
    .map(role => role.name),
}))

export const buildRolePermissionIds = ({ permissionNames = [], permissionNameIdLookup }) => uniq(
  permissionNames
    .map(permissionName => permissionNameIdLookup[permissionName])
    .map(Number),
)

export const buildUpdatedRolePermissionIds = ({
  existingPermissionNames = [],
  nextPermissionNames = [],
  permissionNameIdLookup,
}) => buildRolePermissionIds({
  permissionNameIdLookup,
  permissionNames: uniq([...existingPermissionNames, ...nextPermissionNames])
    .filter(permissionName => nextPermissionNames.includes(permissionName)),
})
