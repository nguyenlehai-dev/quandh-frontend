export const routes = [
  {
    path: '/profile',
    name: 'user-profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { action: 'read', subject: 'Auth' },
  },
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
  {
    path: '/apps/user/edit/:id',
    name: 'apps-user-edit-id',
    component: () => import('../views/UserEditPage.vue'),
    meta: { action: 'read', subject: 'Auth' },
  },
]
