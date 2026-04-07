const uniq = values => [...new Set(values.filter(Boolean))]

export const mapCoreUserToViewModel = user => {
  const assignments = Array.isArray(user?.assignments) ? user.assignments : []
  const roleNames = uniq(assignments.map(item => item.role_name))
  const roleIds = uniq(assignments.map(item => item.role_id))
  const organizations = uniq(assignments.flatMap(item => item.organizations?.map(org => org.name) ?? []))
  const organizationIds = uniq(assignments.flatMap(item => item.organization_ids ?? []))

  return {
    id: user.id,
    fullName: user.name ?? '',
    username: user.user_name ?? '',
    email: user.email ?? '',
    status: user.status ?? 'inactive',
    avatar: '',
    role: roleNames[0] ?? '',
    roles: roleNames,
    roleIds,
    organizations,
    organizationIds,
    assignments: assignments.map(item => ({
      organizationIds: item.organization_ids ?? [],
      organizations: item.organizations ?? [],
      roleId: item.role_id,
      roleName: item.role_name,
    })),
    company: organizations[0] ?? 'N/A',
    updatedBy: user.updated_by ?? 'N/A',
    createdBy: user.created_by ?? 'N/A',
    createdAt: user.created_at ?? '',
    updatedAt: user.updated_at ?? '',
  }
}

export const buildCoreUserAssignmentsPayload = ({ selectedRoleIds, roleOrganizations }) => selectedRoleIds.map(roleId => ({
  role_id: Number(roleId),
  organization_ids: uniq((roleOrganizations[String(roleId)] ?? []).map(Number)),
}))

export const mapCoreUserSortField = sortKey => {
  const sortFieldMap = {
    email: 'email',
    organization: 'updated_at',
    role: 'updated_at',
    status: 'status',
    updatedBy: 'updated_at',
    user: 'name',
  }

  return sortFieldMap[sortKey] ?? 'updated_at'
}
