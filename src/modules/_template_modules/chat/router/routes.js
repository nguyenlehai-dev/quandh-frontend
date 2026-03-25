export const routes = [
  {
    path: '/apps/chat',
    name: 'apps-chat',
    component: () => import('../views/ChatPage.vue'),
    meta: {
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'Chat',
    },
  },
]
