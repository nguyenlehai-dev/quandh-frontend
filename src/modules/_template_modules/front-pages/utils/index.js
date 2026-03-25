/**
 * Front-Pages Module Utils
 */

/**
 * Format giá pricing plan
 * @param {number} price
 * @returns {string}
 */
export const formatPlanPrice = price => {
  if (!price) return 'Free'

  return `$${price}/mo`
}

/**
 * Tạo slug từ title
 * @param {string} title
 * @returns {string}
 */
export const slugify = title => {
  if (!title) return ''

  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
