import { abilitiesPlugin } from '@casl/vue'
import { ability } from './ability'

export default function (app) {
  const userAbilityRules = useCookie('userAbilityRules')

  ability.update(userAbilityRules.value ?? [])

  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })
}
