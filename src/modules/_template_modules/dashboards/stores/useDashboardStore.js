/**
 * Dashboard Store (Pinia)
 *
 * State management cho module Dashboard.
 */
import { defineStore } from 'pinia'
import { fetchStatistics } from '../services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    /** Thống kê tổng quan */
    statistics: null,

    /** Đang loading? */
    isLoading: false,

    /** Period hiện tại */
    period: 'month',
  }),

  getters: {
    /**
     * Có dữ liệu không?
     */
    hasData: state => !!state.statistics,
  },

  actions: {
    /**
     * Fetch thống kê tổng quan
     */
    async fetchStatistics() {
      this.isLoading = true
      try {
        this.statistics = await fetchStatistics({ period: this.period })
      }
      catch (error) {
        console.error('Failed to fetch statistics:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * Đổi period và fetch lại
     * @param {string} newPeriod
     */
    changePeriod(newPeriod) {
      this.period = newPeriod
      this.fetchStatistics()
    },
  },
})
