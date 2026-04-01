import { API_BASE } from '../configs'
import { createCrudService } from '../../../auth/shared/crudServiceFactory'

const standardAuthCrud = createCrudService(API_BASE)

export const fetchStandardAuthModules = standardAuthCrud.fetchList
export const fetchStandardAuthModule = standardAuthCrud.fetchOne
export const createStandardAuthModule = standardAuthCrud.createOne
export const updateStandardAuthModule = standardAuthCrud.updateOne
export const deleteStandardAuthModule = standardAuthCrud.deleteOne
export const fetchStandardAuthModuleStats = standardAuthCrud.fetchStats
