import { createNavGroup, createNavItem } from '../../shared/moduleFactory'
import { permissionsNavItem } from '../../permissions/router/navigation'

export const navigation = createNavGroup({
  titleKey: 'navigation.navigation.system.roles_permissions',
  icon: 'tabler-shield-lock',
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
