export const useOperationSnackbar = () => {
  const storageKey = 'app-operation-snackbar'
  const isSnackbarVisible = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')

  const showSnackbar = (message, color = 'success') => {
    snackbarText.value = message
    snackbarColor.value = color
    isSnackbarVisible.value = true
  }

  const queueSnackbar = (message, color = 'success') => {
    if (typeof window === 'undefined')
      return

    window.sessionStorage.setItem(storageKey, JSON.stringify({ message, color }))
  }

  const hydratePendingSnackbar = () => {
    if (typeof window === 'undefined')
      return

    const rawValue = window.sessionStorage.getItem(storageKey)

    if (!rawValue)
      return

    window.sessionStorage.removeItem(storageKey)

    try {
      const payload = JSON.parse(rawValue)

      if (payload?.message)
        showSnackbar(payload.message, payload.color)
    }
    catch {
      // Ignore malformed flash notification payloads.
    }
  }

  return {
    hydratePendingSnackbar,
    isSnackbarVisible,
    queueSnackbar,
    snackbarColor,
    snackbarText,
    showSnackbar,
  }
}
