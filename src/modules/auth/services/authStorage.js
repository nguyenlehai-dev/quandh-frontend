const STORAGE_KEYS = {
  availableOrganizations: 'auth.availableOrganizations',
  userAbilityRules: 'auth.userAbilityRules',
  userData: 'auth.userData',
}

const isClient = () => typeof window !== 'undefined'

const readJson = key => {
  if (!isClient())
    return null

  try {
    const value = window.localStorage.getItem(key)

    return value ? JSON.parse(value) : null
  }
  catch {
    return null
  }
}

const writeJson = (key, value) => {
  if (!isClient())
    return

  if (value === null || value === undefined) {
    window.localStorage.removeItem(key)

    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export const getStoredUserData = () => readJson(STORAGE_KEYS.userData)

export const getStoredUserId = () => getStoredUserData()?.id ?? null

export const getStoredAbilityRules = () => readJson(STORAGE_KEYS.userAbilityRules) ?? []

export const getStoredAvailableOrganizations = () => readJson(STORAGE_KEYS.availableOrganizations) ?? []

export const setStoredAuthSession = payload => {
  writeJson(STORAGE_KEYS.availableOrganizations, payload.availableOrganizations ?? [])
  writeJson(STORAGE_KEYS.userAbilityRules, payload.userAbilityRules ?? [])
  writeJson(STORAGE_KEYS.userData, payload.userData ?? null)
}

export const clearStoredAuthSession = () => {
  writeJson(STORAGE_KEYS.availableOrganizations, null)
  writeJson(STORAGE_KEYS.userAbilityRules, null)
  writeJson(STORAGE_KEYS.userData, null)
}

export const isStoredLoggedIn = () => {
  const accessToken = useCookie('accessToken').value

  return !!(accessToken && getStoredUserData())
}
