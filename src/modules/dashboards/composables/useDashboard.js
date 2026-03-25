/**
 * useDashboard Composable
 *
 * Logic tái sử dụng cho Dashboard module.
 */
import { fetchAnalyticsData, fetchCrmData, fetchEcommerceData } from '../services/dashboardService'

export function useDashboard() {
  /** Dashboard data */
  const analyticsData = ref(null)
  const crmData = ref(null)
  const ecommerceData = ref(null)

  /** Loading state */
  const isLoading = ref(false)

  /**
   * Load analytics dashboard data
   */
  const loadAnalytics = async () => {
    isLoading.value = true
    try {
      analyticsData.value = await fetchAnalyticsData()
    }
    catch (error) {
      console.error('Failed to load analytics:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Load CRM dashboard data
   */
  const loadCrm = async () => {
    isLoading.value = true
    try {
      crmData.value = await fetchCrmData()
    }
    catch (error) {
      console.error('Failed to load CRM data:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Load ecommerce dashboard data
   */
  const loadEcommerce = async () => {
    isLoading.value = true
    try {
      ecommerceData.value = await fetchEcommerceData()
    }
    catch (error) {
      console.error('Failed to load ecommerce data:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    analyticsData,
    crmData,
    ecommerceData,
    isLoading,
    loadAnalytics,
    loadCrm,
    loadEcommerce,
  }
}
