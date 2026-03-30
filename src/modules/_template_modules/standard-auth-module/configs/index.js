import { DEFAULT_PER_PAGE_OPTIONS } from '../../../auth/shared/config'

export const API_BASE = '/standard-auth-module'
export const DEFAULT_PER_PAGE = 10
export const PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS
export const DEFAULT_COLUMNS = ['name', 'status']

export const PERMISSIONS = {
  VIEW: 'standard-auth-module.view',
  CREATE: 'standard-auth-module.create',
  EDIT: 'standard-auth-module.edit',
  DELETE: 'standard-auth-module.delete',
}
