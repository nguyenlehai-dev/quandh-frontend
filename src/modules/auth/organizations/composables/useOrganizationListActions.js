import { ability } from '@/plugins/casl/ability'
import { formatAuthDateTime } from '../../shared/dateTime'
import { exportRowsToExcel } from '../../shared/excelExport'
import { buildAuthQueryString } from '../../shared/queryParams'
import {
  bulkDeleteOrganizations,
  bulkUpdateOrganizationStatus,
  changeOrganizationStatus as changeOrganizationStatusRequest,
  deleteOrganization as deleteOrganizationRequest,
  importOrganizations,
} from '../services/organizationService'

const CONFIRM_DIALOG_TEXT = Object.freeze({
  defaultError: 'Khong the thuc hien thao tac nay.',
  deleteTitle: 'Xoa to chuc',
  deleteMessage: 'Ban co chac chan muon xoa to chuc nay khong?',
  deleteConfirmText: 'Xoa',
  bulkDeleteTitle: 'Xoa hang loat to chuc',
  bulkDeleteConfirmText: 'Xoa',
  bulkStatusTitle: 'Doi trang thai hang loat',
  bulkStatusConfirmText: 'Doi trang thai',
  changeStatusTitle: 'Doi trang thai to chuc',
  changeStatusConfirmText: 'Doi trang thai',
})

const SUCCESS_MESSAGES = Object.freeze({
  delete: 'Xoa to chuc thanh cong.',
  bulkDelete: 'Xoa hang loat to chuc thanh cong.',
  bulkStatus: 'Cap nhat trang thai hang loat thanh cong.',
  changeStatus: 'Cap nhat trang thai to chuc thanh cong.',
  import: 'Import du lieu to chuc thanh cong.',
})

const ERROR_MESSAGES = Object.freeze({
  noValidBulkStatusTarget: 'Khong co to chuc hop le de cap nhat trang thai. To chuc con dang phu thuoc cha ngung hoat dong se khong doi rieng le.',
  inactiveParentStatusChange: 'To chuc con dang phu thuoc to chuc cha ngung hoat dong, khong the doi trang thai rieng le.',
  currentOrganizationInactive: 'Khong the chuyen to chuc dang lam viec hien tai sang ngung hoat dong.',
  export: 'Khong the xuat du lieu to chuc.',
  import: 'Khong the import du lieu to chuc.',
})

