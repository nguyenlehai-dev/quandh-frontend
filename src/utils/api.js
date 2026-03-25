import { ofetch } from 'ofetch'

// Auth routes không cần Organization header
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

const isAuthRoute = url => AUTH_ROUTES.some(route => url.includes(route))

// Flag to prevent cascading 401 redirects
let isRedirecting = false

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  async onRequest({ request, options }) {
    // Bearer token
    const accessToken = useCookie('accessToken').value
    if (accessToken)
      options.headers.set('Authorization', `Bearer ${accessToken}`)

    // Multi-org header (trừ auth routes)
    const orgId = useCookie('currentOrganizationId').value
    if (orgId && !isAuthRoute(String(request)))
      options.headers.set('X-Organization-Id', String(orgId))
  },

  async onResponseError({ request, response }) {
    // Bỏ qua 401 từ auth routes (login/register)
    if (isAuthRoute(String(request)))
      return

    // 401 Unauthorized → redirect login (chỉ 1 lần, không xóa abilities)
    if (response.status === 401 && !isRedirecting) {
      isRedirecting = true

      useCookie('accessToken').value = null
      useCookie('userData').value = null
      useCookie('currentOrganizationId').value = null

      // KHÔNG xóa userAbilityRules ở đây
      // Chỉ xóa khi user chủ động logout

      // Chỉ redirect nếu chưa ở trang login
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?to=${encodeURIComponent(window.location.pathname)}`
      }
    }
  },
})
