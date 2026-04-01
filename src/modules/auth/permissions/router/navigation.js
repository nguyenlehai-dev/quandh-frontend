import { createNavItem } from '../../shared/moduleFactory'

export const permissionsNavItem = createNavItem({
  titleKey: 'navigation.navigation.system.permissions',
  to: 'apps-permissions',
  action: 'read',
  subject: 'Permission',
})

export const navigation = permissionsNavItem
