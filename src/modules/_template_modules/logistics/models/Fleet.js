/**
 * Logistics Models — Fleet & Shipment
 */

/**
 * @typedef {Object} Fleet
 * @property {number|null} id
 * @property {string} vehicleNumber
 * @property {string} vehicleType
 * @property {string} driver
 * @property {string} status - 'available' | 'on_route' | 'maintenance' | 'inactive'
 * @property {string|null} location
 * @property {number} capacity
 */

export const blankFleet = {
  id: null,
  vehicleNumber: '',
  vehicleType: 'small_truck',
  driver: '',
  status: 'available',
  location: null,
  capacity: 0,
}

/**
 * @typedef {Object} Shipment
 * @property {number|null} id
 * @property {string} trackingNumber
 * @property {string} origin
 * @property {string} destination
 * @property {string} status
 * @property {number|null} fleetId
 * @property {string|null} estimatedDelivery
 * @property {number} weight
 */

export const blankShipment = {
  id: null,
  trackingNumber: '',
  origin: '',
  destination: '',
  status: 'pickup_pending',
  fleetId: null,
  estimatedDelivery: null,
  weight: 0,
}

export const resolveShipmentStatusColor = status => {
  const colors = {
    pickup_pending: 'warning',
    in_transit: 'info',
    delivered: 'success',
    failed: 'error',
  }

  return colors[status] || 'secondary'
}

export const resolveFleetStatusColor = status => {
  const colors = {
    available: 'success',
    on_route: 'info',
    maintenance: 'warning',
    inactive: 'error',
  }

  return colors[status] || 'secondary'
}
