/**
 * Academy Module Utils
 *
 * Các hàm tiện ích dùng riêng trong module Academy.
 */

/**
 * Format thời lượng từ phút sang dạng "Xh Ym"
 * @param {number} minutes
 * @returns {string}
 */
export const formatDuration = minutes => {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`

  return `${h}h ${m}m`
}

/**
 * Format tiến độ học (%) sang text
 * @param {number} progress - 0 đến 100
 * @returns {string}
 */
export const formatProgress = progress => {
  if (progress == null) return '0%'

  return `${Math.round(progress)}%`
}

/**
 * Format số học viên sang dạng rút gọn
 * @param {number} count
 * @returns {string}
 */
export const formatStudentCount = count => {
  if (!count) return '0'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`

  return count.toString()
}
