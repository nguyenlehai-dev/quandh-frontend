export const routes = [
  {
    path: '/apps/roles',
    name: 'apps-roles',
    component: () => import('../views/RolesPage.vue'),
    meta: { action: 'read', subject: 'Role' },
  },
]
