export const routes = [
  {
    path: '/apps/invoice/list',
    name: 'apps-invoice-list',
    component: () => import('../views/InvoiceListPage.vue'),
    meta: { action: 'read', subject: 'Invoice' },
  },
  {
    path: '/apps/invoice/preview/:id',
    name: 'apps-invoice-preview-id',
    component: () => import('../views/InvoicePreviewPage.vue'),
    meta: { action: 'read', subject: 'Invoice' },
  },
  {
    path: '/apps/invoice/edit/:id',
    name: 'apps-invoice-edit-id',
    component: () => import('../views/InvoiceEditPage.vue'),
    meta: { action: 'update', subject: 'Invoice' },
  },
  {
    path: '/apps/invoice/add',
    name: 'apps-invoice-add',
    component: () => import('../views/InvoiceAddPage.vue'),
    meta: { action: 'create', subject: 'Invoice' },
  },
]
