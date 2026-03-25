/**
 * useUser Composable
 */
import { createUser, updateUser } from '../services/userService'
import { blankUser } from '../models/User'

export function useUser() {
  const user = ref(structuredClone(blankUser))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    user.value = structuredClone(blankUser)
    errors.value = {}
  }

  const setUser = data => {
    user.value = structuredClone(data)
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...user.value }
      let response

      if (data.id) {
        response = await updateUser(data.id, data)
      }
      else {
        response = await createUser(data)
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

  const isEditMode = computed(() => !!user.value.id)

  return {
    user,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setUser,
    submitForm,
  }
}
