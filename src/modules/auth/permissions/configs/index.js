/**
 * Permissions Module Config
 */
import { DEFAULT_PER_PAGE_OPTIONS } from '../../shared/config'

export const API_BASE = '/permissions'
export const DEFAULT_PER_PAGE = 25
export const PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS

export const PERMISSIONS = {
  VIEW: 'permission.view',
  CREATE: 'permission.create',
  EDIT: 'permission.edit',
  DELETE: 'permission.delete',
  EXPORT: 'permission.export',
  IMPORT: 'permission.import',
  BULK_DELETE: 'permission.bulkDestroy',
  STATS: 'permission.stats',
  TREE: 'permission.tree',
}
