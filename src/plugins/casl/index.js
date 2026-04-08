import { abilitiesPlugin } from '@casl/vue'
import { getStoredAbilityRules } from '@/modules/auth/services/authStorage'
import { ability } from './ability'

export default function (app) {
  ability.update(getStoredAbilityRules())

  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })
}
