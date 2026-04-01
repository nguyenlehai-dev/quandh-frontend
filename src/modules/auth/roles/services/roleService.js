/**
 * Role Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'

const roleCrud = createCrudService(API_BASE)

export const fetchRoles = roleCrud.fetchList
export const fetchRole = roleCrud.fetchOne
export const createRole = roleCrud.createOne
export const updateRole = roleCrud.updateOne
export const deleteRole = roleCrud.deleteOne
export const bulkDeleteRoles = roleCrud.bulkDelete
export const fetchRoleStats = roleCrud.fetchStats
export const exportRoles = roleCrud.exportList
export const downloadRoleTemplate = roleCrud.downloadTemplate
export const importRoles = roleCrud.importFile
