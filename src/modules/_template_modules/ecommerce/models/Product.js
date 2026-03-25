/**
 * Ecommerce Models
 *
 * Định nghĩa cấu trúc dữ liệu cho Product, Order, Customer.
 */

// ========== PRODUCT ==========

/**
 * @typedef {Object} Product
 * @property {number|null} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price
 * @property {number|null} salePrice
 * @property {string} sku
 * @property {number} stock
 * @property {number|null} categoryId
 * @property {string} status - 'published' | 'draft' | 'inactive'
 * @property {Array<string>} images
 */

export const blankProduct = {
  id: null,
  name: '',
  slug: '',
  description: '',
  price: 0,
  salePrice: null,
  sku: '',
  stock: 0,
  categoryId: null,
  status: 'draft',
  images: [],
}

// ========== ORDER ==========

/**
 * @typedef {Object} Order
 * @property {number|null} id
 * @property {string} orderNumber
 * @property {number} customerId
 * @property {Array<Object>} items
 * @property {number} total
 * @property {string} status - 'pending' | 'processing' | 'delivered' | 'cancelled' | 'refunded'
 * @property {string} paymentMethod
 * @property {string|null} note
 * @property {string} createdAt
 */

export const blankOrder = {
  id: null,
  orderNumber: '',
  customerId: null,
  items: [],
  total: 0,
  status: 'pending',
  paymentMethod: 'cod',
  note: null,
  createdAt: null,
}

// ========== CUSTOMER ==========

/**
 * @typedef {Object} Customer
 * @property {number|null} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string|null} address
 * @property {number} totalOrders
 * @property {number} totalSpent
 * @property {string} status - 'active' | 'inactive'
 */

export const blankCustomer = {
  id: null,
  fullName: '',
  email: '',
  phone: '',
  address: null,
  totalOrders: 0,
  totalSpent: 0,
  status: 'active',
}

// ========== HELPERS ==========

/**
 * Resolve order status color
 * @param {string} status
 * @returns {string}
 */
export const resolveOrderStatusColor = status => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'secondary',
  }

  return colors[status] || 'primary'
}

/**
 * Resolve product status color
 * @param {string} status
 * @returns {string}
 */
export const resolveProductStatusColor = status => {
  const colors = {
    published: 'success',
    draft: 'warning',
    inactive: 'error',
  }

  return colors[status] || 'secondary'
}
