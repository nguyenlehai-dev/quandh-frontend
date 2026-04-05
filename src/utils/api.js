import { ofetch } from 'ofetch'

const isAuthRoute = url => url.includes('/auth/')

let isRedirecting = false

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  async onRequest({ request, options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken)
      options.headers.set('Authorization', `Bearer ${accessToken}`)

    const orgId = useCookie('currentOrganizationId').value
    if (orgId && !isAuthRoute(String(request)))
      options.headers.set('X-Organization-Id', String(orgId))
  },

  async onResponseError({ request, response }) {
    if (isAuthRoute(String(request)))
      return

    if (response.status === 401 && !isRedirecting) {
      isRedirecting = true

      useCookie('accessToken').value = null
      useCookie('userData').value = null
      useCookie('currentOrganizationId').value = null
      localStorage.removeItem('userAbilityRules')
      localStorage.removeItem('availableOrganizations')

      if (window.location.pathname !== '/login') {
        window.location.href = `/login?to=${encodeURIComponent(window.location.pathname)}`
      }
    }
  },
})
