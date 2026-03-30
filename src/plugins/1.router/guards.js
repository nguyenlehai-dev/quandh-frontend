import { canNavigate } from '@layouts/plugins/casl'
import { fetchMe } from '@/services/auth'

export const setupGuards = router => {
  router.beforeEach(async to => {
    /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users.
     * Examples of public routes are, 404, under maintenance, etc.
     */
    if (to.meta.public)
      return

    /**
     * Check if user is logged in by checking if token & user data exists in cookies
     */
    const isLoggedIn = !!(useCookie('userData').value && useCookie('accessToken').value)
    const currentOrgId = useCookie('currentOrganizationId').value

    if (to.path === '/select-organization') {
      if (!isLoggedIn) {
        return {
          name: 'login',
          query: {
            ...to.query,
            to: undefined,
          },
        }
      }

      if (currentOrgId) {
        return '/'
      }
    }

    /*
     * If user is logged in and is trying to access login like page, redirect to home
     * else allow visiting the page
     * (WARN: Don't allow executing further by return statement because next code will check for permissions)
     */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }

    /*
     * Nếu user đã đăng nhập nhưng chưa có currentOrganizationId
     * → redirect sang trang chọn tổ chức (trừ khi đang ở trang đó rồi)
     */
    if (isLoggedIn) {
      if (!currentOrgId && to.path !== '/select-organization') {
        return '/select-organization'
      }

      if (currentOrgId) {
        await fetchMe()
      }
    }

    if (!canNavigate(to) && to.matched.length) {
      return isLoggedIn
        ? { name: 'not-authorized' }
        : {
          name: 'login',
          query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
          },
        }
    }
  })
}
