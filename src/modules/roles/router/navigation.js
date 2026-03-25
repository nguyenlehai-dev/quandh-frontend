export const navigation = {
  title: 'Roles & Permissions',
  icon: { icon: 'tabler-lock' },
  action: 'read',
  subject: 'Role',
  children: [
    { title: 'Roles', to: 'apps-roles', action: 'read', subject: 'Role' },
    { title: 'Permissions', to: 'apps-permissions', action: 'read', subject: 'Permission' },
  ],
}
