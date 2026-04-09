import { getI18n } from '@/plugins/i18n'

const t = key => getI18n().global.t(key)

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
    title: t('meeting.navigation.module'),
    icon: { icon: 'tabler-calendar-event' },
    action: 'read',
    subject: 'Meeting',
    children: [
      {
        title: t('meeting.navigation.catalog'),
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
    title: t('navigation.system_management.title'),
    icon: { icon: 'tabler-settings-cog' },
    children: [
      { title: t('navigation.system_management.organization'), to: 'apps-organizations', action: 'read', subject: 'Organization' },
      { title: t('navigation.system_management.users'), to: 'apps-user-list', action: 'read', subject: 'User' },
      { title: t('navigation.system_management.activity_log'), to: 'apps-activity-log', action: 'read', subject: 'LogActivity' },
      {
        title: t('navigation.system_management.roles_permissions'),
        children: [
          { title: t('navigation.system_management.roles'), to: 'apps-roles', action: 'read', subject: 'Role' },
          { title: t('navigation.system_management.permissions'), to: 'apps-permissions', action: 'read', subject: 'Permission' },
        ],
      },
      {
        title: t('navigation.system_management.settings'),
        children: [
          { title: t('navigation.system_management.general_settings'), to: 'apps-system-settings-general', action: 'read', subject: 'Setting' },
          { title: t('navigation.system_management.notification_settings'), to: 'apps-system-settings-notification', action: 'read', subject: 'Setting' },
        ],
      },
    ],
  },
]
