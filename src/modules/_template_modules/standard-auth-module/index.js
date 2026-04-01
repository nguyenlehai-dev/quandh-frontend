import { routes } from './router/routes'
import { navigation } from './router/navigation'
import { createModuleManifest } from '../../auth/shared/moduleFactory'

export default createModuleManifest({
  routes,
  navigation,
  navOrder: 120,
})
