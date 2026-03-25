export const navigation = {
  title: 'Cấu hình hệ thống',
  icon: { icon: 'tabler-settings' },
  action: 'read',
  subject: 'SystemSetting',
  children: [
    { title: 'Cấu hình chung', to: 'system-settings-general', action: 'read', subject: 'SystemSetting' },
    { title: 'Cấu hình thông báo', to: 'system-settings-notifications', action: 'read', subject: 'SystemSetting' },
  ],
}
