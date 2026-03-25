/**
 * Ecommerce Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchProducts, fetchOrders, deleteProduct, deleteOrder } from '../services/ecommerceService'
import { DEFAULT_PER_PAGE } from '../configs'

export const useEcommerceStore = defineStore('ecommerce', {
  state: () => ({
    products: [],
    orders: [],
    totalProducts: 0,
    totalOrders: 0,
    isLoading: false,

    productFilters: {
      search: '',
      category: null,
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'name',
      sortDesc: false,
    },

    orderFilters: {
      search: '',
      status: null,
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      sortBy: 'createdAt',
      sortDesc: true,
    },
  }),

  getters: {
    totalProductPages: state => Math.ceil(state.totalProducts / state.productFilters.perPage),
    totalOrderPages: state => Math.ceil(state.totalOrders / state.orderFilters.perPage),
  },

  actions: {
    async fetchProductList() {
      this.isLoading = true
      try {
        const response = await fetchProducts(this.productFilters)

        this.products = response.data
        this.totalProducts = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch products:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchOrderList() {
      this.isLoading = true
      try {
        const response = await fetchOrders(this.orderFilters)

        this.orders = response.data
        this.totalOrders = response.meta?.total || 0
      }
      catch (error) {
        console.error('Failed to fetch orders:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeProduct(id) {
      await deleteProduct(id)
      await this.fetchProductList()
    },

    async removeOrder(id) {
      await deleteOrder(id)
      await this.fetchOrderList()
    },

    updateProductFilters(newFilters) {
      this.productFilters = { ...this.productFilters, ...newFilters, page: 1 }
      this.fetchProductList()
    },

    updateOrderFilters(newFilters) {
      this.orderFilters = { ...this.orderFilters, ...newFilters, page: 1 }
      this.fetchOrderList()
    },
  },
})
