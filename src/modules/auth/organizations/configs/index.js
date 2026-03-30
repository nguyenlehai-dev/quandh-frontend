/**
 * Organizations Module Config
 */
import { DEFAULT_PER_PAGE_OPTIONS } from '../../shared/config'

export const API_BASE = '/organizations'
export const DEFAULT_PER_PAGE = 10
export const PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS
export const DEFAULT_COLUMNS = ['name', 'code', 'phone', 'status']

export const PERMISSIONS = {
  VIEW: 'organization.view',
  CREATE: 'organization.create',
  EDIT: 'organization.edit',
  DELETE: 'organization.delete',
  EXPORT: 'organization.export',
  IMPORT: 'organization.import',
  BULK_DELETE: 'organization.bulkDestroy',
  BULK_STATUS: 'organization.bulkUpdateStatus',
  STATS: 'organization.stats',
  TREE: 'organization.tree',
  CHANGE_STATUS: 'organization.changeStatus',
}
