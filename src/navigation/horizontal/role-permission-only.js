export default [
  {
    title: 'Hồ sơ cá nhân',
    to: 'apps-profile',
  },
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-layout-dashboard' },
    children: [
      { title: 'System Overview', to: 'dashboards-overview' },
      { title: 'Business Overview', to: 'dashboards-business' },
    ],
  },
  {
    title: 'Organization',
    icon: { icon: 'tabler-building-community' },
    to: 'apps-organizations',
    action: 'read',
    subject: 'Organization',
  },
  {
    title: 'User Management',
    icon: { icon: 'tabler-user-cog' },
    to: 'apps-user-list',
    action: 'read',
    subject: 'User',
  },
  {
    title: 'Activity log',
    icon: { icon: 'tabler-history' },
    to: 'apps-activity-log',
    action: 'read',
    subject: 'LogActivity',
  },
  {
    title: 'Cấu hình hệ thống',
    icon: { icon: 'tabler-settings-cog' },
    to: 'apps-system-settings',
    action: 'read',
    subject: 'Setting',
  },
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-shield-lock' },
    children: [
      { title: 'Roles', to: 'apps-roles', action: 'read', subject: 'Role' },
      { title: 'Permissions', to: 'apps-permissions', action: 'read', subject: 'Permission' },
    ],
  },
]
