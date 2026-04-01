// Horizontal Navigation — Auto-Discovery
//
// Menu duoc tu dong tao tu modules/*/router/navigation.js (qua _loader.js)
// Giong voi vertical navigation nhung danh cho layout horizontal
import { getModuleNavigation } from '@/modules/_loader'

export function getHorizontalNavItems() {
  return [
    ...getModuleNavigation(),
  ]
}

export default getHorizontalNavItems()
