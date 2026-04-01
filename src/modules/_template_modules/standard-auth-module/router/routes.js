export const routes = [
  {
    path: '/standard-auth-module',
    name: 'standard-auth-module-list',
    component: () => import('../views/StandardAuthModuleListPage.vue'),
    meta: {
      action: 'read',
      subject: 'StandardAuthModule',
    },
  },
]
