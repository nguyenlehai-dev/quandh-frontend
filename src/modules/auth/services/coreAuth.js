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

/**
 * Generate CASL ability rules from permissions or roles.
 * Maps permission strings (e.g. "user.view") to CASL-compatible rules.
 * Falls back to "manage all" for admin roles.
 */
/**
 * Normalizes an array of raw permission strings (e.g., 'user.view') or objects 
 * into CASL-compliant {action, subject} rules.
 */
const normalizeToCaslRules = (rawList = []) => {
  const actionMap = { view: 'read', create: 'create', update: 'update', delete: 'delete', manage: 'manage', list: 'read', stats: 'read', index: 'read', show: 'read' }
  const rules = []
  const seen = new Set()

  // Map plural/inconsistent backend subjects to frontend singular subjects used in navigation
  const subjectMap = {
    // Users
    Users: 'User',
    User: 'User',

    // Organizations
    Organizations: 'Organization',
    Organization: 'Organization',

    // Roles & Permissions
    Roles: 'Role',
    Role: 'Role',
    Permissions: 'Permission',
    Permission: 'Permission',

    // Settings (Handle all variants)
    Settings: 'Setting',
    Setting: 'Setting',
    SystemSetting: 'Setting',
    SystemSettings: 'Setting',

    // Activity Logs
    LogActivities: 'LogActivity',
    LogActivity: 'LogActivity',
    ActivityLog: 'LogActivity',
    ActivityLogs: 'LogActivity',

    // Others
    Documents: 'Document',
    Document: 'Document',
    Posts: 'Post',
    Post: 'Post',
    PostCategories: 'PostCategory',
    PostCategory: 'PostCategory',
  }

  rawList.forEach(item => {
    // 1. Trích xuất Action và Subject thô (từ object hoặc string)
    let rawAction = 'read'
    let rawSubject = ''

    if (item && typeof item === 'object' && item.action && item.subject) {
      rawAction = item.action
      rawSubject = item.subject
    } else {
      let pStr = ''
      if (typeof item === 'string') {
        pStr = item
      } else if (item && typeof item === 'object') {
        pStr = item.name || item.code || item.action || ''
      }

      if (!pStr) return

      const parts = String(pStr).split('.')
      rawSubject = parts[0] ?? ''
      rawAction = parts[1] ?? 'read'
    }

    // 2. Chuẩn hóa Subject sang CamelCase (nếu là chuỗi thô từ backend kiểu 'post-categories')
    let subject = rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1).replace(/-./g, c => c[1].toUpperCase())
    
    // 3. Quy đổi Subject (số nhiều -> số ít, mapping đặc biệt)
    subject = subjectMap[subject] ?? subject

    // 4. Quy đổi Action
    const action = actionMap[rawAction] ?? rawAction

    // 5. Lưu vào danh sách (tránh trùng)
    const key = `${action}:${subject}`
    if (!seen.has(key)) {
      seen.add(key)
      rules.push({ action, subject })
    }
  })

  return rules
}

/**
 * Generate CASL ability rules from abilities, permissions, or roles.
 */
const resolveAbilities = (abilities = [], permissions = [], roles = []) => {
  // 1. Admin role: grant full access (support roles as strings or objects)
  const isAdmin = roles.some(r => {
    const roleStr = String(typeof r === 'object' ? (r?.name ?? r?.role ?? r?.code ?? '') : r).toLowerCase()
    return roleStr.includes('admin') || roleStr === 'root' || roleStr.includes('su')
  })

  if (isAdmin)
    return [{ action: 'manage', subject: 'all' }]

  // 2. Merge 'abilities' vs 'permissions' from backend
  const allRawRules = [...abilities, ...permissions]
  
  if (allRawRules.length > 0) {
    return normalizeToCaslRules(allRawRules)
  }

  // 3. Fallback for authenticated users if strictly no rule/role exists
  // IMPORTANT: We no longer grant 'manage all' here. If the user has no permissions, they should see NOTHING.
  return []
}

export const normalizeCoreAuthPayload = payload => {
  const data = getResponseData(payload)
  const availableOrganizations = data.available_organizations ?? []
  const currentOrganizationId = data.current_organization_id ?? null
  const currentOrganization = data.current_organization ?? availableOrganizations.find(item => item.id === currentOrganizationId) ?? null
  const roles = data.roles ?? []
  const permissions = data.permissions ?? []
  const abilities = data.abilities ?? []
  const user = data.user ?? {}

  // Resolve to correct format via flexible normalizer
  const resolvedAbilities = resolveAbilities(abilities, permissions, roles)

  return {
    accessToken: data.access_token ?? '',
    availableOrganizations,
    currentOrganization,
    currentOrganizationId,
    permissions,
    roles,
    userAbilityRules: resolvedAbilities,
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

  const resolvedAbilities = resolveAbilities(abilities, permissions, roles)

  return {
    accessToken: useCookie('accessToken').value ?? '',
    availableOrganizations,
    currentOrganization,
    currentOrganizationId,
    permissions,
    roles,
    userAbilityRules: resolvedAbilities,
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
