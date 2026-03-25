/**
 * useEcommerce Composable
 */
import { createProduct, updateProduct } from '../services/ecommerceService'
import { blankProduct } from '../models/Product'

export function useEcommerce() {
  const product = ref(structuredClone(blankProduct))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    product.value = structuredClone(blankProduct)
    errors.value = {}
  }

  const setProduct = data => {
    product.value = structuredClone(data)
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...product.value }
      let response

      if (data.id) {
        response = await updateProduct(data.id, data)
      }
      else {
        response = await createProduct(data)
      }

      resetForm()

      return response
    }
    catch (error) {
      if (error?.response?.status === 422) {
        errors.value = error.response._data?.errors || {}
      }

      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  const isEditMode = computed(() => !!product.value.id)

  return {
    product,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setProduct,
    submitForm,
  }
}
