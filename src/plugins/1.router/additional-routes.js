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
        return { name: 'dashboards-crm' }
      
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

