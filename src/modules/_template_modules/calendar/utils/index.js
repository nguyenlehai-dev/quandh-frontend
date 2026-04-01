/**
 * Calendar Module Utils
 */

/**
 * Format ngày event sang dạng đọc được
 * @param {string} dateString
 * @returns {string}
 */
export const formatEventDate = dateString => {
  if (!dateString) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

/**
 * Lấy color class cho event type
 * @param {string} type
 * @returns {string}
 */
export const getEventColor = type => {
  const colors = {
    Business: 'primary',
    Holiday: 'success',
    Personal: 'error',
    Family: 'warning',
    ETC: 'info',
  }

  return colors[type] || 'primary'
}

/**
 * Tính khoảng cách thời gian giữa 2 ngày
 * @param {string} start
 * @param {string} end
 * @returns {string}
 */
export const getEventDuration = (start, end) => {
  if (!start || !end) return '—'

  const diff = new Date(end) - new Date(start)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`

  return `${hours}h ${minutes}m`
}
