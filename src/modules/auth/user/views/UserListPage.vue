<script setup>
import UserDataTable from '../components/UserDataTable.vue'
import UserListToolbar from '../components/UserListToolbar.vue'
import UserStatsCards from '../components/UserStatsCards.vue'
import { useUserListPage } from '../composables/useUserListPage'

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
  users,
  totalUsers,
  loading,
  widgetData,
  statusOptions,
  statusActionOptions,
  bulkStatusOptions,
  headers,
  hasInvalidDateRange,
  isConfirmDialogVisible,
  isConfirming,
  isExporting,
  isImporting,
  confirmDialog,
  normalizeUserStatus,
  resolveUserStatusVariant,
  resolveStatusText,
  getRoleName,
  getOrgName,
  updateOptions,
  handleSelectionChange,
  bulkChangeStatus,
  bulkDeleteUsers,
  handleImport,
  handleExport,
  openCreateUserPage,
  openEditUserPage,
  openDetailUserPage,
  deleteUser,
  changeUserStatus,
  executeConfirmedAction,
  downloadUserImportTemplate,
} = useUserListPage()
</script>

<template>
  <div class="user-page">
    <UserStatsCards :widget-data="widgetData" />

    <VCard>
      <UserListToolbar
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
        :can-import="$can('import', 'User')"
        :can-export="$can('export', 'User')"
        :can-create="$can('create', 'User')"
        :can-bulk-update-status="$can('bulkUpdateStatus', 'User')"
        :can-bulk-destroy="$can('bulkDestroy', 'User')"
        :download-template-handler="downloadUserImportTemplate"
        @update:search-query="searchQuery = $event"
        @update:selected-status="selectedStatus = $event"
        @update:from-date="fromDate = $event"
        @update:to-date="toDate = $event"
        @bulk-change-status="bulkChangeStatus"
        @bulk-delete="bulkDeleteUsers"
        @import="handleImport"
        @export="handleExport"
        @add="openCreateUserPage"
      />

      <UserDataTable
        :page="page"
        :items-per-page="itemsPerPage"
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :selected-rows="selectedRows"
        :users="users"
        :total-users="totalUsers"
        :headers="headers"
        :loading="loading"
        :can-read="$can('read', 'User')"
        :can-update="$can('update', 'User')"
        :can-delete="$can('delete', 'User')"
        :status-action-options="statusActionOptions"
        :get-role-name="getRoleName"
        :get-org-name="getOrgName"
        :normalize-user-status="normalizeUserStatus"
        :resolve-user-status-variant="resolveUserStatusVariant"
        :resolve-status-text="resolveStatusText"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        @selection-change="handleSelectionChange"
        @options-change="updateOptions"
        @view="openDetailUserPage"
        @edit="openEditUserPage"
        @delete="deleteUser"
        @change-status="changeUserStatus"
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
