<script setup>
import ActivityLogDataTable from '../components/ActivityLogDataTable.vue'
import ActivityLogDeleteByDateDialog from '../components/ActivityLogDeleteByDateDialog.vue'
import ActivityLogDetailDialog from '../components/ActivityLogDetailDialog.vue'
import ActivityLogListToolbar from '../components/ActivityLogListToolbar.vue'
import ActivityLogStatsCards from '../components/ActivityLogStatsCards.vue'
import { useActivityLogListPage } from '../composables/useActivityLogListPage'

const {
  ITEMS_PER_PAGE_OPTIONS,
  snackbar,
  searchQuery,
  selectedMethod,
  selectedStatus,
  fromDate,
  toDate,
  itemsPerPage,
  page,
  selectedRows,
  logs,
  totalLogs,
  loading,
  isExporting,
  widgetData,
  headers,
  methodOptions,
  statusOptions,
  hasInvalidDateRange,
  canExportLogs,
  canViewLogDetail,
  canDeleteLog,
  canBulkDeleteLogs,
  canManageLogCleanup,
  detailLoading,
  selectedLogDetail,
  isDetailDialogVisible,
  isConfirmDialogVisible,
  isConfirming,
  isDeleteByDateDialogVisible,
  isDeleteByDateSubmitting,
  deleteByDateForm,
  confirmDialog,
  updateOptions,
  resetFilters,
  handleSelectionChange,
  openDetailDialog,
  handleDeleteLog,
  handleBulkDelete,
  openDeleteByDateDialog,
  submitDeleteByDate,
  handleClearAll,
  handleExport,
  executeConfirmedAction,
} = useActivityLogListPage()
</script>

<template>
  <div id="activity-logs-module-root">
    <ActivityLogStatsCards :widget-data="widgetData" />

    <VCard class="activity-logs-main-card">
      <ActivityLogListToolbar
        :search-query="searchQuery"
        :selected-method="selectedMethod"
        :selected-status="selectedStatus"
        :from-date="fromDate"
        :to-date="toDate"
        :method-options="methodOptions"
        :status-options="statusOptions"
        :selected-rows-count="selectedRows.length"
        :is-exporting="isExporting"
        :can-export="canExportLogs"
        :can-manage-log-cleanup="canManageLogCleanup"
        :can-bulk-delete-logs="canBulkDeleteLogs"
        :has-invalid-date-range="hasInvalidDateRange"
        @update:search-query="searchQuery = $event"
        @update:selected-method="selectedMethod = $event"
        @update:selected-status="selectedStatus = $event"
        @update:from-date="fromDate = $event"
        @update:to-date="toDate = $event"
        @reset="resetFilters"
        @bulk-delete="handleBulkDelete"
        @delete-by-date="openDeleteByDateDialog({ fromDate, toDate })"
        @clear-all="handleClearAll"
        @export="handleExport"
      />

      <ActivityLogDataTable
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :selected-rows="selectedRows"
        :logs="logs"
        :total-logs="totalLogs"
        :headers="headers"
        :loading="loading"
        :can-view-log-detail="canViewLogDetail"
        :can-delete-log="canDeleteLog"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        @selection-change="handleSelectionChange"
        @options-change="updateOptions"
        @view="openDetailDialog"
        @delete="handleDeleteLog"
      />
    </VCard>

    <ActivityLogDetailDialog
      v-model="isDetailDialogVisible"
      :loading="detailLoading"
      :activity-log="selectedLogDetail"
    />

    <ActivityLogDeleteByDateDialog
      v-model="isDeleteByDateDialogVisible"
      v-model:from-date="deleteByDateForm.from_date"
      v-model:to-date="deleteByDateForm.to_date"
      :loading="isDeleteByDateSubmitting"
      @submit="submitDeleteByDate"
    />

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<style lang="scss">
.activity-logs-main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary-darken-1), 0.08);
  border-radius: 22px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.activity-log-table {
  .v-data-table__tr {
    &:hover {
      background: rgba(var(--v-theme-primary-darken-1), 0.04) !important;
    }
  }
}
</style>
