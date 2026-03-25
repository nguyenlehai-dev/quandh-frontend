export const routes = [
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/modules/dashboards/views/EcommerceDashboardPage.vue'),
  },
  {
    path: '/apps/ecommerce/product/list',
    name: 'apps-ecommerce-product-list',
    component: () => import('../views/ProductListPage.vue'),
  },
  {
    path: '/apps/ecommerce/product/add',
    name: 'apps-ecommerce-product-add',
    component: () => import('../views/ProductAddPage.vue'),
  },
  {
    path: '/apps/ecommerce/product/category-list',
    name: 'apps-ecommerce-product-category-list',
    component: () => import('../views/ProductCategoryListPage.vue'),
  },
  {
    path: '/apps/ecommerce/order/list',
    name: 'apps-ecommerce-order-list',
    component: () => import('../views/OrderListPage.vue'),
  },
  {
    path: '/apps/ecommerce/order/details/:id',
    name: 'apps-ecommerce-order-details-id',
    component: () => import('../views/OrderDetailsPage.vue'),
  },
  {
    path: '/apps/ecommerce/customer/list',
    name: 'apps-ecommerce-customer-list',
    component: () => import('../views/CustomerListPage.vue'),
  },
  {
    path: '/apps/ecommerce/customer/details/:id',
    name: 'apps-ecommerce-customer-details-id',
    component: () => import('../views/CustomerDetailsPage.vue'),
  },
  {
    path: '/apps/ecommerce/manage-review',
    name: 'apps-ecommerce-manage-review',
    component: () => import('../views/ManageReviewPage.vue'),
  },
  {
    path: '/apps/ecommerce/referrals',
    name: 'apps-ecommerce-referrals',
    component: () => import('../views/ReferralsPage.vue'),
  },
  {
    path: '/apps/ecommerce/settings',
    name: 'apps-ecommerce-settings',
    component: () => import('../views/SettingsPage.vue'),
  },
]
