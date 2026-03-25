/**
 * useLogistics Composable
 */
import { createFleet, updateFleet } from '../services/logisticsService'
import { blankFleet } from '../models/Fleet'

export function useLogistics() {
  const fleet = ref(structuredClone(blankFleet))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    fleet.value = structuredClone(blankFleet)
    errors.value = {}
  }

  const setFleet = data => {
    fleet.value = structuredClone(data)
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...fleet.value }
      let response

      if (data.id) {
        response = await updateFleet(data.id, data)
      }
      else {
        response = await createFleet(data)
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

  const isEditMode = computed(() => !!fleet.value.id)

  return {
    fleet,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setFleet,
    submitForm,
  }
}
