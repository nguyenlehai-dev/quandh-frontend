export const routes = [
  {
    path: '/apps/academy/dashboard',
    name: 'apps-academy-dashboard',
    component: () => import('../views/AcademyDashboardPage.vue'),
    meta: { action: 'read', subject: 'Academy' },
  },
  {
    path: '/apps/academy/my-course',
    name: 'apps-academy-my-course',
    component: () => import('../views/AcademyMyCoursePage.vue'),
    meta: { action: 'read', subject: 'Academy' },
  },
  {
    path: '/apps/academy/course-details',
    name: 'apps-academy-course-details',
    component: () => import('../views/AcademyCourseDetailsPage.vue'),
    meta: { action: 'read', subject: 'Academy' },
  },
  // Alias: /dashboards/academy
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('../views/AcademyDashboardPage.vue'),
    meta: { action: 'read', subject: 'Academy' },
  },
]
