/**
 * Widget Model
 *
 * Định nghĩa cấu trúc dữ liệu widget cho Dashboard.
 */

/**
 * @typedef {Object} Widget
 * @property {string} type - 'stat_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table'
 * @property {string} title
 * @property {string|number} value
 * @property {number|null} change - Phần trăm thay đổi
 * @property {string} icon
 * @property {string} color
 * @property {Array|null} chartData
 */

/** Widget stat card mặc định */
export const blankStatWidget = {
  type: 'stat_card',
  title: '',
  value: 0,
  change: null,
  icon: 'tabler-chart-bar',
  color: 'primary',
  chartData: null,
}

/**
 * Resolve change color (tăng = success, giảm = error)
 * @param {number} change
 * @returns {string}
 */
export const resolveChangeColor = change => {
  if (change > 0) return 'success'
  if (change < 0) return 'error'

  return 'secondary'
}

/**
 * Resolve change icon
 * @param {number} change
 * @returns {string}
 */
export const resolveChangeIcon = change => {
  if (change > 0) return 'tabler-trending-up'
  if (change < 0) return 'tabler-trending-down'

  return 'tabler-minus'
}
