/**
 * Invoice Module Utils
 */

/**
 * Format số hóa đơn (prefix + padding)
 * @param {number} id
 * @returns {string}
 */
export const formatInvoiceNumber = id => {
  if (!id) return '—'

  return `INV-${String(id).padStart(5, '0')}`
}

/**
 * Tính tổng giá trị hóa đơn
 * @param {Array<{quantity: number, unitPrice: number}>} items
 * @returns {number}
 */
export const calculateTotal = items => {
  if (!items?.length) return 0

  return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
}

/**
 * Format tiền VNĐ
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = value => {
  if (!value && value !== 0) return '—'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format ngày đến hạn
 * @param {string} dateString
 * @returns {{ text: string, isOverdue: boolean }}
 */
export const formatDueDate = dateString => {
  if (!dateString) return { text: '—', isOverdue: false }

  const due = new Date(dateString)
  const now = new Date()
  const isOverdue = due < now

  return {
    text: due.toLocaleDateString('vi-VN'),
    isOverdue,
  }
}
