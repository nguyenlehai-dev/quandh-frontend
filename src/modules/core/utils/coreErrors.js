export const isCoreForbiddenError = error => [error?.status, error?.statusCode, error?.response?.status].some(status => Number(status) === 403)

export const isCoreUnauthorizedError = error => [error?.status, error?.statusCode, error?.response?.status].some(status => Number(status) === 401)

export const getCoreErrorMessage = (error, fallbackMessage = 'Không thể tải dữ liệu từ Core API.') => (
  error?.data?.message
  || error?.response?._data?.message
  || error?.message
  || fallbackMessage
)
