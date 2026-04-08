import { getI18n } from '@/plugins/i18n'

const t = key => getI18n().global.t(key)

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
    title: t('meeting.navigation.module'),
    icon: { icon: 'tabler-calendar-event' },
    action: 'read',
    subject: 'Meeting',
    children: [
      {
        title: t('meeting.navigation.catalog'),
        icon: { icon: 'tabler-category' },
        children: [
          { title: t('meeting.childTabs.participants'), to: 'apps-meeting-attendees', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.attendee_groups.title'), to: 'apps-meeting-catalog-attendee-groups', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.meeting_document_types.title'), to: 'apps-meeting-catalog-meeting-document-types', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.meeting_document_fields.title'), to: 'apps-meeting-catalog-meeting-document-fields', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.meeting_types.title'), to: 'apps-meeting-catalog-meeting-types', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.meeting_document_signers.title'), to: 'apps-meeting-catalog-meeting-document-signers', action: 'read', subject: 'Meeting' },
          { title: t('meeting.catalogs.meeting_issuing_agencies.title'), to: 'apps-meeting-catalog-meeting-issuing-agencies', action: 'read', subject: 'Meeting' },
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
