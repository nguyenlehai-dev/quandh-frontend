import { getI18n } from '@/plugins/i18n'

const t = key => getI18n().global.t(key)

export const navigation = {
  title: t('navigation.navigation.system.settings'),
  icon: { icon: 'tabler-settings' },
  action: 'read',
  subject: 'SystemSetting',
  children: [
    { title: t('navigation.navigation.system.settings_general'), to: 'system-settings-general', action: 'read', subject: 'SystemSetting' },
    { title: t('navigation.navigation.system.settings_notifications'), to: 'system-settings-notifications', action: 'read', subject: 'SystemSetting' },
  ],
}
