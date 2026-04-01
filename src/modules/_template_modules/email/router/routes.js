export const routes = [
  {
    path: '/apps/email',
    name: 'apps-email',
    component: () => import('../views/EmailPage.vue'),
    meta: {
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'Email',
    },
  },
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: () => import('../views/EmailPage.vue'),
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'Email',
    },
  },
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: () => import('../views/EmailPage.vue'),
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'Email',
    },
  },
]
