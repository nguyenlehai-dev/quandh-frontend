import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getCoreRoles = params => coreApi('/roles', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreRoleStats = params => coreApi('/roles/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreRole = roleId => coreApi(`/roles/${roleId}`)

export const createCoreRole = payload => coreApi('/roles', {
  method: 'POST',
  body: payload,
})

export const updateCoreRole = (roleId, payload) => coreApi(`/roles/${roleId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteCoreRole = roleId => coreApi(`/roles/${roleId}`, {
  method: 'DELETE',
})

export const bulkDeleteCoreRoles = ids => coreApi('/roles/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const importCoreRoles = file => {
  const formData = new FormData()

  formData.append('file', file)

  return coreApi('/roles/import', {
    method: 'POST',
    body: formData,
  })
}

export const downloadCoreRolesExport = query => downloadCoreFile({
  path: '/roles/export',
  query: buildCoreCollectionQuery(query),
  fileName: `roles-${new Date().toISOString().slice(0, 10)}.xlsx`,
})

export const downloadCoreRolesTemplate = () => downloadCoreFile({
  path: '/roles/template',
  fileName: 'roles_template.xlsx',
})

