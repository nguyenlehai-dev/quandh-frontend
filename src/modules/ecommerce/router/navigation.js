export const navigation = {
  title: 'Ecommerce',
  icon: { icon: 'tabler-shopping-cart' },
  children: [
    {
      title: 'Dashboard',
      to: 'apps-ecommerce-dashboard',
    },
    {
      title: 'Product',
      children: [
        { title: 'List', to: 'apps-ecommerce-product-list' },
        { title: 'Add', to: 'apps-ecommerce-product-add' },
        { title: 'Category', to: 'apps-ecommerce-product-category-list' },
      ],
    },
    {
      title: 'Order',
      children: [
        { title: 'List', to: 'apps-ecommerce-order-list' },
        { title: 'Details', to: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' } } },
      ],
    },
    {
      title: 'Customer',
      children: [
        { title: 'List', to: 'apps-ecommerce-customer-list' },
        { title: 'Details', to: { name: 'apps-ecommerce-customer-details-id', params: { id: 478426 } } },
      ],
    },
    {
      title: 'Manage Review',
      to: 'apps-ecommerce-manage-review',
    },
    {
      title: 'Referrals',
      to: 'apps-ecommerce-referrals',
    },
    {
      title: 'Settings',
      to: 'apps-ecommerce-settings',
    },
  ],
}
