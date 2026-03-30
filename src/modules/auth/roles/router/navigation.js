import { createNavItem } from '../../shared/moduleFactory'
import { permissionsNavItem } from '../../permissions/router/navigation'

export const navigation = createNavItem({
  titleKey: 'navigation.navigation.system.roles_permissions',
  icon: 'tabler-shield-lock',
  action: 'read',
  subject: 'Role',
  children: [
    createNavItem({
      titleKey: 'navigation.navigation.system.roles',
      to: 'apps-roles',
      action: 'read',
      subject: 'Role',
    }),
    permissionsNavItem,
  ],
})
