/**
 * useFrontPage Composable
 */
export function useFrontPage() {
  const pageData = ref(null)
  const isLoading = ref(false)

  const loadPage = async slug => {
    isLoading.value = true
    try {
      const { fetchPageData } = await import('../services/frontPageService')

      pageData.value = await fetchPageData(slug)
    }
    catch (error) {
      console.error('Failed to load page:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    pageData,
    isLoading,
    loadPage,
  }
}
