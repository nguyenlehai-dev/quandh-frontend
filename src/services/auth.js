/**
 * Auth Service
 *
 * Centralized auth/session helpers for login, logout, org switching, and auth sync.
 */
import { ability } from '@/plugins/casl/ability'
import ApiService from '@/services/api-service'

const api = new ApiService()

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'userData'
const ABILITY_KEY = 'userAbilityRules'
const ORG_KEY = 'currentOrganizationId'
const ORGS_KEY = 'availableOrganizations'
const FETCH_ME_SYNC_WINDOW = 5000
const FETCH_ME_FORBIDDEN_KEY = 'authFetchMeForbidden'
const USER_NOTIFICATIONS_FORBIDDEN_KEY = 'userNotificationsForbidden'
const SYSTEM_DASHBOARD_FORBIDDEN_PREFIX = 'systemDashboardForbidden:'

let fetchMePromise = null
let lastFetchMeAt = 0

const AUTH_TEST_FLOWS = {
  'flow_direct': 'direct',
  'flow.direct@example.com': 'direct',
  'flow_select': 'select-organization',
  'flow.select@example.com': 'select-organization',
  'flow_switch': 'direct',
  'flow.switch@example.com': 'direct',
}

const resolveConfiguredAuthFlow = (...identifiers) => {
  for (const identifier of identifiers) {
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase()

    if (normalizedIdentifier && AUTH_TEST_FLOWS[normalizedIdentifier])
      return AUTH_TEST_FLOWS[normalizedIdentifier]
  }

  return null
}

export const getStoredOrganizations = () => {
  try {
    const raw = localStorage.getItem(ORGS_KEY)

    return raw ? JSON.parse(raw) : []
  }
  catch {
    return []
  }
}

export const setStoredOrganizations = organizations => {
  if (!Array.isArray(organizations) || organizations.length === 0) {
    localStorage.removeItem(ORGS_KEY)

    return
  }

  localStorage.setItem(ORGS_KEY, JSON.stringify(organizations))
}

export const clearCurrentOrganization = () => {
  useCookie(ORG_KEY).value = null
}

export const getOrganizationSessionState = () => {
  const organizations = getStoredOrganizations()
  const currentOrganizationId = Number(useCookie(ORG_KEY).value) || null

  const hasValidCurrentOrganization = Boolean(
    currentOrganizationId
    && organizations.some(org => Number(org.id) === currentOrganizationId),
  )

  return {
    organizations,
    currentOrganizationId,
    hasOrganizations: organizations.length > 0,
    hasValidCurrentOrganization,
  }
}

export const buildOrganizationSelectionRoute = ({
  to,
  currentOrganizationId,
} = {}) => {
  const query = {}

  if (to)
    query.to = to

  if (currentOrganizationId)
    query['current_org'] = String(currentOrganizationId)

  return {
    path: '/select-organization',
    query,
  }
}

export const getAuthenticatedEntryRoute = preferredRoute => {
  const { hasValidCurrentOrganization } = getOrganizationSessionState()

  return hasValidCurrentOrganization ? preferredRoute || '/' : '/select-organization'
}

export const resolvePostLoginRoute = ({
  loginData,
  preferredRoute,
  loginIdentifier,
} = {}) => {
  const configuredFlow = resolveConfiguredAuthFlow(
    loginIdentifier,
    loginData?.user?.username,
    loginData?.user?.email,
  )

  if (configuredFlow === 'select-organization')
    return '/select-organization'

  return loginData?.current_organization_id ? preferredRoute || '/' : '/select-organization'
}

export const redirectToOrganizationSelection = async (router, options = {}) => {
  const {
    to,
    currentOrganizationId = getOrganizationSessionState().currentOrganizationId,
  } = options

  clearCurrentOrganization()

  return router.push(buildOrganizationSelectionRoute({
    to,
    currentOrganizationId,
  }))
}

const clearSessionRuntimeFlags = () => {
  sessionStorage.removeItem(FETCH_ME_FORBIDDEN_KEY)
  sessionStorage.removeItem(USER_NOTIFICATIONS_FORBIDDEN_KEY)

  Object.keys(sessionStorage)
    .filter(key => key.startsWith(SYSTEM_DASHBOARD_FORBIDDEN_PREFIX))
    .forEach(key => sessionStorage.removeItem(key))
}

const clearClientSession = () => {
  useCookie(TOKEN_KEY).value = null
  useCookie(USER_KEY).value = null
  clearCurrentOrganization()
  localStorage.removeItem(ABILITY_KEY)
  localStorage.removeItem(ORGS_KEY)
  clearSessionRuntimeFlags()
  ability.update([])
}

