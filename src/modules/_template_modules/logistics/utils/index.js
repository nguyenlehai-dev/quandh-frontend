/**
 * Logistics Module Utils
 */

/**
 * Format khoảng cách (km)
 * @param {number} meters
 * @returns {string}
 */
export const formatDistance = meters => {
  if (!meters) return '—'

  const km = meters / 1000

  return km >= 1 ? `${km.toFixed(1)} km` : `${meters} m`
}

/**
 * Format thời gian dự kiến (ETA)
 * @param {string} dateString
 * @returns {string}
 */
export const formatETA = dateString => {
  if (!dateString) return '—'

  const eta = new Date(dateString)
  const now = new Date()
  const diff = eta - now

  if (diff <= 0) return 'Đã đến'

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (hours > 24) return `${Math.floor(hours / 24)} ngày`
  if (hours > 0) return `${hours}h ${minutes}m`

  return `${minutes} phút`
}

/**
 * Format trọng lượng
 * @param {number} kg
 * @returns {string}
 */
export const formatWeight = kg => {
  if (!kg) return '—'

  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} tấn` : `${kg} kg`
}
