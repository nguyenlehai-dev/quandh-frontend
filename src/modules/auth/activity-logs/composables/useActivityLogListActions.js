import { exportRowsToExcel } from '../../shared/excelExport'
import { formatAuthDateTime } from '../../shared/dateTime'
import {
  bulkDeleteActivityLogs,
  clearAllActivityLogs,
  deleteActivityLog,
  deleteActivityLogsByDate,
  exportActivityLogs,
  fetchActivityLog,
} from '../services/activityLogService'

export function useActivityLogListActions({
  showSuccess,
  showError,
  logs,
  selectedRows,
  detailLoading,
  selectedLogDetail,
  isDetailDialogVisible,
  isConfirmDialogVisible,
  isConfirming,
  isDeleteByDateDialogVisible,
  isDeleteByDateSubmitting,
  deleteByDateForm,
  isExporting,
  confirmDialog,
  refreshList,
  buildExportParams,
}) {
  const { t } = useI18n()
  const openConfirmDialog = options => {
    confirmDialog.value = { ...confirmDialog.value, ...options }
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
      showError(error, t('auth.auth.activity_logs.messages.action_error'))
    }
    finally {
      isConfirming.value = false
    }
  }

  const openDetailDialog = async item => {
    detailLoading.value = true
    isDetailDialogVisible.value = true
    selectedLogDetail.value = null

    try {
      const response = await fetchActivityLog(item.id)

      selectedLogDetail.value = response.data ?? response
    }
    catch (error) {
      isDetailDialogVisible.value = false
      showError(error, t('auth.auth.activity_logs.messages.detail_error'))
    }
    finally {
      detailLoading.value = false
    }
  }

  const handleDeleteLog = item => {
    openConfirmDialog({
      title: t('auth.auth.activity_logs.messages.delete_title'),
      message: t('auth.auth.activity_logs.messages.delete_message', { target: item.description || item.route || item.id }),
      confirmText: t('auth.auth.activity_logs.messages.delete'),
      confirmColor: 'error',
      action: async () => {
        await deleteActivityLog(item.id)
        selectedRows.value = selectedRows.value.filter(id => id !== item.id)
        showSuccess(t('auth.auth.activity_logs.messages.delete_success'))
        await refreshList(showError)
      },
    })
  }

  const handleBulkDelete = () => {
    if (!selectedRows.value.length)
      return

    openConfirmDialog({
      title: t('auth.auth.activity_logs.messages.bulk_delete_title'),
      message: t('auth.auth.activity_logs.messages.bulk_delete_message', { count: selectedRows.value.length }),
      confirmText: t('auth.auth.activity_logs.messages.delete'),
      confirmColor: 'error',
      action: async () => {
        await bulkDeleteActivityLogs(selectedRows.value)
        selectedRows.value = []
        showSuccess(t('auth.auth.activity_logs.messages.bulk_delete_success'))
        await refreshList(showError)
      },
    })
  }

  const openDeleteByDateDialog = currentFilters => {
    deleteByDateForm.value = {
      from_date: currentFilters.fromDate || '',
      to_date: currentFilters.toDate || '',
    }
    isDeleteByDateDialogVisible.value = true
  }

  const submitDeleteByDate = async () => {
    if (!deleteByDateForm.value.from_date || !deleteByDateForm.value.to_date) {
      showError(new Error('validation'), t('auth.auth.activity_logs.messages.delete_by_date_validation'))

      return
    }

    isDeleteByDateSubmitting.value = true
    try {
      await deleteActivityLogsByDate(deleteByDateForm.value)
      selectedRows.value = []
      isDeleteByDateDialogVisible.value = false
      showSuccess(t('auth.auth.activity_logs.messages.delete_by_date_success'))
      await refreshList(showError)
    }
    catch (error) {
      showError(error, t('auth.auth.activity_logs.messages.delete_by_date_error'))
    }
    finally {
      isDeleteByDateSubmitting.value = false
    }
  }

  const handleClearAll = () => {
    openConfirmDialog({
      title: t('auth.auth.activity_logs.messages.clear_all_title'),
      message: t('auth.auth.activity_logs.messages.clear_all_message'),
      confirmText: t('auth.auth.activity_logs.messages.clear_all_confirm'),
      confirmColor: 'error',
      action: async () => {
        await clearAllActivityLogs()
        selectedRows.value = []
        showSuccess(t('auth.auth.activity_logs.messages.clear_all_success'))
        await refreshList(showError)
      },
    })
  }

  const handleExport = async () => {
    isExporting.value = true
    try {
      if (selectedRows.value.length) {
        const selectedLogs = logs.value.filter(item => selectedRows.value.includes(item.id))

        exportRowsToExcel({
          rows: selectedLogs.map(item => ({
            description: item.description || '',
            user_type: item.user_type || '',
            user_name: item.user_name || t('auth.auth.activity_logs.table.guest'),
            organization_id: item.organization_id ?? '',
            route: item.route || '',
            method_type: item.method_type || '',
            status_code: item.status_code ?? '',
            ip_address: item.ip_address || '',
            country: item.country || '',
            user_agent: item.user_agent || '',
            request_data: typeof item.request_data === 'string' ? item.request_data : JSON.stringify(item.request_data ?? {}),
            created_at: formatAuthDateTime(item.created_at, { fallback: '', includeSeconds: true }),
            updated_at: formatAuthDateTime(item.updated_at || item.created_at, { fallback: '', includeSeconds: true }),
          })),
          headers: ['description', 'user_type', 'user_name', 'organization_id', 'route', 'method_type', 'status_code', 'ip_address', 'country', 'user_agent', 'request_data', 'created_at', 'updated_at'],
          sheetName: 'ActivityLogs',
          fileName: `activity_logs_selected_${new Date().toISOString().slice(0, 10)}.xlsx`,
          columns: [
            { wch: 32 },
            { wch: 16 },
            { wch: 24 },
            { wch: 16 },
            { wch: 40 },
            { wch: 12 },
            { wch: 12 },
            { wch: 18 },
            { wch: 20 },
            { wch: 42 },
            { wch: 36 },
            { wch: 22 },
            { wch: 22 },
          ],
        })

        showSuccess(t('auth.auth.activity_logs.messages.export_success'))

        return
      }

      const response = await exportActivityLogs(buildExportParams())
      const safeBlob = response instanceof Blob ? response : new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(safeBlob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      setTimeout(() => {
        document.body.removeChild(anchor)
        window.URL.revokeObjectURL(url)
      }, 5000)

      showSuccess(t('auth.auth.activity_logs.messages.export_success'))
    }
    catch (error) {
      showError(error, t('auth.auth.activity_logs.messages.export_error'))
    }
    finally {
      isExporting.value = false
    }
  }

  return {
    executeConfirmedAction,
    openDetailDialog,
    handleDeleteLog,
    handleBulkDelete,
    openDeleteByDateDialog,
    submitDeleteByDate,
    handleClearAll,
    handleExport,
  }
}
