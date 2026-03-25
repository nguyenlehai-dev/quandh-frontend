export const routes = [
  {
    path: '/apps/permissions',
    name: 'apps-permissions',
    component: () => import('../views/PermissionsPage.vue'),
    meta: { action: 'read', subject: 'Permission' },
  },
]
