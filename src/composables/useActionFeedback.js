import { ref } from 'vue'

export const extractApiErrorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  const data = error?.data ?? error?.response?._data ?? error?.response?.data

  if (data?.errors) {
    const messages = Object.values(data.errors)
      .flat()
      .filter(Boolean)

    if (messages.length)
      return messages.join('\n')
  }

  return data?.message || error?.message || fallback
}

export const useActionFeedback = () => {
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
  })

  const showSnackbar = (message, color = 'success') => {
    snackbar.value = {
      show: true,
      message,
      color,
    }
  }

  const showSuccess = (message = 'Thao tác thành công.') => {
    showSnackbar(message, 'success')
  }

  const showError = (error, fallback) => {
    showSnackbar(extractApiErrorMessage(error, fallback), 'error')
  }

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
  }
}
