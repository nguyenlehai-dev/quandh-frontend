/**
 * Academy Store (Pinia)
 *
 * State management cho module Academy.
 */
import { defineStore } from 'pinia'
import { fetchCourses, deleteCourse } from '../services/academyService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useAcademyStore = defineStore('academy', {
  state: () => ({
    /** Danh sách khóa học */
    courses: [],

    /** Tổng số bản ghi */
    totalCount: 0,

    /** Đang loading? */
    isLoading: false,

    /** Filters hiện tại */
    filters: {
      search: '',
      category: null,
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'title',
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
      !!(state.filters.search || state.filters.category || state.filters.status),
  },

  actions: {
    /**
     * Fetch danh sách khóa học từ API
     */
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchCourses(this.filters)

        this.courses = response.data
        this.totalCount = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch courses:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * Xóa 1 khóa học và refresh list
     * @param {number} id
     */
    async removeCourse(id) {
      await deleteCourse(id)
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
        category: null,
        status: null,
        page: 1,
        perPage: DEFAULT_PER_PAGE,
        sortBy: 'title',
        sortDesc: false,
      }
      this.fetchList()
    },
  },
})
