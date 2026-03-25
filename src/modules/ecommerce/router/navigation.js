export const navigation = {
  title: 'Ecommerce',
  icon: { icon: 'tabler-shopping-cart' },
  action: 'read',
  subject: 'Ecommerce',
  children: [
    {
      title: 'Dashboard',
      to: 'apps-ecommerce-dashboard',
      action: 'read',
      subject: 'Ecommerce',
    },
    {
      title: 'Product',
      action: 'read',
      subject: 'Product',
      children: [
        { title: 'List', to: 'apps-ecommerce-product-list', action: 'read', subject: 'Product' },
        { title: 'Add', to: 'apps-ecommerce-product-add', action: 'create', subject: 'Product' },
        { title: 'Category', to: 'apps-ecommerce-product-category-list', action: 'read', subject: 'Product' },
      ],
    },
    {
      title: 'Order',
      action: 'read',
      subject: 'Order',
      children: [
        { title: 'List', to: 'apps-ecommerce-order-list', action: 'read', subject: 'Order' },
        { title: 'Details', to: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' } }, action: 'read', subject: 'Order' },
      ],
    },
    {
      title: 'Customer',
      action: 'read',
      subject: 'Customer',
      children: [
        { title: 'List', to: 'apps-ecommerce-customer-list', action: 'read', subject: 'Customer' },
        { title: 'Details', to: { name: 'apps-ecommerce-customer-details-id', params: { id: 478426 } }, action: 'read', subject: 'Customer' },
      ],
    },
    {
      title: 'Manage Review',
      to: 'apps-ecommerce-manage-review',
      action: 'read',
      subject: 'Ecommerce',
    },
    {
      title: 'Referrals',
      to: 'apps-ecommerce-referrals',
      action: 'read',
      subject: 'Ecommerce',
    },
    {
      title: 'Settings',
      to: 'apps-ecommerce-settings',
      action: 'manage',
      subject: 'Ecommerce',
    },
  ],
}
