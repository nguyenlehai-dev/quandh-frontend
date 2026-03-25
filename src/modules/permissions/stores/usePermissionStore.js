/**
 * Permission Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchPermissions, deletePermission } from '../services/permissionService'
import { DEFAULT_PER_PAGE } from '../configs'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [],
    totalCount: 0,
    isLoading: false,
    filters: {
      search: '',
      module: null,
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

    async removePermission(id) {
      await deletePermission(id)
      await this.fetchList()
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters, page: 1 }
      this.fetchList()
    },
  },
})
