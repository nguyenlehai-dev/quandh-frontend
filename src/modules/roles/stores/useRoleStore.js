/**
 * Role Store (Pinia) — CRUDS đầy đủ
 */
import { defineStore } from 'pinia'
import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  bulkDeleteRoles,
  fetchRoleStats,
  exportRoles,
  importRoles,
} from '../services/roleService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    totalCount: 0,
    isLoading: false,

    // Stats
    stats: { total: 0, active: 0, inactive: 0 },

    // Selected items (for bulk operations)
    selectedIds: [],

    filters: {
      search: '',
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
        const response = await fetchRoles(this.filters)

        this.roles = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch roles:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ─── Show ──────────────────────────────────
    async fetchOne(id) {
      return await fetchRole(id)
    },

    // ─── Create ────────────────────────────────
    async addRole(data) {
      const response = await createRole(data)

      await this.fetchList()

      return response
    },

    // ─── Update ────────────────────────────────
    async editRole(id, data) {
      const response = await updateRole(id, data)

      await this.fetchList()

      return response
    },

    // ─── Delete ────────────────────────────────
    async removeRole(id) {
      await deleteRole(id)
      await this.fetchList()
    },

    // ─── Bulk Delete ───────────────────────────
    async bulkDelete() {
      if (!this.selectedIds.length) return
      await bulkDeleteRoles(this.selectedIds)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Stats ─────────────────────────────────
    async fetchStats() {
      const response = await fetchRoleStats(this.filters)

      this.stats = response.data || { total: 0, active: 0, inactive: 0 }
    },

    // ─── Export ─────────────────────────────────
    async exportData() {
      return await exportRoles(this.filters)
    },

    // ─── Import ─────────────────────────────────
    async importData(file) {
      const response = await importRoles(file)

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
      this.selectedIds = this.roles.map(r => r.id)
    },

    clearSelection() {
      this.selectedIds = []
    },
  },
})
