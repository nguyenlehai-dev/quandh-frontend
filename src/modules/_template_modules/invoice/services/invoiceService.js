/**
 * Invoice Service
 */
import { API_BASE } from '../configs'

export const fetchInvoices = params => {
  return $api(API_BASE, { params })
}

export const fetchInvoice = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createInvoice = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateInvoice = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteInvoice = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const exportInvoices = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}

export const downloadInvoicePdf = id => {
  return $api(`${API_BASE}/${id}/pdf`, { responseType: 'blob' })
}
