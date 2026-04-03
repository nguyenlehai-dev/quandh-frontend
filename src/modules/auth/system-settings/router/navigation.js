import { createNavGroup, createNavItem } from '../../shared/moduleFactory'

export const navigation = createNavGroup({
  titleKey: 'navigation.navigation.system.settings',
  icon: 'tabler-settings',
  children: [
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_general',
      to: 'system-settings-general',
      action: 'read',
      subject: 'SystemSetting',
    }),
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_notifications',
      to: 'system-settings-notifications',
      action: 'read',
      subject: 'SystemSetting',
    }),
  ],
})
