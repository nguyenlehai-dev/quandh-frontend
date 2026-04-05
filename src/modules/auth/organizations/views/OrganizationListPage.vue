<script setup>
import AddEditOrganizationDrawer from '@/components/dialogs/AddEditOrganizationDrawer.vue'
import OrganizationDataTable from '../components/OrganizationDataTable.vue'
import OrganizationListToolbar from '../components/OrganizationListToolbar.vue'
import OrganizationStatsCards from '../components/OrganizationStatsCards.vue'
import { useOrganizationListPage } from '../composables/useOrganizationListPage'

const {
  ITEMS_PER_PAGE_OPTIONS,
  snackbar,
  searchQuery,
  selectedStatus,
  fromDate,
  toDate,
  itemsPerPage,
  page,
  selectedRows,
  organizations,
  totalOrganizations,
  loading,
  widgetData,
  statusOptions,
  bulkStatusOptions,
  headers,
  hasInvalidDateRange,
  isDialogVisible,
  editingOrganization,
  isReadonlyDrawer,
  isConfirmDialogVisible,
  isConfirming,
  isExporting,
  isImporting,
  confirmDialog,
  getTreeIndentStyle,
  getStatusToggleState,
  isStatusUpdating,
  updateOptions,
  handleSelectionChange,
  bulkChangeStatus,
  bulkDeleteOrgs,
  handleImport,
  handleExport,
  openAddDialog,
  openEditDialog,
  openDetailDialog,
  deleteOrganization,
  changeOrganizationStatus,
  onSaved,
  executeConfirmedAction,
} = useOrganizationListPage()
</script>

<template>
  <div class="organization-page">
    <OrganizationStatsCards :widget-data="widgetData" />

    <VCard>
      <OrganizationListToolbar
        :search-query="searchQuery"
        :selected-status="selectedStatus"
        :from-date="fromDate"
        :to-date="toDate"
        :status-options="statusOptions"
        :has-invalid-date-range="hasInvalidDateRange"
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'Organization')"
        :can-export="$can('export', 'Organization')"
        :can-create="$can('create', 'Organization')"
        :can-bulk-update-status="$can('bulkUpdateStatus', 'Organization')"
        :can-bulk-destroy="$can('bulkDestroy', 'Organization')"
        @update:search-query="searchQuery = $event"
        @update:selected-status="selectedStatus = $event"
        @update:from-date="fromDate = $event"
        @update:to-date="toDate = $event"
        @bulk-change-status="bulkChangeStatus"
        @bulk-delete="bulkDeleteOrgs"
        @import="handleImport"
        @export="handleExport"
        @add="openAddDialog"
      />

      <OrganizationDataTable
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :selected-rows="selectedRows"
        :organizations="organizations"
        :total-organizations="totalOrganizations"
        :headers="headers"
        :loading="loading"
        :can-read="$can('read', 'Organization')"
        :can-update="$can('update', 'Organization')"
        :can-delete="$can('delete', 'Organization')"
        :get-tree-indent-style="getTreeIndentStyle"
        :get-status-toggle-state="getStatusToggleState"
        :is-status-updating="isStatusUpdating"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        @selection-change="handleSelectionChange"
        @options-change="updateOptions"
        @change-status="changeOrganizationStatus"
        @edit="openEditDialog"
        @detail="openDetailDialog"
        @delete="deleteOrganization"
      />
    </VCard>

    <AddEditOrganizationDrawer
      v-model:is-drawer-open="isDialogVisible"
      :readonly="isReadonlyDrawer"
      :organization="editingOrganization"
      @saved="onSaved"
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
