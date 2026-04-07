import { clearStoredAuthSession, getStoredAvailableOrganizations, getStoredUserData, setStoredAuthSession } from '@/modules/auth/services/authStorage'
import { coreApi as coreAuthApi } from '@/modules/core/services/coreApi'

const getResponseData = response => response?.data ?? {}

const normalizeAuthUserData = ({
  user = {},
  roles = [],
  permissions = [],
  currentOrganization = null,
  currentOrganizationId = null,
  previousUserData = {},
} = {}) => ({
  ...previousUserData,
  assignments: user.assignments ?? previousUserData.assignments ?? [],
  avatar: user.avatar ?? previousUserData.avatar ?? '',
  createdAt: user.created_at ?? previousUserData.createdAt ?? '',
  createdBy: user.created_by ?? previousUserData.createdBy ?? 'N/A',
  currentOrganization,
  currentOrganizationId,
  email: user.email ?? previousUserData.email ?? '',
  fullName: user.name ?? user.fullName ?? user.user_name ?? user.username ?? previousUserData.fullName ?? '',
  id: user.id ?? previousUserData.id ?? null,
  name: user.name ?? user.fullName ?? user.user_name ?? user.username ?? previousUserData.name ?? '',
  permissions,
  role: roles[0] ?? previousUserData.role ?? 'user',
  roles,
  status: user.status ?? previousUserData.status ?? 'inactive',
  updatedAt: user.updated_at ?? previousUserData.updatedAt ?? '',
  updatedBy: user.updated_by ?? previousUserData.updatedBy ?? 'N/A',
  username: user.user_name ?? user.username ?? user.email ?? user.name ?? previousUserData.username ?? '',
})

export const normalizeCoreAuthPayload = payload => {
  const data = getResponseData(payload)
  const availableOrganizations = data.available_organizations ?? []
  const currentOrganizationId = data.current_organization_id ?? null
  const currentOrganization = data.current_organization ?? availableOrganizations.find(item => item.id === currentOrganizationId) ?? null
  const roles = data.roles ?? []
  const permissions = data.permissions ?? []
  const abilities = data.abilities ?? []
  const user = data.user ?? {}

  return {
    accessToken: data.access_token ?? '',
    availableOrganizations,
    currentOrganization,
    currentOrganizationId,
    permissions,
    roles,
    userAbilityRules: abilities,
    userData: normalizeAuthUserData({
      currentOrganization,
      currentOrganizationId,
      permissions,
      roles,
      user,
    }),
  }
}

export const normalizeCoreCurrentUserPayload = payload => {
  const data = getResponseData(payload)
  const storedUserData = getStoredUserData() ?? {}
  const availableOrganizations = getStoredAvailableOrganizations()
  const currentOrganizationId = useCookie('currentOrganizationId').value ?? storedUserData.currentOrganizationId ?? null
  const currentOrganization = availableOrganizations.find(item => item.id === currentOrganizationId) ?? storedUserData.currentOrganization ?? null
  const roles = data.roles ?? storedUserData.roles ?? []
  const permissions = data.permissions ?? storedUserData.permissions ?? []
  const abilities = data.abilities ?? []
  const user = data.user ?? {}

  return {
    accessToken: useCookie('accessToken').value ?? '',
    availableOrganizations,
    currentOrganization,
    currentOrganizationId,
    permissions,
    roles,
    userAbilityRules: abilities,
    userData: normalizeAuthUserData({
      currentOrganization,
      currentOrganizationId,
      permissions,
      previousUserData: storedUserData,
      roles,
      user,
    }),
  }
}

export const applyCoreAuthSession = (payload, ability) => {
  useCookie('accessToken').value = payload.accessToken
  useCookie('authProvider').value = 'core'
  useCookie('currentOrganizationId').value = payload.currentOrganizationId
  setStoredAuthSession(payload)
  ability.update(payload.userAbilityRules)
}

export const clearAuthSession = ability => {
  useCookie('accessToken').value = null
  useCookie('authProvider').value = null
  useCookie('currentOrganizationId').value = null
  clearStoredAuthSession()

  if (ability)
    ability.update([])
}

export const hydrateCoreAuthSession = async ability => {
  const authProvider = useCookie('authProvider').value
  const accessToken = useCookie('accessToken').value

  if (authProvider !== 'core' || !accessToken)
    return null

  try {
    const response = await getCurrentCoreUser()
    const payload = normalizeCoreCurrentUserPayload(response)

    setStoredAuthSession(payload)

    if (ability)
      ability.update(payload.userAbilityRules)

    return payload
  }
  catch {
    clearAuthSession(ability)

    return null
  }
}

export const loginWithCore = credentials => coreAuthApi('/auth/login', {
  method: 'POST',
  body: credentials,
})

export const forgotPasswordWithCore = email => coreAuthApi('/auth/forgot-password', {
  method: 'POST',
  body: { email },
})

export const resetPasswordWithCore = payload => coreAuthApi('/auth/reset-password', {
  method: 'POST',
  body: payload,
})

export const logoutWithCore = () => coreAuthApi('/auth/logout', {
  method: 'POST',
})

export const switchOrganizationWithCore = (organizationId, accessToken) => coreAuthApi('/auth/switch-organization', {
  method: 'POST',
  body: { organization_id: organizationId },
  headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
})

export const getCurrentCoreUser = () => coreAuthApi('/user')

export const getAvailableOrganizations = () => getStoredAvailableOrganizations()
