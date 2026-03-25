export const routes = [
  {
    path: '/dashboards/analytics',
    name: 'dashboards-analytics',
    component: () => import('../views/AnalyticsDashboardPage.vue'),
  },
  {
    path: '/dashboards/crm',
    name: 'dashboards-crm',
    component: () => import('../views/CrmDashboardPage.vue'),
  },
  {
    path: '/dashboards/ecommerce',
    name: 'dashboards-ecommerce',
    component: () => import('../views/EcommerceDashboardPage.vue'),
  },
]
