/**
 * Ecommerce Module Utils
 */

/**
 * Format giá tiền VNĐ
 * @param {number} value
 * @returns {string}
 */
export const formatPrice = value => {
  if (!value && value !== 0) return '—'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Tính phần trăm giảm giá
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {string}
 */
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return ''

  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)

  return `-${discount}%`
}

/**
 * Format trạng thái đơn hàng sang tiếng Việt
 * @param {string} status
 * @returns {string}
 */
export const formatOrderStatus = status => {
  const labels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    refunded: 'Hoàn trả',
  }

  return labels[status] || status
}

/**
 * Format số lượng tồn kho
 * @param {number} stock
 * @returns {{ text: string, color: string }}
 */
export const formatStock = stock => {
  if (stock <= 0) return { text: 'Hết hàng', color: 'error' }
  if (stock <= 10) return { text: `Còn ${stock}`, color: 'warning' }

  return { text: `Còn ${stock}`, color: 'success' }
}
