/**
 * Front-Page Service
 */
import { API_BASE } from '../configs'

export const fetchPageData = slug => {
  return $api(`${API_BASE}/${slug}`)
}

export const fetchPricing = () => {
  return $api(`${API_BASE}/pricing`)
}

export const fetchFAQ = () => {
  return $api(`${API_BASE}/faq`)
}

export const submitContactForm = data => {
  return $api(`${API_BASE}/contact`, { method: 'POST', body: data })
}
