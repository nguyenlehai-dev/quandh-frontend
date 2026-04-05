import { useRouter } from 'vue-router'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import {
  bulkDeleteUsers as bulkDeleteUsersRequest,
  bulkUpdateUserStatus,
  changeUserStatus as changeUserStatusRequest,
  deleteUser as deleteUserRequest,
  importUsers,
} from '../services/userService'

export function useUserListActions(options) {
  const router = useRouter()
  const { t } = useI18n()

  const {
    showSuccess,
    showError,
    selectedRows,
    selectedUsers,
    statusActionOptions,
    getRoleName,
    getOrgName,
    normalizeUserStatus,
    resolveStatusText,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    confirmDialog,
    refreshList,
    buildExportParams,
  } = options

  const confirmDialogText = {
    defaultError: t('user.user.list.messages.default_error'),
    deleteTitle: t('user.user.list.messages.delete_title'),
    deleteMessage: t('user.user.list.messages.delete_message'),
    deleteConfirmText: t('common.common.actions.delete'),
    bulkDeleteTitle: t('user.user.list.messages.bulk_delete_title'),
    bulkDeleteConfirmText: t('common.common.actions.delete'),
    bulkStatusTitle: t('user.user.list.messages.bulk_status_title'),
    bulkStatusConfirmText: t('user.user.list.change_status'),
    changeStatusTitle: t('user.user.list.messages.change_status_title'),
    changeStatusConfirmText: t('user.user.list.change_status'),
  }

  const successMessages = {
    delete: t('user.user.list.messages.success_delete'),
    bulkDelete: t('user.user.list.messages.success_bulk_delete'),
    bulkStatus: t('user.user.list.messages.success_bulk_status'),
    changeStatus: t('user.user.list.messages.success_change_status'),
    import: t('user.user.list.messages.success_import'),
  }

  const errorMessages = {
    export: t('user.user.list.messages.error_export'),
    import: t('user.user.list.messages.error_import'),
  }

  const openCreateUserPage = () => {
    router.push({ name: 'apps-user-create' })
  }

  const openEditUserPage = id => {
    router.push({ name: 'apps-user-edit-id', params: { id } })
  }

  const openDetailUserPage = id => {
    router.push({ name: 'apps-user-view-id', params: { id } })
  }

  const openConfirmDialog = dialogOptions => {
    confirmDialog.value = { ...confirmDialog.value, ...dialogOptions }
    isConfirmDialogVisible.value = true
  }

  const executeConfirmedAction = async () => {
    if (!confirmDialog.value.action) return

    isConfirming.value = true
    try {
      await confirmDialog.value.action()
      isConfirmDialogVisible.value = false
    }
    catch (error) {
      showError(error, confirmDialogText.defaultError)
    }
    finally {
      isConfirming.value = false
    }
  }

  const deleteUser = id => {
    openConfirmDialog({
      title: confirmDialogText.deleteTitle,
      message: confirmDialogText.deleteMessage,
      confirmText: confirmDialogText.deleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await deleteUserRequest(id)
        selectedRows.value = selectedRows.value.filter(rowId => Number(rowId) !== Number(id))
        showSuccess(successMessages.delete)
        refreshList()
      },
    })
  }

  const bulkDeleteUsers = () => {
    if (!selectedRows.value.length) return

    openConfirmDialog({
      title: confirmDialogText.bulkDeleteTitle,
      message: t('user.user.list.messages.bulk_delete_message', { count: selectedRows.value.length }),
      confirmText: confirmDialogText.bulkDeleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await bulkDeleteUsersRequest(selectedRows.value)
        selectedRows.value = []
        showSuccess(successMessages.bulkDelete)
        refreshList()
      },
    })
  }

  const bulkChangeStatus = newStatus => {
    if (!selectedRows.value.length) return

    const nextLabel = statusActionOptions.value.find(item => item.value === newStatus)?.title || newStatus

    openConfirmDialog({
      title: confirmDialogText.bulkStatusTitle,
      message: t('user.user.list.messages.bulk_status_message', { count: selectedRows.value.length, status: nextLabel }),
      confirmText: confirmDialogText.bulkStatusConfirmText,
      confirmColor: 'warning',
      action: async () => {
        await bulkUpdateUserStatus(selectedRows.value, newStatus)
        selectedRows.value = []
        showSuccess(successMessages.bulkStatus)
        refreshList()
      },
    })
  }

  const changeUserStatus = (item, newStatus) => {
    const nextLabel = resolveStatusText(newStatus)

    openConfirmDialog({
      title: confirmDialogText.changeStatusTitle,
      message: t('user.user.list.messages.change_status_message', { name: item.name, status: nextLabel }),
      confirmText: confirmDialogText.changeStatusConfirmText,
      confirmColor: 'warning',
      action: async () => {
        await changeUserStatusRequest(item.id, newStatus)
        showSuccess(successMessages.changeStatus)
        refreshList()
      },
    })
  }

  const handleExport = async () => {
    isExporting.value = true
    try {
      if (selectedUsers.value.length) {
        exportRowsToExcel({
          rows: selectedUsers.value.map(item => ({
            name: item.name || '',
            email: item.email || '',
            user_name: item.user_name || '',
            status: normalizeUserStatus(item.status),
            roles: (item.assignments || [])
              .map(assign => `${getRoleName(assign.role_id)} (${(assign.organization_ids || []).map(getOrgName).join(', ')})`)
              .join(' | '),
            updated_at: formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
          })),
          headers: ['name', 'email', 'user_name', 'status', 'roles', 'updated_at'],
          sheetName: 'Users',
          fileName: `users_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [
            { wch: 28 },
            { wch: 32 },
            { wch: 22 },
            { wch: 14 },
            { wch: 48 },
            { wch: 22 },
          ],
        })

        return
      }

      const blob = await $api(`/users/export?${buildAuthQueryString(buildExportParams())}`, {
        responseType: 'blob',
      })

      const safeBlob = blob instanceof Blob
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      const url = window.URL.createObjectURL(safeBlob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()

      setTimeout(() => {
        document.body.removeChild(anchor)
        window.URL.revokeObjectURL(url)
      }, 5000)
    }
    catch (error) {
      showError(error, errorMessages.export)
      console.error('Export users error:', error)
    }
    finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    isImporting.value = true
    try {
      await importUsers(file)
      showSuccess(successMessages.import)
      refreshList()
    }
    catch (error) {
      showError(error, errorMessages.import)
      console.error('Import users error:', error)
    }
    finally {
      isImporting.value = false
    }
  }

  return {
    openCreateUserPage,
    openEditUserPage,
    openDetailUserPage,
    executeConfirmedAction,
    deleteUser,
    bulkDeleteUsers,
    bulkChangeStatus,
    changeUserStatus,
    handleExport,
    handleImport,
  }
}
