export default [
  {
    title: 'Hồ sơ cá nhân',
    icon: { icon: 'tabler-user-circle' },
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
    title: 'Quản lý cuộc họp',
    icon: { icon: 'tabler-calendar-event' },
    action: 'read',
    subject: 'Meeting',
    children: [
      { title: 'Danh sách Cuộc họp', to: 'apps-meetings', action: 'read', subject: 'Meeting' },
      { title: 'Danh sách Biểu quyết', to: 'apps-meeting-votings', action: 'read', subject: 'Meeting' },
      { title: 'Danh sách Tài liệu', to: 'apps-meeting-documents', action: 'read', subject: 'Meeting' },
      { title: 'Danh sách Kết luận', to: 'apps-meeting-conclusions', action: 'read', subject: 'Meeting' },
      {
        title: 'Danh mục',
        icon: { icon: 'tabler-category' },
        children: [
          { title: 'Người dự họp', to: 'apps-meeting-attendees', action: 'read', subject: 'Meeting' },
          { title: 'Nhóm người dự họp', to: 'apps-meeting-catalog-attendee-groups', action: 'read', subject: 'Meeting' },
          { title: 'Loại tài liệu', to: 'apps-meeting-catalog-meeting-document-types', action: 'read', subject: 'Meeting' },
          { title: 'Loại cuộc họp', to: 'apps-meeting-catalog-meeting-types', action: 'read', subject: 'Meeting' },
        ],
      },
    ],
  },
  {
    title: 'Quản lý hệ thống',
    icon: { icon: 'tabler-settings-cog' },
    children: [
      { title: 'Tổ chức', to: 'apps-organizations', action: 'read', subject: 'Organization' },
      { title: 'Người dùng', to: 'apps-user-list', action: 'read', subject: 'User' },
      { title: 'Nhật ký hoạt động', to: 'apps-activity-log', action: 'read', subject: 'LogActivity' },
      {
        title: 'Vai trò & Quyền hạn',
        children: [
          { title: 'Vai trò', to: 'apps-roles', action: 'read', subject: 'Role' },
          { title: 'Quyền hạn', to: 'apps-permissions', action: 'read', subject: 'Permission' },
        ],
      },
      {
        title: 'Cấu hình hệ thống',
        children: [
          { title: 'Cấu hình chung', to: 'apps-system-settings-general', action: 'read', subject: 'Setting' },
          { title: 'Cấu hình thông báo', to: 'apps-system-settings-notification', action: 'read', subject: 'Setting' },
        ],
      },
    ],
  },
]
