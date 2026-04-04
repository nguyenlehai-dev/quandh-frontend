/**
 * User Service
 */
/* eslint-disable camelcase */

import { API_BASE } from '../configs'
import { createCrudService } from '../../shared/crudServiceFactory'
import * as XLSX from 'xlsx'

const userCrud = createCrudService(API_BASE)

export const fetchUsers = userCrud.fetchList
export const fetchUser = userCrud.fetchOne
export const createUser = userCrud.createOne
export const updateUser = userCrud.updateOne
export const deleteUser = userCrud.deleteOne
export const bulkDeleteUsers = userCrud.bulkDelete
export const fetchUserStats = userCrud.fetchStats
export const exportUsers = userCrud.exportList
export const importUsers = userCrud.importFile

export const downloadUserImportTemplate = () => {
  const rows = [
    {
      name: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      user_name: 'nguyenvana',
      password: 'Password@123',
      status: 'active',
    },
    {
      name: 'Tran Thi B',
      email: 'tranthib@example.com',
      user_name: 'tranthib',
      password: 'Password@123',
      status: 'inactive',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['name', 'email', 'user_name', 'password', 'status'],
  })

  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 32 },
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')

  XLSX.writeFile(workbook, 'users-import-template.xlsx')
}

export const changeUserStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const bulkUpdateUserStatus = (ids, status) => $api(`${API_BASE}/bulk-status`, { method: 'PATCH', body: { ids, status } })
