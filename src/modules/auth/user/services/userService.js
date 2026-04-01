/**
 * User Service
 */
import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'

const userCrud = createCrudService(API_BASE)

export const fetchUsers = userCrud.fetchList
export const fetchUser = userCrud.fetchOne
export const createUser = userCrud.createOne
export const updateUser = userCrud.updateOne
export const deleteUser = userCrud.deleteOne
export const bulkDeleteUsers = userCrud.bulkDelete
export const fetchUserStats = userCrud.fetchStats
export const exportUsers = userCrud.exportList
export const downloadUserTemplate = userCrud.downloadTemplate
export const importUsers = userCrud.importFile

export const changeUserStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const bulkUpdateUserStatus = (ids, status) => $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
