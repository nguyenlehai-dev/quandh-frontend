import { routes } from './router/routes'
import { navigation } from './router/navigation'
import { createMeetingsManifest } from './shared/moduleFactory'

export default createMeetingsManifest({
  routes,
  navigation,
  navOrder: 10,
})
