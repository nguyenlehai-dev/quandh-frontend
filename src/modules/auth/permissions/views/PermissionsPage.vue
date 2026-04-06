<script setup>
import AddEditPermissionDialog from '@/components/dialogs/AddEditPermissionDialog.vue'
import PermissionDataTable from '../components/PermissionDataTable.vue'
import PermissionListToolbar from '../components/PermissionListToolbar.vue'
import PermissionStatsCards from '../components/PermissionStatsCards.vue'
import { usePermissionListPage } from '../composables/usePermissionListPage'

const {
  ITEMS_PER_PAGE_OPTIONS,
  snackbar,
  searchQuery,
  fromDate,
  toDate,
  page,
  itemsPerPage,
  permissions,
  totalItems,
  loading,
  isImporting,
  isExporting,
  selectedRows,
  permissionItem,
  isDialogVisible,
  detailPermissionItem,
  isDetailDialogVisible,
  isConfirmDialogVisible,
  isConfirming,
  confirmDialog,
  headers,
  widgetData,
  parentOptions,
  hasInvalidDateRange,
  isGroupRow,
  getGroupName,
  getDisplayName,
  updateOptions,
  handleSelectionChange,
  openCreateDialog,
  openEditDialog,
  openDetailDialog,
  onSaved,
  executeConfirmedAction,
  deletePermission,
  bulkDeletePermissions,
  handleExport,
  handleImport,
  downloadPermissionTemplate,
} = usePermissionListPage()
</script>

<template>
  <div class="permissions-page">
    <PermissionStatsCards :widget-data="widgetData" />

    <VCard>
      <PermissionListToolbar
        :search-query="searchQuery"
        :from-date="fromDate"
        :to-date="toDate"
        :has-invalid-date-range="hasInvalidDateRange"
        :selected-rows-count="selectedRows.length"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'Permission')"
        :can-export="$can('export', 'Permission')"
        :can-create="$can('create', 'Permission')"
        :can-bulk-destroy="$can('bulkDestroy', 'Permission')"
        :download-template-handler="downloadPermissionTemplate"
        @update:search-query="searchQuery = $event"
        @update:from-date="fromDate = $event"
        @update:to-date="toDate = $event"
        @bulk-delete="bulkDeletePermissions"
        @import="handleImport"
        @export="handleExport"
        @add="openCreateDialog"
      />

      <PermissionDataTable
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :selected-rows="selectedRows"
        :permissions="permissions"
        :total-items="totalItems"
        :headers="headers"
        :loading="loading"
        :can-read="$can('read', 'Permission')"
        :can-update="$can('update', 'Permission')"
        :can-delete="$can('delete', 'Permission')"
        :is-group-row="isGroupRow"
        :get-group-name="getGroupName"
        :get-display-name="getDisplayName"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        @selection-change="handleSelectionChange"
        @options-change="updateOptions"
        @detail="openDetailDialog"
        @edit="openEditDialog"
        @delete="deletePermission"
      />
    </VCard>

    <AddEditPermissionDialog
      v-model:is-dialog-visible="isDialogVisible"
      :permission-item="permissionItem"
      :parent-options="parentOptions"
      @saved="onSaved"
    />

    <AddEditPermissionDialog
      v-model:is-dialog-visible="isDetailDialogVisible"
      :permission-item="detailPermissionItem"
      :parent-options="parentOptions"
      readonly
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
