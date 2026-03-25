/**
 * Employee Store (Pinia)
 *
 * State management cho module Employee.
 * Quản lý danh sách, filters, loading states.
 */
import { defineStore } from 'pinia'
import { fetchEmployees, deleteEmployee } from '../services/employeeService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    /** Danh sách nhân viên */
    employees: [],

    /** Tổng số bản ghi */
    totalCount: 0,

    /** Đang loading? */
    isLoading: false,

    /** Filters hiện tại */
    filters: {
      search: '',
      department: null,
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'fullName',
      sortDesc: false,
    },
  }),

  getters: {
    /**
     * Tổng số trang
     */
    totalPages: state => Math.ceil(state.totalCount / state.filters.perPage),

    /**
     * Có đang filter không?
     */
    hasActiveFilters: state =>
      !!(state.filters.search || state.filters.department || state.filters.status),
  },

  actions: {
    /**
     * Fetch danh sách nhân viên từ API
     */
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchEmployees(this.filters)

        this.employees = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch employees:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * Xóa 1 nhân viên và refresh list
     * @param {number} id
     */
    async removeEmployee(id) {
      await deleteEmployee(id)
      await this.fetchList()
    },

    /**
     * Cập nhật filters và fetch lại
     * @param {Object} newFilters
     */
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters, page: 1 }
      this.fetchList()
    },

    /**
     * Chuyển trang
     * @param {number} page
     */
    goToPage(page) {
      this.filters.page = page
      this.fetchList()
    },

    /**
     * Reset filters về mặc định
     */
    resetFilters() {
      this.filters = {
        search: '',
        department: null,
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
