export const routes = [
  {
    path: '/apps/kanban',
    name: 'apps-kanban',
    component: () => import('../views/KanbanPage.vue'),
    meta: { action: 'read', subject: 'Kanban' },
  },
]
