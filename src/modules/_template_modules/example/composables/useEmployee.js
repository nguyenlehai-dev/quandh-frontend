/**
 * useEmployee Composable
 *
 * Logic tái sử dụng cho Employee module.
 * Dùng trong components để handle form, validation, CRUD actions.
 */
import { createEmployee, updateEmployee } from '../services/employeeService'
import { blankEmployee } from '../models/Employee'

export function useEmployee() {
  /** Form data (reactive) */
  const employee = ref(structuredClone(blankEmployee))

  /** Loading state cho form submit */
  const isSubmitting = ref(false)

  /** Errors từ server */
  const errors = ref({})

  /**
   * Reset form về trạng thái mặc định
   */
  const resetForm = () => {
    employee.value = structuredClone(blankEmployee)
    errors.value = {}
  }

  /**
   * Set form data (dùng khi edit)
   * @param {import('../models/Employee').Employee} data
   */
  const setEmployee = data => {
    employee.value = structuredClone(data)
  }

  /**
   * Submit form — tự phân biệt create / update dựa vào id
   * @returns {Promise<Object>} Response từ API
   */
  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...employee.value }
      let response

      if (data.id) {
        response = await updateEmployee(data.id, data)
      }
      else {
        response = await createEmployee(data)
      }

      resetForm()

      return response
    }
    catch (error) {
      // Laravel validation errors
      if (error?.response?.status === 422) {
        errors.value = error.response._data?.errors || {}
      }

      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  /**
   * Kiểm tra mode hiện tại
   */
  const isEditMode = computed(() => !!employee.value.id)

  return {
    employee,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setEmployee,
    submitForm,
  }
}
