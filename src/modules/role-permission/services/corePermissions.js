import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getCorePermissions = params => coreApi('/permissions', {
  query: buildCoreCollectionQuery(params),
})

export const getCorePermissionStats = params => coreApi('/permissions/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getCorePermissionTree = parentId => coreApi('/permissions/tree', {
  query: parentId === undefined ? undefined : { parent_id: parentId },
})

export const getCorePermission = permissionId => coreApi(`/permissions/${permissionId}`)

export const createCorePermission = payload => coreApi('/permissions', {
  method: 'POST',
  body: payload,
})

export const updateCorePermission = (permissionId, payload) => coreApi(`/permissions/${permissionId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteCorePermission = permissionId => coreApi(`/permissions/${permissionId}`, {
  method: 'DELETE',
})

export const bulkDeleteCorePermissions = ids => coreApi('/permissions/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const importCorePermissions = file => {
  const formData = new FormData()

  formData.append('file', file)

  return coreApi('/permissions/import', {
    method: 'POST',
    body: formData,
  })
}

export const downloadCorePermissionsExport = query => downloadCoreFile({
  path: '/permissions/export',
  query: buildCoreCollectionQuery(query),
  fileName: `permissions-${new Date().toISOString().slice(0, 10)}.xlsx`,
})

export const downloadCorePermissionsTemplate = () => downloadCoreFile({
  path: '/permissions/template',
  fileName: 'permissions_template.xlsx',
})

