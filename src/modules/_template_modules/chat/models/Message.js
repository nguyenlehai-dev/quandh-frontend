/**
 * Message Model
 *
 * Định nghĩa cấu trúc dữ liệu của Chat Message.
 */

/**
 * @typedef {Object} Message
 * @property {number|null} id
 * @property {string} content
 * @property {number} senderId
 * @property {number} chatId
 * @property {string} type - 'text' | 'image' | 'file' | 'audio'
 * @property {string} status - 'sent' | 'delivered' | 'read'
 * @property {string} createdAt
 * @property {Object|null} attachment
 */

/**
 * @typedef {Object} Chat
 * @property {number|null} id
 * @property {Object} contact - Thông tin liên hệ
 * @property {Array<Message>} messages
 * @property {string|null} lastMessage
 * @property {number} unseenMsgs
 */

/** Message mặc định khi tạo mới */
export const blankMessage = {
  id: null,
  content: '',
  senderId: null,
  chatId: null,
  type: 'text',
  status: 'sent',
  createdAt: null,
  attachment: null,
}

/**
 * Resolve message status icon
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusIcon = status => {
  const icons = {
    sent: 'tabler-check',
    delivered: 'tabler-checks',
    read: 'tabler-checks',
  }

  return icons[status] || 'tabler-check'
}
