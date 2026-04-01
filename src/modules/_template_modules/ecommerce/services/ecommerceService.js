/**
 * Ecommerce Service
 *
 * Tất cả API calls liên quan đến Ecommerce.
 */
import { API_PRODUCTS, API_ORDERS, API_CUSTOMERS } from '../configs'

// ========== PRODUCTS ==========

export const fetchProducts = params => {
  return $api(API_PRODUCTS, { params })
}

export const fetchProduct = id => {
  return $api(`${API_PRODUCTS}/${id}`)
}

export const createProduct = data => {
  return $api(API_PRODUCTS, { method: 'POST', body: data })
}

export const updateProduct = (id, data) => {
  return $api(`${API_PRODUCTS}/${id}`, { method: 'PUT', body: data })
}

export const deleteProduct = id => {
  return $api(`${API_PRODUCTS}/${id}`, { method: 'DELETE' })
}

// ========== ORDERS ==========

export const fetchOrders = params => {
  return $api(API_ORDERS, { params })
}

export const fetchOrder = id => {
  return $api(`${API_ORDERS}/${id}`)
}

export const updateOrderStatus = (id, status) => {
  return $api(`${API_ORDERS}/${id}/status`, { method: 'PUT', body: { status } })
}

export const deleteOrder = id => {
  return $api(`${API_ORDERS}/${id}`, { method: 'DELETE' })
}

// ========== CUSTOMERS ==========

export const fetchCustomers = params => {
  return $api(API_CUSTOMERS, { params })
}

export const fetchCustomer = id => {
  return $api(`${API_CUSTOMERS}/${id}`)
}

export const createCustomer = data => {
  return $api(API_CUSTOMERS, { method: 'POST', body: data })
}

export const updateCustomer = (id, data) => {
  return $api(`${API_CUSTOMERS}/${id}`, { method: 'PUT', body: data })
}

export const deleteCustomer = id => {
  return $api(`${API_CUSTOMERS}/${id}`, { method: 'DELETE' })
}

// ========== EXPORT ==========

export const exportProducts = params => {
  return $api(`${API_PRODUCTS}/export`, { params, responseType: 'blob' })
}

export const exportOrders = params => {
  return $api(`${API_ORDERS}/export`, { params, responseType: 'blob' })
}
