import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getCoreOrganizations = params => coreApi('/organizations', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreOrganizationStats = params => coreApi('/organizations/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreOrganizationTree = status => coreApi('/organizations/tree', {
  query: status ? { status } : undefined,
})

export const getPublicCoreOrganizations = params => coreApi('/organizations/public', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreOrganizationOptions = params => coreApi('/organizations/public-options', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreOrganization = organizationId => coreApi(`/organizations/${organizationId}`)

export const createCoreOrganization = payload => coreApi('/organizations', {
  method: 'POST',
  body: payload,
})

export const updateCoreOrganization = (organizationId, payload) => coreApi(`/organizations/${organizationId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteCoreOrganization = organizationId => coreApi(`/organizations/${organizationId}`, {
  method: 'DELETE',
})

export const bulkDeleteCoreOrganizations = ids => coreApi('/organizations/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const bulkUpdateCoreOrganizationStatus = (ids, status) => coreApi('/organizations/bulk-status', {
  method: 'PATCH',
  body: { ids, status },
})

export const changeCoreOrganizationStatus = (organizationId, status) => coreApi(`/organizations/${organizationId}/status`, {
  method: 'PATCH',
  body: { status },
})

export const importCoreOrganizations = file => {
  const formData = new FormData()

  formData.append('file', file)

  return coreApi('/organizations/import', {
    method: 'POST',
    body: formData,
  })
}

export const downloadCoreOrganizationsExport = query => downloadCoreFile({
  path: '/organizations/export',
  query: buildCoreCollectionQuery(query),
  fileName: `organizations-${new Date().toISOString().slice(0, 10)}.xlsx`,
})

export const downloadCoreOrganizationsTemplate = () => {
  const link = document.createElement('a')

  link.href = `${window.location.origin}/templates/organizations_template.xlsx`
  link.setAttribute('download', 'organizations_template.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
