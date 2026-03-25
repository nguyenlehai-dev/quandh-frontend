// Vertical Navigation — Auto-Discovery
//
// Menu sidebar duoc tu dong tao tu:
// 1. Module navigation: modules/*/router/navigation.js (qua _loader.js)
// 2. Non-module items: Pages, Auth, UI Elements, Forms, Charts, Others
//
// Khi them module moi, chi can tao router/navigation.js trong module
// -> sidebar tu dong cap nhat, khong can sua file nay.
import { getModuleNavigation } from '@/modules/_loader'
import nonModuleItems from './non-module-items'

export default [
  ...getModuleNavigation(),
  ...nonModuleItems,
]
