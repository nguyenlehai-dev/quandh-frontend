export const routes = [
  {
    path: '/system/organizations',
    name: 'system-organizations',
    component: () => import('../views/OrganizationListPage.vue'),
    meta: { action: 'read', subject: 'Organization' },
  },
]
