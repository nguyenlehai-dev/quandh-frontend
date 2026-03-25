export const routes = [
  {
    path: '/apps/logistics/dashboard',
    name: 'apps-logistics-dashboard',
    component: () => import('../views/LogisticsDashboardPage.vue'),
  },
  {
    path: '/apps/logistics/fleet',
    name: 'apps-logistics-fleet',
    component: () => import('../views/LogisticsFleetPage.vue'),
  },
  // Alias: /dashboards/logistics → same component
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('../views/LogisticsDashboardPage.vue'),
  },
]
