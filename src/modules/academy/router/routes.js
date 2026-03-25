export const routes = [
  {
    path: '/apps/academy/dashboard',
    name: 'apps-academy-dashboard',
    component: () => import('../views/AcademyDashboardPage.vue'),
  },
  {
    path: '/apps/academy/my-course',
    name: 'apps-academy-my-course',
    component: () => import('../views/AcademyMyCoursePage.vue'),
  },
  {
    path: '/apps/academy/course-details',
    name: 'apps-academy-course-details',
    component: () => import('../views/AcademyCourseDetailsPage.vue'),
  },
  // Alias: /dashboards/academy → same component
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('../views/AcademyDashboardPage.vue'),
  },
]
