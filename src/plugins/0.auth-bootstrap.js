import { ability } from '@/plugins/casl/ability'
import { hydrateCoreAuthSession } from '@/modules/auth/services/coreAuth'

export default async function () {
  await hydrateCoreAuthSession(ability)
}