export function useOrganizationListActions(options) {
  const {
    showSnackbar,
    showSuccess,
    showError,
    selectedRows,
    selectionSeeds,
    selectedOrganizations,
    statusOptions,
    isDialogVisible,
    editingOrganization,
    isReadonlyDrawer,
    isConfirmDialogVisible,
    isConfirming,
    isExporting,
    isImporting,
    statusUpdatingIds,
    confirmDialog,
    isCurrentOrganization,
    hasInactiveParent,
    refreshList,
    buildExportParams,
  } = options

  const openAddDialog = () => {
    if (!ability.can('create', 'Organization')) return
    editingOrganization.value = null
    isReadonlyDrawer.value = false
    isDialogVisible.value = true
  }

  const openEditDialog = item => {
    if (!ability.can('update', 'Organization')) return
    editingOrganization.value = { ...item }
    isReadonlyDrawer.value = false
    isDialogVisible.value = true
  }

  const openDetailDialog = item => {
    if (!ability.can('read', 'Organization')) return
    editingOrganization.value = { ...item }
    isReadonlyDrawer.value = true
    isDialogVisible.value = true
  }

  const openConfirmDialog = options => {
    confirmDialog.value = { ...confirmDialog.value, ...options }
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
      showError(error, CONFIRM_DIALOG_TEXT.defaultError)
    }
    finally {
      isConfirming.value = false
    }
  }

  const deleteOrganization = id => {
    if (!ability.can('delete', 'Organization')) return

    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.deleteTitle,
      message: CONFIRM_DIALOG_TEXT.deleteMessage,
      confirmText: CONFIRM_DIALOG_TEXT.deleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await deleteOrganizationRequest(id)

        const index = selectedRows.value.indexOf(id)
        if (index !== -1)
          selectedRows.value.splice(index, 1)

        selectionSeeds.value = selectionSeeds.value.filter(seedId => Number(seedId) !== Number(id))

        showSuccess(SUCCESS_MESSAGES.delete)
        refreshList()
      },
    })
  }

  const bulkDeleteOrgs = () => {
    if (!ability.can('delete', 'Organization')) return
    if (!selectedRows.value.length) return

    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.bulkDeleteTitle,
      message: `Ban co chac chan muon xoa ${selectedRows.value.length} to chuc da chon khong?`,
      confirmText: CONFIRM_DIALOG_TEXT.bulkDeleteConfirmText,
      confirmColor: 'error',
      action: async () => {
        await bulkDeleteOrganizations(selectedRows.value)
        selectionSeeds.value = []
        selectedRows.value = []
        showSuccess(SUCCESS_MESSAGES.bulkDelete)
        refreshList()
      },
    })
  }

  const bulkChangeStatus = newStatus => {
    if (!ability.can('update', 'Organization')) return
    if (!selectedRows.value.length) return

    let targetIds = [...selectedRows.value]
    const skippedCurrentOrganization = newStatus === 'inactive' && targetIds.some(isCurrentOrganization)

    const skippedInactiveParentIds = targetIds.filter(id => {
      const organization = selectedOrganizations.value.find(item => item.id === id)

      return hasInactiveParent(organization)
    })

    if (skippedCurrentOrganization)
      targetIds = targetIds.filter(id => !isCurrentOrganization(id))

    if (skippedInactiveParentIds.length)
      targetIds = targetIds.filter(id => !skippedInactiveParentIds.includes(id))

    targetIds = targetIds.filter(id => {
      const organization = selectedOrganizations.value.find(item => item.id === id)

      return organization && organization.status !== newStatus
    })

    if (!targetIds.length) {
      showSnackbar(ERROR_MESSAGES.noValidBulkStatusTarget, 'warning')

      return
    }

    const nextLabel = statusOptions.value.find(status => status.value === newStatus)?.title || newStatus

    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.bulkStatusTitle,
      message: skippedCurrentOrganization
        ? `Ban co chac chan muon chuyen ${targetIds.length} to chuc da chon sang "${nextLabel}" khong? To chuc dang lam viec hien tai se duoc giu nguyen.`
        : `Ban co chac chan muon chuyen ${targetIds.length} to chuc da chon sang "${nextLabel}" khong?`,
      confirmText: CONFIRM_DIALOG_TEXT.bulkStatusConfirmText,
      confirmColor: 'warning',
      action: async () => {
        await bulkUpdateOrganizationStatus(targetIds, newStatus)
        selectionSeeds.value = []
        selectedRows.value = []
        showSuccess(SUCCESS_MESSAGES.bulkStatus)
        refreshList()
      },
    })
  }

  const changeOrganizationStatus = (item, newStatus) => {
    if (hasInactiveParent(item)) {
      showSnackbar(ERROR_MESSAGES.inactiveParentStatusChange, 'warning')

      return
    }

    if (newStatus === 'inactive' && isCurrentOrganization(item.id)) {
      showSnackbar(ERROR_MESSAGES.currentOrganizationInactive, 'warning')

      return
    }

    const nextLabel = statusOptions.value.find(status => status.value === newStatus)?.title || newStatus

    openConfirmDialog({
      title: CONFIRM_DIALOG_TEXT.changeStatusTitle,
      message: `Ban co chac chan muon chuyen "${item.name}" sang "${nextLabel}" khong?`,
      confirmText: CONFIRM_DIALOG_TEXT.changeStatusConfirmText,
      confirmColor: 'warning',
      action: async () => {
        statusUpdatingIds.value.push(Number(item.id))

        try {
          await changeOrganizationStatusRequest(item.id, newStatus)
          showSuccess(SUCCESS_MESSAGES.changeStatus)
          refreshList()
        }
        finally {
          statusUpdatingIds.value = statusUpdatingIds.value.filter(id => id !== Number(item.id))
        }
      },
    })
  }

  const handleExport = async () => {
    if (!ability.can('export', 'Organization')) return

    isExporting.value = true
    try {
      if (selectedOrganizations.value.length) {
        exportRowsToExcel({
          rows: selectedOrganizations.value.map(item => ({
            name: item.name || '',
            slug: item.slug || '',
            parent_name: item.parent?.name || '',
            status: item.status || '',
            sort_order: item.sort_order ?? '',
            updated_at: formatAuthDateTime(item.updated_at || item.created_at, { fallback: '' }),
          })),
          headers: ['name', 'slug', 'parent_name', 'status', 'sort_order', 'updated_at'],
          sheetName: 'Organizations',
          fileName: `organizations_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [
            { wch: 28 },
            { wch: 24 },
            { wch: 28 },
            { wch: 14 },
            { wch: 14 },
            { wch: 22 },
          ],
        })

        return
      }

      const blob = await $api(`/organizations/export?${buildAuthQueryString(buildExportParams())}`, {
        responseType: 'blob',
      })

      const safeBlob = blob instanceof Blob
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      const url = window.URL.createObjectURL(safeBlob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `organizations_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()

      setTimeout(() => {
        document.body.removeChild(anchor)
        window.URL.revokeObjectURL(url)
      }, 5000)
    }
    catch (error) {
      showError(error, ERROR_MESSAGES.export)
      console.error('Export organizations error:', error)
    }
    finally {
      isExporting.value = false
    }
  }

  const handleImport = async file => {
    if (!ability.can('import', 'Organization')) return

    isImporting.value = true
    try {
      await importOrganizations(file)
      showSuccess(SUCCESS_MESSAGES.import)
      refreshList()
    }
    catch (error) {
      showError(error, ERROR_MESSAGES.import)
      console.error('Import organizations error:', error)
    }
    finally {
      isImporting.value = false
    }
  }

  const onSaved = payload => {
    if (payload?.message)
      showSuccess(payload.message)

    refreshList()
  }

  return {
    openAddDialog,
    openEditDialog,
    openDetailDialog,
    executeConfirmedAction,
    deleteOrganization,
    onSaved,
    bulkDeleteOrgs,
    bulkChangeStatus,
    changeOrganizationStatus,
    handleImport,
    handleExport,
  }
}