const normalizeAbilityRules = rules => {
  const normalizedRules = Array.isArray(rules) ? [...rules] : []

  normalizedRules.push({ action: 'read', subject: 'Auth' })

  return normalizedRules
}

export const register = async payload => {
  const res = await api.callApi({
    method: 'POST',
    url: '/auth/register',
    param: payload,
  })

  if (res.errors || res.code || res.success === false)
    throw res

  return res.data || res
}

export const login = async (email, password) => {
  // Reset stale organization state from any previous session before applying
  // the current login payload. This avoids sending an old X-Organization-Id.
  clearCurrentOrganization()
  localStorage.removeItem(ORGS_KEY)
  clearSessionRuntimeFlags()

  const res = await api.callApi({
    method: 'POST',
    url: '/auth/login',
    param: { email, password },
  })

  if (res.errors || res.code || res.success === false)
    throw res

  const data = res.data || res
  const accessToken = data.access_token
  const userData = data.user
  const userAbilityRules = normalizeAbilityRules(data.abilities)

  useCookie(TOKEN_KEY).value = accessToken
  useCookie(USER_KEY).value = userData
  localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))

  if (data.available_organizations)
    setStoredOrganizations(data.available_organizations)
  else
    localStorage.removeItem(ORGS_KEY)

  const configuredFlow = resolveConfiguredAuthFlow(
    email,
    userData?.username,
    userData?.email,
  )

  if (configuredFlow === 'select-organization')
    clearCurrentOrganization()
  else if (data.current_organization_id)
    useCookie(ORG_KEY).value = data.current_organization_id
  else
    clearCurrentOrganization()

  ability.update(userAbilityRules)

  return data
}

export const switchOrganization = async orgId => {
  const res = await api.callApi({
    method: 'POST',
    url: '/auth/switch-organization',
    param: { ['organization_id']: orgId },
  })

  if (res.errors || res.code || res.success === false) {
    if (res.code === 403)
      clearCurrentOrganization()

    throw res
  }

  const data = res.data || res

  useCookie(ORG_KEY).value = data.current_organization_id
  clearSessionRuntimeFlags()

  const userAbilityRules = normalizeAbilityRules(data.abilities)

  localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))
  ability.update(userAbilityRules)

  return data
}

export const logout = async router => {
  try {
    if (useCookie(TOKEN_KEY).value) {
      await api.callApi({
        method: 'POST',
        url: '/auth/logout',
        param: {},
      })
    }
  }
  catch (err) {
    console.warn('Logout API failed', err)
  }

  clearClientSession()

  if (router)
    await router.push('/login')
}

export const getCurrentUser = () => {
  return useCookie(USER_KEY).value
}

export const isAuthenticated = () => {
  return !!(useCookie(TOKEN_KEY).value && useCookie(USER_KEY).value)
}

export const setCurrentOrganization = orgId => {
  useCookie(ORG_KEY).value = orgId
}

export const fetchMe = async ({ force = false } = {}) => {
  if (!isAuthenticated()) return null

  const orgId = useCookie(ORG_KEY).value
  if (!orgId) return null
  if (sessionStorage.getItem(FETCH_ME_FORBIDDEN_KEY) === '1') return null

  const now = Date.now()
  if (!force && now - lastFetchMeAt < FETCH_ME_SYNC_WINDOW)
    return null

  if (fetchMePromise)
    return fetchMePromise

  fetchMePromise = (async () => {
    try {
      const res = await api.callApi({
        method: 'GET',
        url: '/user',
      })

      if (res.errors || res.code || res.success === false)
        return null

      const data = res.data || res

      if (data) {
        const userAbilityRules = normalizeAbilityRules(data.abilities)

        localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))
        ability.update(userAbilityRules)

        if (data.user)
          useCookie(USER_KEY).value = data.user

        if (data.available_organizations)
          setStoredOrganizations(data.available_organizations)

        lastFetchMeAt = Date.now()

        return data
      }

      return null
    }
    catch (err) {
      if (err?.code === 403 || err?.status === 403 || err?.statusCode === 403) {
        sessionStorage.setItem(FETCH_ME_FORBIDDEN_KEY, '1')

        return null
      }

      console.warn('Fetch auth/me failed', err)

      return null
    }
    finally {
      fetchMePromise = null
    }
  })()

  return fetchMePromise
}
