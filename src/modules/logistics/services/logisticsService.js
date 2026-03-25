/**
 * Logistics Service
 */
import { API_BASE } from '../configs'

// Fleet
export const fetchFleets = params => {
  return $api(`${API_BASE}/fleet`, { params })
}

export const fetchFleet = id => {
  return $api(`${API_BASE}/fleet/${id}`)
}

export const createFleet = data => {
  return $api(`${API_BASE}/fleet`, { method: 'POST', body: data })
}

export const updateFleet = (id, data) => {
  return $api(`${API_BASE}/fleet/${id}`, { method: 'PUT', body: data })
}

export const deleteFleet = id => {
  return $api(`${API_BASE}/fleet/${id}`, { method: 'DELETE' })
}

// Shipments
export const fetchShipments = params => {
  return $api(`${API_BASE}/shipments`, { params })
}

export const fetchShipment = id => {
  return $api(`${API_BASE}/shipments/${id}`)
}

export const createShipment = data => {
  return $api(`${API_BASE}/shipments`, { method: 'POST', body: data })
}

export const updateShipmentStatus = (id, status) => {
  return $api(`${API_BASE}/shipments/${id}/status`, { method: 'PUT', body: { status } })
}
