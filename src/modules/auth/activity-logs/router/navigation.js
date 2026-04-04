import { createNavItem } from '../../shared/moduleFactory'

export const navigation = createNavItem({
  titleKey: 'navigation.navigation.system.activity_logs',
  icon: 'tabler-history',
  to: 'system-activity-logs',
  action: 'read',
  subject: 'LogActivity',
})
