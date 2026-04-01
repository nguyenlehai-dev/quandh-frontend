import { createMongoAbility } from '@casl/ability'

// Initialize with stored rules so abilities are available
// before router guards run (router plugin loads before casl plugin)
let initialRules = []
try {
  const raw = localStorage.getItem('userAbilityRules')
  if (raw) initialRules = JSON.parse(raw)
}
catch {
  initialRules = []
}

export const ability = createMongoAbility(initialRules)
