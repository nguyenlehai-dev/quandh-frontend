import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    const currentOrganizationId = useCookie('currentOrganizationId').value
    const headers = new Headers(options.headers ?? {})

    if (accessToken)
      headers.set('Authorization', `Bearer ${accessToken}`)

    if (currentOrganizationId)
      headers.set('X-Organization-Id', String(currentOrganizationId))

    options.headers = headers
  },
})
