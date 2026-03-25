/**
 * Logistics Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchFleets, fetchShipments, deleteFleet } from '../services/logisticsService'

export const useLogisticsStore = defineStore('logistics', {
  state: () => ({
    fleets: [],
    shipments: [],
    isLoading: false,
  }),

  getters: {
    availableFleets: state => state.fleets.filter(f => f.status === 'available'),
    activeShipments: state => state.shipments.filter(s => s.status === 'in_transit'),
  },

  actions: {
    async fetchFleetList() {
      this.isLoading = true
      try {
        const response = await fetchFleets()

        this.fleets = response.data || response
      }
      catch (error) {
        console.error('Failed to fetch fleets:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchShipmentList() {
      this.isLoading = true
      try {
        const response = await fetchShipments()

        this.shipments = response.data || response
      }
      catch (error) {
        console.error('Failed to fetch shipments:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeFleet(id) {
      await deleteFleet(id)
      await this.fetchFleetList()
    },
  },
})
