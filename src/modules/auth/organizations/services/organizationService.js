/**
 * Organization Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'
import * as XLSX from 'xlsx'

const organizationCrud = createCrudService(API_BASE)

export const fetchOrganizations = organizationCrud.fetchList
export const fetchPublicOrganizations = params => $api(`${API_BASE}/public`, { params })
export const fetchPublicOrganizationOptions = params => $api(`${API_BASE}/public-options`, { params })
export const fetchOrganization = organizationCrud.fetchOne
export const createOrganization = organizationCrud.createOne
export const updateOrganization = organizationCrud.updateOne
export const deleteOrganization = organizationCrud.deleteOne
export const bulkDeleteOrganizations = organizationCrud.bulkDelete
export const fetchOrganizationStats = organizationCrud.fetchStats
export const exportOrganizations = organizationCrud.exportList
export const importOrganizations = organizationCrud.importFile
export const downloadOrganizationImportTemplate = () => {
  const rows = [
    {
      name: 'Microsoft',
      slug: 'microsoft',
      description: 'To chuc cap goc',
      status: 'active',
      parent_id: '',
      sort_order: 1,
    },
    {
      name: 'Microsoft Surface',
      slug: 'microsoft-surface',
      description: 'Don vi truc thuoc Microsoft',
      status: 'active',
      parent_id: 1,
      sort_order: 1,
    },
  ]
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'slug', 'description', 'status', 'parent_id', 'sort_order'],
  })
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 24 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations')
  XLSX.writeFile(workbook, 'organizations-import-template.xlsx')
}

export const changeOrganizationStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const fetchOrganizationTree = params => $api(`${API_BASE}/tree`, { params })
export const bulkUpdateOrganizationStatus = (ids, status) => $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
