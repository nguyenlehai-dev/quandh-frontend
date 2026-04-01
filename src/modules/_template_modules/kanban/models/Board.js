/**
 * Kanban Board Model
 */

/**
 * @typedef {Object} KanbanCard
 * @property {number|null} id
 * @property {string} title
 * @property {string|null} description
 * @property {string} priority - 'low' | 'medium' | 'high'
 * @property {Array<string>} labels
 * @property {Array<Object>} members
 * @property {string|null} dueDate
 * @property {number} order
 */

/**
 * @typedef {Object} KanbanColumn
 * @property {number|null} id
 * @property {string} title
 * @property {string} value
 * @property {string} color
 * @property {Array<KanbanCard>} cards
 */

export const blankCard = {
  id: null,
  title: '',
  description: null,
  priority: 'medium',
  labels: [],
  members: [],
  dueDate: null,
  order: 0,
}

export const blankColumn = {
  id: null,
  title: '',
  value: '',
  color: 'info',
  cards: [],
}

export const resolvePriorityColor = priority => {
  const colors = { low: 'info', medium: 'warning', high: 'error' }

  return colors[priority] || 'secondary'
}
