export const routes = [
  {
    path: '/apps/logistics/dashboard',
    name: 'apps-logistics-dashboard',
    component: () => import('../views/LogisticsDashboardPage.vue'),
    meta: { action: 'read', subject: 'Logistics' },
  },
  {
    path: '/apps/logistics/fleet',
    name: 'apps-logistics-fleet',
    component: () => import('../views/LogisticsFleetPage.vue'),
    meta: { action: 'read', subject: 'Logistics' },
  },

  // Alias: /dashboards/logistics → same component
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('../views/LogisticsDashboardPage.vue'),
    meta: { action: 'read', subject: 'Logistics' },
  },
]
