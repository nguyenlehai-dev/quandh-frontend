/**
 * Invoice Module Config
 */

/** Base API path */
export const API_BASE = '/invoices'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Invoice statuses */
export const INVOICE_STATUSES = [
  { title: 'Đã thanh toán', value: 'paid', color: 'success' },
  { title: 'Chờ thanh toán', value: 'pending', color: 'warning' },
  { title: 'Quá hạn', value: 'overdue', color: 'error' },
  { title: 'Bản nháp', value: 'draft', color: 'secondary' },
  { title: 'Đã hủy', value: 'cancelled', color: 'info' },
]

/** Payment methods */
export const PAYMENT_METHODS = [
  { title: 'Chuyển khoản', value: 'bank_transfer' },
  { title: 'Tiền mặt', value: 'cash' },
  { title: 'Thẻ tín dụng', value: 'credit_card' },
  { title: 'Ví điện tử', value: 'e_wallet' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'invoice.view',
  CREATE: 'invoice.create',
  EDIT: 'invoice.edit',
  DELETE: 'invoice.delete',
  EXPORT: 'invoice.export',
}
