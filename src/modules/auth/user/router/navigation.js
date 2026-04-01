import { createNavItem } from '../../shared/moduleFactory'

export const navigation = createNavItem({
  titleKey: 'navigation.navigation.system.users',
  icon: 'tabler-users',
  action: 'read',
  subject: 'User',
  to: 'apps-user-list',
})
