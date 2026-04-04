export const buildAuthQueryString = params => {
  const searchParams = new URLSearchParams()

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value == null || value === '')
      return

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item == null || item === '')
          return

        searchParams.append(`${key}[]`, String(item))
      })

      return
    }

    searchParams.append(key, String(value))
  })

  return searchParams.toString()
}
