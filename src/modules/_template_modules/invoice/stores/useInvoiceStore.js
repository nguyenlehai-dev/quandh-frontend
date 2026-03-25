/**
 * Invoice Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchInvoices, deleteInvoice } from '../services/invoiceService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    totalCount: 0,
    isLoading: false,

    filters: {
      search: '',
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'createdAt',
      sortDesc: true,
    },
  }),

  getters: {
    totalPages: state => Math.ceil(state.totalCount / state.filters.perPage),
    hasActiveFilters: state => !!(state.filters.search || state.filters.status),
  },

  actions: {
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchInvoices(this.filters)

        this.invoices = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch invoices:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeInvoice(id) {
      await deleteInvoice(id)
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
        status: null,
        page: 1,
        perPage: DEFAULT_PER_PAGE,
        sortBy: 'createdAt',
        sortDesc: true,
      }
      this.fetchList()
    },
  },
})
