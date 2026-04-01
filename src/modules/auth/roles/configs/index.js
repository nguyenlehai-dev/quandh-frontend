/**
 * Roles Module Config
 */
import { DEFAULT_PER_PAGE_OPTIONS } from '../../shared/config'

export const API_BASE = '/roles'
export const DEFAULT_PER_PAGE = 25
export const PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS

export const PERMISSIONS = {
  VIEW: 'role.view',
  CREATE: 'role.create',
  EDIT: 'role.edit',
  DELETE: 'role.delete',
  EXPORT: 'role.export',
  IMPORT: 'role.import',
  BULK_DELETE: 'role.bulkDestroy',
  STATS: 'role.stats',
}
