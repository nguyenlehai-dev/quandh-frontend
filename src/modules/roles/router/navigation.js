export const navigation = {
  title: 'Vai trò & Quyền hạn',
  icon: { icon: 'tabler-shield-lock' }, // Changed from lock to shield-lock for better context
  action: 'read',
  subject: 'Role',
  children: [
    { title: 'Vai trò', to: 'apps-roles', action: 'read', subject: 'Role' },
    { title: 'Quyền hạn', to: 'apps-permissions', action: 'read', subject: 'Permission' },
  ],
}
