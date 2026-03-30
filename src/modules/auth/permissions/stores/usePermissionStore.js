/**
 * Permission Store (Pinia) — CRUDS đầy đủ
 */
import { defineStore } from 'pinia'
import {
  fetchPermissions,
  fetchPermission,
  createPermission,
  updatePermission,
  deletePermission,
  fetchPermissionTree,
  bulkDeletePermissions,
  fetchPermissionStats,
  exportPermissions,
  importPermissions,
} from '../services/permissionService'
import { DEFAULT_PER_PAGE } from '../configs'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [],
    totalCount: 0,
    isLoading: false,

    // Tree data
    tree: [],

    // Stats
    stats: { total: 0, active: 0, inactive: 0 },

    // Selected items (for bulk operations)
    selectedIds: [],

    filters: {
      search: '',
      module: null,
      page: 1,
      limit: DEFAULT_PER_PAGE,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.limit),
    hasSelection: state => state.selectedIds.length > 0,
  },

  actions: {
    // ─── List ──────────────────────────────────
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchPermissions(this.filters)

        this.permissions = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch permissions:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ─── Show ──────────────────────────────────
    async fetchOne(id) {
      return await fetchPermission(id)
    },

    // ─── Create ────────────────────────────────
    async addPermission(data) {
      const response = await createPermission(data)

      await this.fetchList()

      return response
    },

    // ─── Update ────────────────────────────────
    async editPermission(id, data) {
      const response = await updatePermission(id, data)

      await this.fetchList()

      return response
    },

    // ─── Delete ────────────────────────────────
    async removePermission(id) {
      await deletePermission(id)
      await this.fetchList()
    },

    // ─── Tree ──────────────────────────────────
    async fetchTree(params = {}) {
      const response = await fetchPermissionTree(params)

      this.tree = response.data || []

      return this.tree
    },

    // ─── Bulk Delete ───────────────────────────
    async bulkDelete() {
      if (!this.selectedIds.length) return
      await bulkDeletePermissions(this.selectedIds)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Stats ─────────────────────────────────
    async fetchStats() {
      const response = await fetchPermissionStats(this.filters)

      this.stats = response.data || { total: 0, active: 0, inactive: 0 }
    },

    // ─── Export ─────────────────────────────────
    async exportData() {
      return await exportPermissions(this.filters)
    },

    // ─── Import ─────────────────────────────────
    async importData(file) {
      const response = await importPermissions(file)

      await this.fetchList()

      return response
    },

    // ─── Filters ────────────────────────────────
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters, page: 1 }
      this.fetchList()
    },

    goToPage(page) {
      this.filters.page = page
      this.fetchList()
    },

    resetFilters() {
      this.filters = {
        search: '',
        module: null,
        page: 1,
        limit: DEFAULT_PER_PAGE,
        sort_by: 'created_at',
        sort_order: 'desc',
      }
      this.fetchList()
    },

    // ─── Selection ──────────────────────────────
    toggleSelection(id) {
      const idx = this.selectedIds.indexOf(id)
      if (idx === -1) this.selectedIds.push(id)
      else this.selectedIds.splice(idx, 1)
    },

    selectAll() {
      this.selectedIds = this.permissions.map(p => p.id)
    },

    clearSelection() {
      this.selectedIds = []
    },
  },
})
