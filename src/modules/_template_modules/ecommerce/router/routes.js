export const routes = [
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/modules/dashboards/views/EcommerceDashboardPage.vue'),
    meta: { action: 'read', subject: 'Ecommerce' },
  },
  {
    path: '/apps/ecommerce/product/list',
    name: 'apps-ecommerce-product-list',
    component: () => import('../views/ProductListPage.vue'),
    meta: { action: 'read', subject: 'Product' },
  },
  {
    path: '/apps/ecommerce/product/add',
    name: 'apps-ecommerce-product-add',
    component: () => import('../views/ProductAddPage.vue'),
    meta: { action: 'create', subject: 'Product' },
  },
  {
    path: '/apps/ecommerce/product/category-list',
    name: 'apps-ecommerce-product-category-list',
    component: () => import('../views/ProductCategoryListPage.vue'),
    meta: { action: 'read', subject: 'Product' },
  },
  {
    path: '/apps/ecommerce/order/list',
    name: 'apps-ecommerce-order-list',
    component: () => import('../views/OrderListPage.vue'),
    meta: { action: 'read', subject: 'Order' },
  },
  {
    path: '/apps/ecommerce/order/details/:id',
    name: 'apps-ecommerce-order-details-id',
    component: () => import('../views/OrderDetailsPage.vue'),
    meta: { action: 'read', subject: 'Order' },
  },
  {
    path: '/apps/ecommerce/customer/list',
    name: 'apps-ecommerce-customer-list',
    component: () => import('../views/CustomerListPage.vue'),
    meta: { action: 'read', subject: 'Customer' },
  },
  {
    path: '/apps/ecommerce/customer/details/:id',
    name: 'apps-ecommerce-customer-details-id',
    component: () => import('../views/CustomerDetailsPage.vue'),
    meta: { action: 'read', subject: 'Customer' },
  },
  {
    path: '/apps/ecommerce/manage-review',
    name: 'apps-ecommerce-manage-review',
    component: () => import('../views/ManageReviewPage.vue'),
    meta: { action: 'read', subject: 'Ecommerce' },
  },
  {
    path: '/apps/ecommerce/referrals',
    name: 'apps-ecommerce-referrals',
    component: () => import('../views/ReferralsPage.vue'),
    meta: { action: 'read', subject: 'Ecommerce' },
  },
  {
    path: '/apps/ecommerce/settings',
    name: 'apps-ecommerce-settings',
    component: () => import('../views/SettingsPage.vue'),
    meta: { action: 'manage', subject: 'Ecommerce' },
  },
]
