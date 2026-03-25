export const routes = [
  {
    path: '/apps/invoice/list',
    name: 'apps-invoice-list',
    component: () => import('../views/InvoiceListPage.vue'),
  },
  {
    path: '/apps/invoice/preview/:id',
    name: 'apps-invoice-preview-id',
    component: () => import('../views/InvoicePreviewPage.vue'),
  },
  {
    path: '/apps/invoice/edit/:id',
    name: 'apps-invoice-edit-id',
    component: () => import('../views/InvoiceEditPage.vue'),
  },
  {
    path: '/apps/invoice/add',
    name: 'apps-invoice-add',
    component: () => import('../views/InvoiceAddPage.vue'),
  },
]
