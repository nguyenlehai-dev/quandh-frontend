import { createNavItem } from '../../shared/moduleFactory'

export const navigation = createNavItem({
  titleKey: 'navigation.navigation.system.organizations',
  to: 'system-organizations',
  icon: 'tabler-building',
  action: 'read',
  subject: 'Organization',
})
