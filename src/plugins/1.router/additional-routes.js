import { ability } from '@/plugins/casl/ability'

const postLoginRouteCandidates = [
  { name: 'system-dashboard' },
  { name: 'meetings-business-overview' },
  { name: 'meetings-my-calendar', action: 'read', subject: 'Meeting' },
  { name: 'system-organizations', action: 'read', subject: 'Organization' },
  { name: 'apps-user-list', action: 'read', subject: 'User' },
  { name: 'apps-roles', action: 'read', subject: 'Role' },
  { name: 'apps-permissions', action: 'read', subject: 'Permission' },
  { name: 'system-settings-general', action: 'read', subject: 'SystemSetting' },
  { name: 'user-profile', action: 'read', subject: 'Auth' },
]

const getDefaultAuthorizedRoute = () => {
  const firstAllowedRoute = postLoginRouteCandidates.find(route => {
    if (!(route.action && route.subject))
      return true

    return ability.can(route.action, route.subject)
  })

  return { name: firstAllowedRoute?.name || 'user-profile' }
}

// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // Bỏ check role vì backend không bắt buộc có userRole trong root object user
      const userData = useCookie('userData')
      
      if (userData.value)
        return getDefaultAuthorizedRoute()
      
      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]

// ℹ️ Module-specific routes are now handled by src/modules/*/routes.js
// Only shared/non-module routes should be added here
export const routes = []

