/**
 * User Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchUsers, deleteUser } from '../services/userService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    totalCount: 0,
    isLoading: false,

    filters: {
      search: '',
      role: null,
      plan: null,
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'fullName',
      sortDesc: false,
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.perPage),
    hasActiveFilters: state =>
      !!(state.filters.search || state.filters.role || state.filters.plan || state.filters.status),
  },

  actions: {
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

    async removeUser(id) {
      await deleteUser(id)
      await this.fetchList()
    },

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
        perPage: DEFAULT_PER_PAGE,
        sortBy: 'fullName',
        sortDesc: false,
      }
      this.fetchList()
    },
  },
})
