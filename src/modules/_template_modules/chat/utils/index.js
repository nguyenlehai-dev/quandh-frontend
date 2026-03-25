/**
 * Chat Module Utils
 */

/**
 * Format thời gian tin nhắn
 * @param {string} dateString
 * @returns {string}
 */
export const formatMessageTime = dateString => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  // Dưới 1 phút
  if (diff < 60000) return 'Vừa xong'

  // Dưới 1 giờ
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m trước`

  // Cùng ngày
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  // Hôm qua
  const yesterday = new Date(now)

  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua'

  // Khác
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/**
 * Rút gọn tin nhắn dài
 * @param {string} message
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateMessage = (message, maxLength = 50) => {
  if (!message) return ''
  if (message.length <= maxLength) return message

  return `${message.substring(0, maxLength)}...`
}
