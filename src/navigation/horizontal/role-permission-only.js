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
  },
  {
    title: 'User Management',
    icon: { icon: 'tabler-user-cog' },
    to: 'apps-user-list',
  },
  {
    title: 'Activity log',
    icon: { icon: 'tabler-history' },
    to: 'apps-activity-log',
  },
  {
    title: 'Cấu hình hệ thống',
    icon: { icon: 'tabler-settings-cog' },
    to: 'apps-system-settings',
  },
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-shield-lock' },
    children: [
      { title: 'Roles', to: 'apps-roles' },
      { title: 'Permissions', to: 'apps-permissions' },
    ],
  },
]
