import { createNavItem } from '../../../auth/shared/moduleFactory'

export const navigation = createNavItem({
  titleKey: 'navigation.navigation.system.standard_auth_module',
  icon: 'tabler-shield',
  to: 'standard-auth-module-list',
  action: 'read',
  subject: 'StandardAuthModule',
})
