/**
 * Logistics Module Config
 */

/** Base API path */
export const API_BASE = '/logistics'

/** Vehicle types */
export const VEHICLE_TYPES = [
  { title: 'Xe tải nhỏ', value: 'small_truck' },
  { title: 'Xe tải lớn', value: 'large_truck' },
  { title: 'Xe container', value: 'container' },
  { title: 'Xe máy', value: 'motorcycle' },
]

/** Shipment statuses */
export const SHIPMENT_STATUSES = [
  { title: 'Chờ lấy hàng', value: 'pickup_pending', color: 'warning' },
  { title: 'Đang vận chuyển', value: 'in_transit', color: 'info' },
  { title: 'Đã giao', value: 'delivered', color: 'success' },
  { title: 'Thất bại', value: 'failed', color: 'error' },
]

/** Fleet statuses */
export const FLEET_STATUSES = [
  { title: 'Sẵn sàng', value: 'available', color: 'success' },
  { title: 'Đang chạy', value: 'on_route', color: 'info' },
  { title: 'Bảo trì', value: 'maintenance', color: 'warning' },
  { title: 'Ngưng hoạt động', value: 'inactive', color: 'error' },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'logistics.view',
  MANAGE_FLEET: 'logistics.fleet',
  MANAGE_SHIPMENTS: 'logistics.shipments',
}
