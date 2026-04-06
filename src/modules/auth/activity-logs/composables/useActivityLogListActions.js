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

  const selectedLogIds = () => selectedRows.value
  const hasSelectedRows = () => selectedLogIds().length > 0
  const getExportFileDate = () => new Date().toISOString().slice(0, 10)
  const formatRequestData = value => typeof value === 'string' ? value : JSON.stringify(value ?? {})

  const createSelectedLogExportRow = item => ({
    description: item.description || '',
    'user_type': item.user_type || '',
    'user_name': item.user_name || t('auth.auth.activity_logs.table.guest'),
    'organization_id': item.organization_id ?? '',
    route: item.route || '',
    'method_type': item.method_type || '',
    'status_code': item.status_code ?? '',
    'ip_address': item.ip_address || '',
    country: item.country || '',
    'user_agent': item.user_agent || '',
    'request_data': formatRequestData(item.request_data),
    'created_at': formatAuthDateTime(item.created_at, { fallback: '', includeSeconds: true }),
    'updated_at': formatAuthDateTime(item.updated_at || item.created_at, { fallback: '', includeSeconds: true }),
  })

  const refreshActivityLogs = () => refreshList(showError)

  const clearSelectedRows = () => {
    selectedRows.value = []
  }

  const removeSelectedRow = id => {
    selectedRows.value = selectedLogIds().filter(selectedId => selectedId !== id)
  }

  const runListAction = async ({ action, successMessage, errorMessage, onSuccess }) => {
    try {
      await action()
      await onSuccess?.()
      showSuccess(successMessage)
      await refreshActivityLogs()
    }
    catch (error) {
      showError(error, errorMessage)
    }
  }

  const createConfirmAction = ({
    title,
    message,
    confirmText,
    action,
  }) => openConfirmDialog({
    title,
    message,
    confirmText,
    confirmColor: 'error',
    action,
  })

  const downloadBlobFile = ({ blob, fileName }) => {
    const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(safeBlob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    setTimeout(() => {
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    }, 5000)
  }

  const exportSelectedLogs = () => {
    const selectedLogs = logs.value.filter(item => selectedLogIds().includes(item.id))

    exportRowsToExcel({
      rows: selectedLogs.map(createSelectedLogExportRow),
      headers: ['description', 'user_type', 'user_name', 'organization_id', 'route', 'method_type', 'status_code', 'ip_address', 'country', 'user_agent', 'request_data', 'created_at', 'updated_at'],
      sheetName: 'ActivityLogs',
      fileName: `activity_logs_selected_${getExportFileDate()}.xlsx`,
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
  }

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
    createConfirmAction({
      title: t('auth.auth.activity_logs.messages.delete_title'),
      message: t('auth.auth.activity_logs.messages.delete_message', { target: item.description || item.route || item.id }),
      confirmText: t('auth.auth.activity_logs.messages.delete'),
      action: () => runListAction({
        action: () => deleteActivityLog(item.id),
        successMessage: t('auth.auth.activity_logs.messages.delete_success'),
        errorMessage: t('auth.auth.activity_logs.messages.action_error'),
        onSuccess: () => removeSelectedRow(item.id),
      }),
    })
  }

  const handleBulkDelete = () => {
    if (!hasSelectedRows())
      return

    createConfirmAction({
      title: t('auth.auth.activity_logs.messages.bulk_delete_title'),
      message: t('auth.auth.activity_logs.messages.bulk_delete_message', { count: selectedLogIds().length }),
      confirmText: t('auth.auth.activity_logs.messages.delete'),
      action: () => runListAction({
        action: () => bulkDeleteActivityLogs(selectedLogIds()),
        successMessage: t('auth.auth.activity_logs.messages.bulk_delete_success'),
        errorMessage: t('auth.auth.activity_logs.messages.action_error'),
        onSuccess: clearSelectedRows,
      }),
    })
  }

  const openDeleteByDateDialog = currentFilters => {
    deleteByDateForm.value = {
      'from_date': currentFilters.fromDate || '',
      'to_date': currentFilters.toDate || '',
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
      clearSelectedRows()
      isDeleteByDateDialogVisible.value = false
      showSuccess(t('auth.auth.activity_logs.messages.delete_by_date_success'))
      await refreshActivityLogs()
    }
    catch (error) {
      showError(error, t('auth.auth.activity_logs.messages.delete_by_date_error'))
    }
    finally {
      isDeleteByDateSubmitting.value = false
    }
  }

  const handleClearAll = () => {
    createConfirmAction({
      title: t('auth.auth.activity_logs.messages.clear_all_title'),
      message: t('auth.auth.activity_logs.messages.clear_all_message'),
      confirmText: t('auth.auth.activity_logs.messages.clear_all_confirm'),
      action: () => runListAction({
        action: clearAllActivityLogs,
        successMessage: t('auth.auth.activity_logs.messages.clear_all_success'),
        errorMessage: t('auth.auth.activity_logs.messages.action_error'),
        onSuccess: clearSelectedRows,
      }),
    })
  }

  const handleExport = async () => {
    isExporting.value = true
    try {
      if (hasSelectedRows()) {
        exportSelectedLogs()
        showSuccess(t('auth.auth.activity_logs.messages.export_success'))

        return
      }

      const response = await exportActivityLogs(buildExportParams())

      downloadBlobFile({
        blob: response,
        fileName: `activity_logs_${getExportFileDate()}.xlsx`,
      })
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
