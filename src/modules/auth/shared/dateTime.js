const MYSQL_DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/

const pad = value => `${value}`.padStart(2, '0')

export const parseAuthDateTime = value => {
  if (!value)
    return null

  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value

  if (typeof value !== 'string') {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
  }

  const trimmedValue = value.trim()
  if (!trimmedValue)
    return null

  const normalizedValue = trimmedValue.replace(MYSQL_DATE_TIME_PATTERN, (_, datePart, timePart, fractionalPart = '') => {
    const milliseconds = fractionalPart ? fractionalPart.slice(0, 4) : ''

    return `${datePart}T${timePart}${milliseconds}`
  })

  const parsedDate = new Date(normalizedValue)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export const formatAuthDateTime = (value, options = {}) => {
  const {
    fallback = 'N/A',
    includeSeconds = false,
  } = options

  if (!value)
    return fallback

  const parsedDate = parseAuthDateTime(value)
  if (!parsedDate)
    return typeof value === 'string' ? value : fallback

  const hours = pad(parsedDate.getHours())
  const minutes = pad(parsedDate.getMinutes())
  const seconds = pad(parsedDate.getSeconds())
  const day = pad(parsedDate.getDate())
  const month = pad(parsedDate.getMonth() + 1)
  const year = parsedDate.getFullYear()
  const timeLabel = includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`

  return `${timeLabel} ${day}/${month}/${year}`
}
