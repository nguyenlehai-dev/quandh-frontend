export const routes = [
  {
    path: '/system/activity-logs',
    name: 'system-activity-logs',
    component: () => import('../views/ActivityLogListPage.vue'),
    meta: { action: 'read', subject: 'LogActivity' },
  },
]
