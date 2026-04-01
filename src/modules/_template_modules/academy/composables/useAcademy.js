/**
 * useAcademy Composable
 *
 * Logic tái sử dụng cho Academy module.
 */
import { createCourse, updateCourse } from '../services/academyService'
import { blankCourse } from '../models/Course'

export function useAcademy() {
  /** Form data (reactive) */
  const course = ref(structuredClone(blankCourse))

  /** Loading state cho form submit */
  const isSubmitting = ref(false)

  /** Errors từ server */
  const errors = ref({})

  /**
   * Reset form về trạng thái mặc định
   */
  const resetForm = () => {
    course.value = structuredClone(blankCourse)
    errors.value = {}
  }

  /**
   * Set form data (dùng khi edit)
   * @param {import('../models/Course').Course} data
   */
  const setCourse = data => {
    course.value = structuredClone(data)
  }

  /**
   * Submit form — tự phân biệt create / update dựa vào id
   * @returns {Promise<Object>} Response từ API
   */
  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...course.value }
      let response

      if (data.id) {
        response = await updateCourse(data.id, data)
      }
      else {
        response = await createCourse(data)
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

  /**
   * Kiểm tra mode hiện tại
   */
  const isEditMode = computed(() => !!course.value.id)

  return {
    course,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setCourse,
    submitForm,
  }
}
