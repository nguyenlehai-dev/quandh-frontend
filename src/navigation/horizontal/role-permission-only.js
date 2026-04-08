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
  {
    title: 'Họp không giấy',
    icon: { icon: 'tabler-calendar-event' },
    action: 'read',
    subject: 'Meeting',
    children: [
      { title: 'Danh sách Cuộc họp', to: 'apps-meetings', action: 'read', subject: 'Meeting' },
      { title: 'Loại cuộc họp', to: { name: 'apps-meeting-catalog', params: { resource: 'meeting-types' } }, action: 'read', subject: 'Meeting' },
      { title: 'Thành viên nhóm', to: { name: 'apps-meeting-catalog', params: { resource: 'attendee-groups' } }, action: 'read', subject: 'Meeting' },
      { title: 'Loại tài liệu', to: { name: 'apps-meeting-catalog', params: { resource: 'meeting-document-types' } }, action: 'read', subject: 'Meeting' },
      { title: 'Lĩnh vực tài liệu', to: { name: 'apps-meeting-catalog', params: { resource: 'meeting-document-fields' } }, action: 'read', subject: 'Meeting' },
      { title: 'Người ký tài liệu', to: { name: 'apps-meeting-catalog', params: { resource: 'meeting-document-signers' } }, action: 'read', subject: 'Meeting' },
      { title: 'Cơ quan ban hành', to: { name: 'apps-meeting-catalog', params: { resource: 'meeting-issuing-agencies' } }, action: 'read', subject: 'Meeting' },
    ],
  },
]
