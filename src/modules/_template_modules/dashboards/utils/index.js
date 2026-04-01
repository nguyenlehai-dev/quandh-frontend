/**
 * Dashboards Module Utils
 */

/**
 * Format số tiền sang VNĐ
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = value => {
  if (!value && value !== 0) return '—'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format phần trăm
 * @param {number} value
 * @returns {string}
 */
export const formatPercentage = value => {
  if (value == null) return '0%'

  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format số lớn sang dạng rút gọn (1.2k, 3.5M)
 * @param {number} value
 * @returns {string}
 */
export const formatCompactNumber = value => {
  if (!value) return '0'

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Tạo chart data từ array
 * @param {Array<number>} data
 * @param {Array<string>} labels
 * @returns {Object}
 */
export const formatChartData = (data, labels) => {
  return {
    labels: labels || data.map((_, i) => `${i + 1}`),
    datasets: [{ data }],
  }
}
