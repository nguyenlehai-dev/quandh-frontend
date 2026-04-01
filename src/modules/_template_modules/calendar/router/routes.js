export const routes = [
  {
    path: '/apps/calendar',
    name: 'apps-calendar',
    component: () => import('../views/CalendarPage.vue'),
    meta: { action: 'read', subject: 'Calendar' },
  },
]
