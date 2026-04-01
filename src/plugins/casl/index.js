import { abilitiesPlugin } from '@casl/vue'
import { ability } from './ability'

export default function (app) {
  let userAbilityRules = []
  try {
    const raw = localStorage.getItem('userAbilityRules')
    if (raw) userAbilityRules = JSON.parse(raw)
  }
  catch {
    userAbilityRules = []
  }

  ability.update(userAbilityRules)

  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })
}
