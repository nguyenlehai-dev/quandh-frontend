/**
 * Front-Pages Module Config
 */

/** Base API path */
export const API_BASE = '/front-pages'

/** Sections trên trang chủ */
export const SECTIONS = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'faq',
  'contact',
]

/** Pricing plans */
export const PRICING_PLANS = [
  { title: 'Basic', value: 'basic', price: 0 },
  { title: 'Standard', value: 'standard', price: 49 },
  { title: 'Enterprise', value: 'enterprise', price: 99 },
]

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'front-page.view',
  EDIT: 'front-page.edit',
}
