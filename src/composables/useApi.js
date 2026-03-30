import { createFetch } from '@vueuse/core'
import { destr } from 'destr'

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ url, options }) {
      const accessToken = useCookie('accessToken').value
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
      
      const orgId = useCookie('currentOrganizationId').value
      if (orgId && !url.includes('/auth/')) {
        options.headers = {
          ...options.headers,
          'X-Organization-Id': String(orgId),
        }
      }
      
      return { options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error(error)
      }
      
      return { data: parsedData, response }
    },
    onFetchError(ctx) {
      const { response } = ctx

      if (response && response.status === 401) {
        // Token expired or invalid, clear auth and redirect
        useCookie('accessToken').value = null
        useCookie('userData').value = null
        localStorage.removeItem('userAbilityRules')
        useCookie('currentOrganizationId').value = null
        localStorage.removeItem('availableOrganizations')
        
        // Prevent infinite reload loop if already on login
        if (window.location.pathname !== '/login') {
          localStorage.setItem('history_link', window.location.pathname)
          window.location.href = '/login'
        }
      }

      return ctx
    },
  },
})
