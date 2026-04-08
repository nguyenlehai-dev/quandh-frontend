import { createFetch } from '@vueuse/core'
import { destr } from 'destr'
import { resolveCoreApiBaseUrl } from '@/modules/core/services/coreApi'

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || resolveCoreApiBaseUrl(),
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value
      const currentOrganizationId = useCookie('currentOrganizationId').value
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }

      if (currentOrganizationId) {
        options.headers = {
          ...options.headers,
          'X-Organization-Id': String(currentOrganizationId),
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
  },
})
