/**
 * User Store (Pinia) — CRUDS đầy đủ
 */
import { defineStore } from 'pinia'
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  bulkDeleteUsers,
  bulkUpdateUserStatus,
  fetchUserStats,
  exportUsers,
  importUsers,
} from '../services/userService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    totalCount: 0,
    isLoading: false,

    // Stats
    stats: { total: 0, active: 0, inactive: 0 },

    // Selected items (for bulk operations)
    selectedIds: [],

    filters: {
      search: '',
      role: null,
      plan: null,
      status: null,
      page: 1,
      limit: DEFAULT_PER_PAGE,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.limit),
    hasActiveFilters: state =>
      !!(state.filters.search || state.filters.role || state.filters.plan || state.filters.status),
    hasSelection: state => state.selectedIds.length > 0,
  },

  actions: {
    // ─── List ──────────────────────────────────
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchUsers(this.filters)

        this.users = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch users:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ─── Show ──────────────────────────────────
    async fetchOne(id) {
      return await fetchUser(id)
    },

    // ─── Create ────────────────────────────────
    async addUser(data) {
      const response = await createUser(data)
      await this.fetchList()

      return response
    },

    // ─── Update ────────────────────────────────
    async editUser(id, data) {
      const response = await updateUser(id, data)
      await this.fetchList()

      return response
    },

    // ─── Delete ────────────────────────────────
    async removeUser(id) {
      await deleteUser(id)
      await this.fetchList()
    },

    // ─── Change Status ─────────────────────────
    async changeStatus(id, status) {
      await changeUserStatus(id, status)
      await this.fetchList()
    },

    // ─── Bulk Delete ───────────────────────────
    async bulkDelete() {
      if (!this.selectedIds.length) return
      await bulkDeleteUsers(this.selectedIds)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Bulk Update Status ────────────────────
    async bulkChangeStatus(status) {
      if (!this.selectedIds.length) return
      await bulkUpdateUserStatus(this.selectedIds, status)
      this.selectedIds = []
      await this.fetchList()
    },

    // ─── Stats ─────────────────────────────────
    async fetchStats() {
      const response = await fetchUserStats(this.filters)

      this.stats = response.data || { total: 0, active: 0, inactive: 0 }
    },

    // ─── Export ─────────────────────────────────
    async exportData() {
      return await exportUsers(this.filters)
    },

    // ─── Import ─────────────────────────────────
    async importData(file) {
      const response = await importUsers(file)
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
        role: null,
        plan: null,
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
      this.selectedIds = this.users.map(u => u.id)
    },

    clearSelection() {
      this.selectedIds = []
    },
  },
})
