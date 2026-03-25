export const routes = [
  {
    path: '/front-pages/landing-page',
    name: 'front-pages-landing-page',
    component: () => import('../views/index.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/front-pages/pricing',
    name: 'front-pages-pricing',
    component: () => import('../views/PricingPage.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/front-pages/checkout',
    name: 'front-pages-checkout',
    component: () => import('../views/CheckoutPage.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/front-pages/payment',
    name: 'front-pages-payment',
    component: () => import('../views/PaymentPage.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/front-pages/help-center',
    name: 'front-pages-help-center',
    component: () => import('../views/index.vue'),
    meta: { layout: 'blank' },
  },
]
