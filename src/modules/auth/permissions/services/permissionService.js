/**
 * Permission Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'
import * as XLSX from 'xlsx'

const permissionCrud = createCrudService(API_BASE)

export const fetchPermissions = permissionCrud.fetchList
export const fetchPermission = permissionCrud.fetchOne
export const createPermission = permissionCrud.createOne
export const updatePermission = permissionCrud.updateOne
export const deletePermission = permissionCrud.deleteOne
export const bulkDeletePermissions = permissionCrud.bulkDelete
export const fetchPermissionStats = permissionCrud.fetchStats
export const exportPermissions = permissionCrud.exportList
export const importPermissions = permissionCrud.importFile

export const fetchPermissionTree = params => $api(`${API_BASE}/tree`, { params })

export const downloadPermissionTemplate = () => {
  const rows = [
    {
      name: 'group:users',
      guard_name: 'api',
      description: 'Nhom nguoi dung',
      sort_order: 1,
      parent_id: '',
    },
    {
      name: 'users.index',
      guard_name: 'api',
      description: 'Xem danh sach nguoi dung',
      sort_order: 2,
      parent_id: 1,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'guard_name', 'description', 'sort_order', 'parent_id'],
  })

  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Permissions')
  XLSX.writeFile(workbook, 'permissions-import-template.xlsx')
}
