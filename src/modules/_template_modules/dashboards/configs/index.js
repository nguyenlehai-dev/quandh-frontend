/**
 * Dashboards Module Config
 */

/** Base API path */
export const API_BASE = '/dashboards'

/** Widget types */
export const WIDGET_TYPES = {
  STAT_CARD: 'stat_card',
  LINE_CHART: 'line_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  TABLE: 'table',
}

/** Chart color palette */
export const CHART_COLORS = {
  primary: '#7367F0',
  success: '#28C76F',
  danger: '#EA5455',
  warning: '#FF9F43',
  info: '#00CFE8',
  secondary: '#82868B',
}

/** Dashboard types */
export const DASHBOARD_TYPES = ['analytics', 'crm', 'ecommerce']

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'dashboard.view',
  CUSTOMIZE: 'dashboard.customize',
}
