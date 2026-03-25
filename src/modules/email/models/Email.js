/**
 * Email Model
 */

/**
 * @typedef {Object} Email
 * @property {number|null} id
 * @property {string} from
 * @property {string} to
 * @property {string} subject
 * @property {string} body
 * @property {boolean} isRead
 * @property {boolean} isStarred
 * @property {string} folder - 'inbox' | 'sent' | 'draft' | 'spam' | 'trash'
 * @property {Array<string>} labels
 * @property {Array<Object>} attachments
 * @property {string} createdAt
 */

export const blankEmail = {
  id: null,
  from: '',
  to: '',
  subject: '',
  body: '',
  isRead: false,
  isStarred: false,
  folder: 'inbox',
  labels: [],
  attachments: [],
  createdAt: null,
}

/**
 * Resolve label color
 * @param {string} label
 * @returns {string}
 */
export const resolveLabelColor = label => {
  const colors = {
    personal: 'success',
    company: 'primary',
    important: 'warning',
    private: 'error',
  }

  return colors[label] || 'secondary'
}
