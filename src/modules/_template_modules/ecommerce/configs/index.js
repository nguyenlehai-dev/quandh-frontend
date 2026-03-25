/**
 * Ecommerce Module Config
 */

/** Base API paths */
export const API_PRODUCTS = '/products'
export const API_ORDERS = '/orders'
export const API_CUSTOMERS = '/customers'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Product statuses */
export const PRODUCT_STATUSES = [
  { title: 'Đang bán', value: 'published', color: 'success' },
  { title: 'Bản nháp', value: 'draft', color: 'warning' },
  { title: 'Ngừng bán', value: 'inactive', color: 'error' },
]

/** Order statuses */
export const ORDER_STATUSES = [
  { title: 'Chờ xử lý', value: 'pending', color: 'warning' },
  { title: 'Đang xử lý', value: 'processing', color: 'info' },
  { title: 'Đã giao', value: 'delivered', color: 'success' },
  { title: 'Đã hủy', value: 'cancelled', color: 'error' },
  { title: 'Hoàn trả', value: 'refunded', color: 'secondary' },
]

/** Payment methods */
export const PAYMENT_METHODS = [
  { title: 'Tiền mặt (COD)', value: 'cod' },
  { title: 'Chuyển khoản', value: 'bank_transfer' },
  { title: 'Ví điện tử', value: 'e_wallet' },
  { title: 'Thẻ tín dụng', value: 'credit_card' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW_PRODUCTS: 'product.view',
  CREATE_PRODUCT: 'product.create',
  EDIT_PRODUCT: 'product.edit',
  DELETE_PRODUCT: 'product.delete',
  VIEW_ORDERS: 'order.view',
  MANAGE_ORDERS: 'order.manage',
  VIEW_CUSTOMERS: 'customer.view',
  EXPORT: 'ecommerce.export',
}
