// Vertical Navigation — Auto-Discovery
//
// Menu sidebar duoc tu dong tao tu:
// 1. Module navigation: modules/*/router/navigation.js (qua _loader.js)
// 2. Non-module items: Pages, Auth, UI Elements, Forms, Charts, Others
//
// Khi them module moi, chi can tao router/navigation.js trong module
// -> sidebar tu dong cap nhat, khong can sua file nay.
import { getModuleNavigation } from '@/modules/_loader'
import { navigation as meetingsNavigation } from '@/modules/meetings/router/navigation'
import nonModuleItems from './non-module-items'

const navContainsRoute = (items, targetRoute) => {
  return (items || []).some(item => {
    if (item?.to === targetRoute)
      return true

    if (Array.isArray(item?.children))
      return navContainsRoute(item.children, targetRoute)

    return false
  })
}

export function getVerticalNavItems() {
  const moduleNavigation = getModuleNavigation()
  const hasMeetingsNavigation = navContainsRoute(moduleNavigation, 'meetings-list')

  return [
    ...moduleNavigation,
    ...(hasMeetingsNavigation ? [] : [{ heading: meetingsNavigation.title }, meetingsNavigation]),
    ...nonModuleItems,
  ]
}

export default getVerticalNavItems()
