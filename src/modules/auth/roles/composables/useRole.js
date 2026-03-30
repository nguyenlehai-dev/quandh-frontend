/**
 * useRole Composable
 */
import { createRole, updateRole } from '../services/roleService'
import { blankRole } from '../models/Role'

export function useRole() {
  const role = ref(structuredClone(blankRole))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    role.value = structuredClone(blankRole)
    errors.value = {}
  }

  const setRole = data => {
    role.value = structuredClone(data)
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...role.value }
      let response

      if (data.id) {
        response = await updateRole(data.id, data)
      }
      else {
        response = await createRole(data)
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

  const isEditMode = computed(() => !!role.value.id)

  return {
    role,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setRole,
    submitForm,
  }
}
