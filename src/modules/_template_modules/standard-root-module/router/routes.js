export const routes = [
  {
    path: '/standard-root-module',
    name: 'standard-root-module-list',
    component: () => import('../views/StandardRootModuleListPage.vue'),
    meta: {
      action: 'read',
      subject: 'StandardRootModule',
    },
  },
]
