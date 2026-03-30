/**
 * Organization Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'

const organizationCrud = createCrudService(API_BASE)

export const fetchOrganizations = organizationCrud.fetchList
export const fetchOrganization = organizationCrud.fetchOne
export const createOrganization = organizationCrud.createOne
export const updateOrganization = organizationCrud.updateOne
export const deleteOrganization = organizationCrud.deleteOne
export const bulkDeleteOrganizations = organizationCrud.bulkDelete
export const fetchOrganizationStats = organizationCrud.fetchStats
export const exportOrganizations = organizationCrud.exportList
export const downloadOrganizationTemplate = organizationCrud.downloadTemplate
export const importOrganizations = organizationCrud.importFile

export const changeOrganizationStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const fetchOrganizationTree = params => $api(`${API_BASE}/tree`, { params })
export const bulkUpdateOrganizationStatus = (ids, status) => $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
