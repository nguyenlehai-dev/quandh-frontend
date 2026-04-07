import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getCoreUsers = params => coreApi('/users', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreUserStats = params => coreApi('/users/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreUser = userId => coreApi(`/users/${userId}`)

export const createCoreUser = payload => coreApi('/users', {
  method: 'POST',
  body: payload,
})

export const updateCoreUser = (userId, payload) => coreApi(`/users/${userId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteCoreUser = userId => coreApi(`/users/${userId}`, {
  method: 'DELETE',
})

export const bulkDeleteCoreUsers = ids => coreApi('/users/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const bulkUpdateCoreUserStatus = (ids, status) => coreApi('/users/bulk-status', {
  method: 'PATCH',
  body: { ids, status },
})

export const changeCoreUserStatus = (userId, status) => coreApi(`/users/${userId}/status`, {
  method: 'PATCH',
  body: { status },
})

export const importCoreUsers = file => {
  const formData = new FormData()

  formData.append('file', file)

  return coreApi('/users/import', {
    method: 'POST',
    body: formData,
  })
}

export const downloadCoreUsersExport = query => downloadCoreFile({
  path: '/users/export',
  query: buildCoreCollectionQuery(query),
  fileName: `users-${new Date().toISOString().slice(0, 10)}.xlsx`,
})

export const downloadCoreUsersTemplate = () => downloadCoreFile({
  path: '/users/template',
  fileName: 'users_template.xlsx',
})

