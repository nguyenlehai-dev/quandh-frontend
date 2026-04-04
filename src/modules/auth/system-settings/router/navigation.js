import { createNavGroup, createNavItem } from '../../shared/moduleFactory'

export const navigation = createNavGroup({
  titleKey: 'navigation.navigation.system.settings',
  icon: 'tabler-settings',
  children: [
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_general',
      to: 'system-settings-general',
      action: 'read',
      subject: 'Setting',
    }),
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_admin_experience',
      to: 'system-settings-admin-experience',
      action: 'read',
      subject: 'Setting',
    }),
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_public_channels',
      to: 'system-settings-public-channels',
      action: 'read',
      subject: 'Setting',
    }),
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_integrations',
      to: 'system-settings-integrations',
      action: 'read',
      subject: 'Setting',
    }),
    createNavItem({
      titleKey: 'navigation.navigation.system.settings_notifications',
      to: 'system-settings-notifications',
      action: 'read',
      subject: 'Setting',
    }),
  ],
})
