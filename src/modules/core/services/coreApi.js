import { ofetch } from 'ofetch'

export const resolveCoreApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_CORE_API_BASE_URL?.trim() || 'https://quandh-core.theworkpc.com'
  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '')

  return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`
}

const createCoreHeaders = ({ headers, body, accessToken, includeOrganizationHeader = true } = {}) => {
  const resolvedAccessToken = accessToken ?? useCookie('accessToken').value
  const currentOrganizationId = useCookie('currentOrganizationId').value
  const nextHeaders = new Headers(headers ?? {})

  nextHeaders.set('Accept', 'application/json')

  if (!(body instanceof FormData))
    nextHeaders.set('Content-Type', 'application/json')

  if (resolvedAccessToken)
    nextHeaders.set('Authorization', `Bearer ${resolvedAccessToken}`)

  if (includeOrganizationHeader && currentOrganizationId)
    nextHeaders.set('X-Organization-Id', String(currentOrganizationId))

  return nextHeaders
}

export const coreApi = ofetch.create({
  baseURL: resolveCoreApiBaseUrl(),
  async onRequest({ request, options }) {
    const requestPath = typeof request === 'string' ? request : request.toString()

    options.headers = createCoreHeaders({
      body: options.body,
      headers: options.headers,
      includeOrganizationHeader: !requestPath.startsWith('/auth/'),
    })
  },
  onResponseError({ response }) {
    console.error('Core API Error:', {
      status: response.status,
      url: response.url,
      data: response._data,
    })
  },
})

const createCoreRequestUrl = (path, query) => {
  const url = new URL(path.replace(/^\//, ''), `${resolveCoreApiBaseUrl()}/`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '')
      return

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== null && item !== '')
          url.searchParams.append(`${key}[]`, String(item))
      })

      return
    }

    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

const extractFileName = (contentDisposition, fallbackFileName) => {
  const fileNameMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)
  const rawFileName = fileNameMatch?.[1] || fileNameMatch?.[2]

  return rawFileName ? decodeURIComponent(rawFileName) : fallbackFileName
}

export const downloadCoreFile = async ({ path, query, fileName = 'download.xlsx' }) => {
  const response = await fetch(createCoreRequestUrl(path, query), {
    headers: createCoreHeaders(),
  })

  if (!response.ok)
    throw await response.json().catch(() => new Error('Không thể tải tệp từ Core API.'))

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = blobUrl
  link.download = extractFileName(response.headers.get('content-disposition'), fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

export const buildCoreCollectionQuery = ({
  search,
  status,
  fromDate,
  toDate,
  sortBy,
  sortOrder,
  limit,
  page,
  ...rest
} = {}) => ({
  search,
  status,
  from_date: fromDate,
  to_date: toDate,
  sort_by: sortBy,
  sort_order: sortOrder,
  limit,
  page,
  ...rest,
})
