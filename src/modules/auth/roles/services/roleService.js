/**
 * Role Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'
import * as XLSX from 'xlsx'

const roleCrud = createCrudService(API_BASE)

export const fetchRoles = roleCrud.fetchList
export const fetchRole = roleCrud.fetchOne
export const createRole = roleCrud.createOne
export const updateRole = roleCrud.updateOne
export const deleteRole = roleCrud.deleteOne
export const bulkDeleteRoles = roleCrud.bulkDelete
export const fetchRoleStats = roleCrud.fetchStats
export const exportRoles = roleCrud.exportList
export const importRoles = roleCrud.importFile

export const downloadRoleTemplate = () => {
  const rows = [
    {
      name: 'admin',
      'guard_name': 'web',
      'organization_id': '',
    },
    {
      name: 'editor',
      'guard_name': 'web',
      'organization_id': '',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'guard_name', 'organization_id'],
  })

  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Roles')
  XLSX.writeFile(workbook, 'roles-import-template.xlsx')
}
