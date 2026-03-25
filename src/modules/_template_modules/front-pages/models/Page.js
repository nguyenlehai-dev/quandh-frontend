/**
 * Page Model
 */

/**
 * @typedef {Object} Page
 * @property {number|null} id
 * @property {string} title
 * @property {string} slug
 * @property {string} content
 * @property {string} status - 'published' | 'draft'
 * @property {Object|null} meta - SEO meta data
 */

export const blankPage = {
  id: null,
  title: '',
  slug: '',
  content: '',
  status: 'draft',
  meta: null,
}
