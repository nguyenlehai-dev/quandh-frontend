/**
 * Kanban Module Utils
 */

/**
 * Sắp xếp cards theo order
 * @param {Array} cards
 * @returns {Array}
 */
export const sortByOrder = cards => {
  return [...cards].sort((a, b) => a.order - b.order)
}

/**
 * Format due date cho card
 * @param {string} dateString
 * @returns {{ text: string, isOverdue: boolean }}
 */
export const formatDueDate = dateString => {
  if (!dateString) return { text: '', isOverdue: false }

  const due = new Date(dateString)
  const now = new Date()

  return {
    text: due.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }),
    isOverdue: due < now,
  }
}
