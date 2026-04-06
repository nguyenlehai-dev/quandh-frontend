<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import MeetingDataTable from '../../components/MeetingDataTable.vue'
import MeetingListToolbar from '../../components/MeetingListToolbar.vue'
import MeetingStatsCards from '../../components/MeetingStatsCards.vue'
import { useMeetingListPage } from '../../composables/useMeetingListPage'

const {
  ITEMS_PER_PAGE_OPTIONS,
  snackbar,
  searchQuery,
  selectedStatus,
  meetingTypeFilter,
  fromDate,
  toDate,
  endFromDate,
  endToDate,
  itemsPerPage,
  page,
  selectedRows,
  meetings,
  totalMeetings,
  loading,
  widgetData,
  statusOptions,
  meetingStatusOptions,
  bulkStatusOptions,
  meetingTypeOptions,
  headers,
  hasInvalidDateRange,
  isConfirmDialogVisible,
  isConfirming,
  isExporting,
  isImporting,
  confirmDialog,
  updateOptions,
  handleSelectionChange,
  bulkChangeStatus,
  bulkDeleteMeetings,
  handleImport,
  handleExport,
  deleteMeeting,
  changeMeetingStatus,
  executeConfirmedAction,
  resolveStatusLabel,
  resolveStatusColor,
} = useMeetingListPage()
</script>

<template>
  <div class="meeting-page">
    <MeetingStatsCards :widget-data="widgetData" />

    <VCard>
      <MeetingListToolbar
        :search-query="searchQuery"
        :selected-status="selectedStatus"
        :meeting-type-filter="meetingTypeFilter"
        :from-date="fromDate"
        :to-date="toDate"
        :end-from-date="endFromDate"
        :end-to-date="endToDate"
        :status-options="statusOptions"
        :meeting-type-options="meetingTypeOptions"
        :has-invalid-date-range="hasInvalidDateRange"
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'Meeting')"
        :can-export="$can('export', 'Meeting')"
        :can-create="$can('store', 'Meeting')"
        :can-bulk-update-status="$can('update', 'Meeting')"
        :can-bulk-destroy="$can('destroy', 'Meeting')"
        @update:search-query="searchQuery = $event"
        @update:selected-status="selectedStatus = $event"
        @update:meeting-type-filter="meetingTypeFilter = $event"
        @update:from-date="fromDate = $event"
        @update:to-date="toDate = $event"
        @update:end-from-date="endFromDate = $event"
        @update:end-to-date="endToDate = $event"
        @bulk-change-status="bulkChangeStatus"
        @bulk-delete="bulkDeleteMeetings"
        @import="handleImport"
        @export="handleExport"
      />

      <MeetingDataTable
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :selected-rows="selectedRows"
        :meetings="meetings"
        :total-meetings="totalMeetings"
        :headers="headers"
        :loading="loading"
        :can-read="$can('show', 'Meeting')"
        :can-update="$can('update', 'Meeting')"
        :can-delete="$can('destroy', 'Meeting')"
        :resolve-status-label="resolveStatusLabel"
        :resolve-status-color="resolveStatusColor"
        :meeting-status-options="meetingStatusOptions"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        @selection-change="handleSelectionChange"
        @options-change="updateOptions"
        @change-status="changeMeetingStatus"
        @delete="deleteMeeting"
      />
    </VCard>

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
