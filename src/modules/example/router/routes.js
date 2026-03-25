/**
 * Employee Routes
 */
export const routes = [
  {
    path: '/apps/employee/list',
    name: 'apps-employee-list',
    component: () => import('../views/EmployeeListPage.vue'),
  },
  {
    path: '/apps/employee/view/:id',
    name: 'apps-employee-view-id',
    component: () => import('../views/EmployeeViewPage.vue'),
  },
]
