/**
 * Role Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchRoles, deleteRole } from '../services/roleService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    totalCount: 0,
    isLoading: false,
    filters: {
      search: '',
      page: 1,
      perPage: DEFAULT_PER_PAGE,
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.perPage),
  },

  actions: {
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

    async removeRole(id) {
      await deleteRole(id)
      await this.fetchList()
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters, page: 1 }
      this.fetchList()
    },
  },
})
