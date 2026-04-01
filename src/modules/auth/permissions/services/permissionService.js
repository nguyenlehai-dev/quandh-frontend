/**
 * Permission Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'

const permissionCrud = createCrudService(API_BASE)

export const fetchPermissions = permissionCrud.fetchList
export const fetchPermission = permissionCrud.fetchOne
export const createPermission = permissionCrud.createOne
export const updatePermission = permissionCrud.updateOne
export const deletePermission = permissionCrud.deleteOne
export const bulkDeletePermissions = permissionCrud.bulkDelete
export const fetchPermissionStats = permissionCrud.fetchStats
export const exportPermissions = permissionCrud.exportList
export const downloadPermissionTemplate = permissionCrud.downloadTemplate
export const importPermissions = permissionCrud.importFile

export const fetchPermissionTree = params => $api(`${API_BASE}/tree`, { params })
