/**
 * Invoice Model
 */

/**
 * @typedef {Object} InvoiceItem
 * @property {string} description
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} total
 */

/**
 * @typedef {Object} Invoice
 * @property {number|null} id
 * @property {string} invoiceNumber
 * @property {Object} client - { name, email, phone, address }
 * @property {Array<InvoiceItem>} items
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} discount
 * @property {number} total
 * @property {string} status - 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled'
 * @property {string} paymentMethod
 * @property {string|null} dueDate
 * @property {string|null} paidDate
 * @property {string|null} note
 * @property {string} createdAt
 */

export const blankInvoice = {
  id: null,
  invoiceNumber: '',
  client: { name: '', email: '', phone: '', address: '' },
  items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  status: 'draft',
  paymentMethod: 'bank_transfer',
  dueDate: null,
  paidDate: null,
  note: null,
  createdAt: null,
}

export const blankInvoiceItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
}

/**
 * Resolve invoice status color
 * @param {string} status
 * @returns {string}
 */
export const resolveStatusColor = status => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    draft: 'secondary',
    cancelled: 'info',
  }

  return colors[status] || 'primary'
}
