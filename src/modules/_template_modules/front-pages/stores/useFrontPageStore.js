/**
 * Front-Page Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchPricing, fetchFAQ } from '../services/frontPageService'

export const useFrontPageStore = defineStore('frontPage', {
  state: () => ({
    pricing: [],
    faq: [],
    isLoading: false,
  }),

  actions: {
    async loadPricing() {
      this.isLoading = true
      try {
        this.pricing = await fetchPricing()
      }
      catch (error) {
        console.error('Failed to load pricing:', error)
      }
      finally {
        this.isLoading = false
      }
    },

    async loadFAQ() {
      this.isLoading = true
      try {
        this.faq = await fetchFAQ()
      }
      catch (error) {
        console.error('Failed to load FAQ:', error)
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
