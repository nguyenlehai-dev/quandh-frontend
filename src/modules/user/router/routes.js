export const routes = [
  {
    path: '/apps/user/list',
    name: 'apps-user-list',
    component: () => import('../views/UserListPage.vue'),
    meta: { action: 'read', subject: 'User' },
  },
  {
    path: '/apps/user/view/:id',
    name: 'apps-user-view-id',
    component: () => import('../views/UserViewPage.vue'),
    meta: { action: 'read', subject: 'User' },
  },
]
