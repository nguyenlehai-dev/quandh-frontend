/**
 * usePermission Composable
 */
import { createPermission, updatePermission } from '../services/permissionService'
import { blankPermission } from '../models/Permission'

export function usePermission() {
  const permission = ref(structuredClone(blankPermission))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    permission.value = structuredClone(blankPermission)
    errors.value = {}
  }

  const setPermission = data => {
    permission.value = structuredClone(data)
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...permission.value }
      let response

      if (data.id) {
        response = await updatePermission(data.id, data)
      }
      else {
        response = await createPermission(data)
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

  const isEditMode = computed(() => !!permission.value.id)

  return {
    permission,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setPermission,
    submitForm,
  }
}
