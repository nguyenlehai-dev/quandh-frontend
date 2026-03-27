/**
 * Organization Store (Pinia) — CRUDS đầy đủ
 */
import { defineStore } from 'pinia'
import {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  changeOrganizationStatus,
  fetchOrganizationTree,
  bulkDeleteOrganizations,
  bulkUpdateOrganizationStatus,
  fetchOrganizationStats,
  exportOrganizations,
  importOrganizations,
} from '../services/organizationService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    organizations: [],
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
      status: null,
      page: 1,
      limit: DEFAULT_PER_PAGE,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.limit),
    hasActiveFilters: state => !!(state.filters.search || state.filters.status),
    hasSelection: state => state.selectedIds.length > 0,
  },

  actions: {
    // ─── List ──────────────────────────────────
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchOrganizations(this.filters)

        this.organizations = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch organizations:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ─── Show ──────────────────────────────────
    async fetchOne(id) {
      return await fetchOrganization(id)
    },

    // ─── Create ────────────────────────────────
    async addOrganization(data) {
      const response = await createOrganization(data)
      await this.fetchList()

      return response
    },

    // ─── Update ────────────────────────────────
    async editOrganization(id, data) {
      const response = await updateOrganization(id, data)
      await this.fetchList()

      return response
    },

    // ─── Delete ────────────────────────────────
    async removeOrganization(id) {
      await deleteOrganization(id)
      await this.fetchList()
    },

    // ─── Change Status ─────────────────────────
    async changeStatus(id, status) {
      await changeOrganizationStatus(id, status)
      await this.fetchList()
    },

    // ─── Tree ──────────────────────────────────
    async fetchTree(params = {}) {
      const response = await fetchOrganizationTree(params)

      this.tree = response.data || []

      return this.tree
    },

    // ─── Bulk Delete ───────────────────────────
    async bulkDelete() {
      if (!this.selectedIds.length) return
      await bulkDeleteOrganizations(this.selectedIds)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Bulk Update Status ────────────────────
    async bulkChangeStatus(status) {
      if (!this.selectedIds.length) return
      await bulkUpdateOrganizationStatus(this.selectedIds, status)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Stats ─────────────────────────────────
    async fetchStats() {
      const response = await fetchOrganizationStats(this.filters)

      this.stats = response.data || { total: 0, active: 0, inactive: 0 }
    },

    // ─── Export ─────────────────────────────────
    async exportData() {
      return await exportOrganizations(this.filters)
    },

    // ─── Import ─────────────────────────────────
    async importData(file) {
      const response = await importOrganizations(file)
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
        status: null,
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
      this.selectedIds = this.organizations.map(o => o.id)
    },

    clearSelection() {
      this.selectedIds = []
    },
  },
})
