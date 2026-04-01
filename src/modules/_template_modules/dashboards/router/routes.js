export const routes = [
  {
    path: '/dashboards/analytics',
    name: 'dashboards-analytics',
    component: () => import('../views/AnalyticsDashboardPage.vue'),
    meta: { action: 'read', subject: 'Dashboard' },
  },
  {
    path: '/dashboards/crm',
    name: 'dashboards-crm',
    component: () => import('../views/CrmDashboardPage.vue'),
    meta: { action: 'read', subject: 'Dashboard' },
  },
  {
    path: '/dashboards/ecommerce',
    name: 'dashboards-ecommerce',
    component: () => import('../views/EcommerceDashboardPage.vue'),
    meta: { action: 'read', subject: 'Dashboard' },
  },
]
