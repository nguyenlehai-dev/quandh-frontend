import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import {
  bulkDeletePermissions as bulkDeletePermissionsRequest,
  deletePermission as deletePermissionRequest,
  fetchPermission,
  importPermissions,
} from '../services/permissionService'

const CONFIRM_DIALOG_TEXT = Object.freeze({
  defaultError: 'Khong the thuc hien thao tac nay.',
  deleteTitle: 'Xoa quyen han',
  deleteConfirmText: 'Xoa',
  bulkDeleteTitle: 'Xoa hang loat quyen han',
  bulkDeleteConfirmText: 'Xoa',
})

const SUCCESS_MESSAGES = Object.freeze({
  delete: 'Xoa quyen han thanh cong.',
  bulkDelete: 'Xoa hang loat quyen han thanh cong.',
  import: 'Import du lieu quyen han thanh cong.',
})

const ERROR_MESSAGES = Object.freeze({
  detail: 'Khong the tai chi tiet quyen han.',
  export: 'Khong the xuat du lieu quyen han.',
  import: 'Khong the import du lieu quyen han.',
})

export function usePermissionListActions(options) {
  const {
    showSuccess,
    showError,
    selectedRows,
    permissions,
    isDialogVisible,
    permissionItem,
    isDetailDialogVisible,
    detailPermissionItem,
    isConfirmDialogVisible,
    isConfirming,
    confirmDialog,
    isExporting,
    isImporting,
    refreshList,
    buildExportParams,
    getDisplayName,
  } = options

  const openCreateDialog = () => {
    permissionItem.value = null
    isDialogVisible.value = true
  }

  const openEditDialog = item => {
    permissionItem.value = { ...item }
    isDialogVisible.value = true
  }

  const openDetailDialog = async item => {
    try {
      const response = await fetchPermission(item.id)

      detailPermissionItem.value = response.data ?? response ?? { ...item }
    }
    catch (error) {
      console.error('Fetch permission detail error:', error)
      detailPermissionItem.value = { ...item }
      showError(error, ERROR_MESSAGES.detail)
    }
    finally {
      isDetailDialogVisible.value = true
    }
  }

  const onSaved = async () => {
    await refreshList()
  }

  const openConfirmDialog = dialogOptions => {
    confirmDialog.value = { ...confirmDialog.value, ...dialogOptions }
    isConfirmDialogVisible.value = true
  }

  const executeConfirmedAction = async () => {
    if (!confirmDialog.value.action)
      return

    isConfirming.value = true
    try {
      await confirmDialog.value.action()
      isConfirmDialogVisible.value = false
    }
    catch (error) {
      showError(error, CONFIRM_DIALOG_TEXT.defaultError)
    }
    finally {
      isConfirming.value = false
    }
  }

  const deletePermission = item => {
    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.deleteTitle,
      message: `Ban co chac chan muon xoa quyen "${item.name}" khong?`,
      confirmText: CONFIRM_DIALOG_TEXT.deleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await deletePermissionRequest(item.id)
        selectedRows.value = selectedRows.value.filter(id => id !== item.id)
        showSuccess(SUCCESS_MESSAGES.delete)
        await refreshList()
      },
    })
  }

  const bulkDeletePermissions = () => {
    if (!selectedRows.value.length)
      return

    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.bulkDeleteTitle,
      message: `Ban co chac chan muon xoa ${selectedRows.value.length} quyen da chon khong?`,
      confirmText: CONFIRM_DIALOG_TEXT.bulkDeleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await bulkDeletePermissionsRequest(selectedRows.value)
        selectedRows.value = []
        showSuccess(SUCCESS_MESSAGES.bulkDelete)
        await refreshList()
      },
    })
  }

  const handleExport = async () => {
    isExporting.value = true
    try {
      if (selectedRows.value.length) {
        const selectedPermissions = permissions.value.filter(item => selectedRows.value.includes(item.id))

        exportRowsToExcel({
          rows: selectedPermissions.map(item => ({
            name: getDisplayName(item),
            code: item.name || '',
            guard_name: item.guard_name || 'web',
            description: item.description || '',
            sort_order: item.sort_order ?? 0,
            parent_id: item.parent_id ?? '',
            created_at: formatAuthDateTime(item.created_at, { fallback: '' }),
          })),
          headers: ['name', 'code', 'guard_name', 'description', 'sort_order', 'parent_id', 'created_at'],
          sheetName: 'Permissions',
          fileName: `permissions_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [
            { wch: 28 },
            { wch: 32 },
            { wch: 16 },
            { wch: 36 },
            { wch: 14 },
            { wch: 14 },
            { wch: 22 },
          ],
        })

        return
      }

      const response = await $api(`/permissions/export?${buildAuthQueryString(buildExportParams())}`, {
        responseType: 'blob',
      })

      const safeBlob = response instanceof Blob ? response : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(safeBlob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `permissions_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      setTimeout(() => {
        document.body.removeChild(anchor)
        window.URL.revokeObjectURL(url)
      }, 5000)
    }
    catch (error) {
      console.error('Export permissions error:', error)
      showError(error, ERROR_MESSAGES.export)
    }
    finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    isImporting.value = true
    try {
      await importPermissions(file)
      showSuccess(SUCCESS_MESSAGES.import)
      await refreshList()
    }
    catch (error) {
      console.error('Import permissions error:', error)
      showError(error, ERROR_MESSAGES.import)
      throw error
    }
    finally {
      isImporting.value = false
    }
  }

  return {
    openCreateDialog,
    openEditDialog,
    openDetailDialog,
    onSaved,
    executeConfirmedAction,
    deletePermission,
    bulkDeletePermissions,
    handleExport,
    handleImport,
  }
}
