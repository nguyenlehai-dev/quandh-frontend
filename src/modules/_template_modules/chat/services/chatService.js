/**
 * Chat Service
 *
 * Tất cả API calls liên quan đến Chat.
 */
import { API_BASE } from '../configs'

/**
 * Lấy danh sách chat contacts & conversations
 */
export const fetchChats = () => {
  return $api(`${API_BASE}/chats-and-contacts`)
}

/**
 * Lấy tin nhắn của 1 chat
 * @param {number} chatId
 */
export const fetchMessages = chatId => {
  return $api(`${API_BASE}/${chatId}`)
}

/**
 * Gửi tin nhắn
 * @param {number} chatId
 * @param {Object} data - { content, type, attachment }
 */
export const sendMessage = (chatId, data) => {
  return $api(`${API_BASE}/${chatId}/messages`, {
    method: 'POST',
    body: data,
  })
}

/**
 * Đánh dấu đã đọc
 * @param {number} chatId
 */
export const markAsRead = chatId => {
  return $api(`${API_BASE}/${chatId}/read`, {
    method: 'POST',
  })
}

/**
 * Xóa tin nhắn
 * @param {number} chatId
 * @param {number} messageId
 */
export const deleteMessage = (chatId, messageId) => {
  return $api(`${API_BASE}/${chatId}/messages/${messageId}`, {
    method: 'DELETE',
  })
}
