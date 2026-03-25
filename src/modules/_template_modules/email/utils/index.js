/**
 * Email Module Utils
 */

/**
 * Format ngày email
 * @param {string} dateString
 * @returns {string}
 */
export const formatEmailDate = dateString => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })
}

/**
 * Rút gọn subject email
 * @param {string} subject
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateSubject = (subject, maxLength = 60) => {
  if (!subject) return '(No subject)'
  if (subject.length <= maxLength) return subject

  return `${subject.substring(0, maxLength)}...`
}

/**
 * Format dung lượng attachment
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = bytes => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }

  return `${bytes.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
