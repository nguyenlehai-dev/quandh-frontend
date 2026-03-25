export const navigation = {
  title: 'Invoice',
  icon: { icon: 'tabler-file-invoice' },
  children: [
    { title: 'List', to: 'apps-invoice-list' },
    { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
    { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
    { title: 'Add', to: 'apps-invoice-add' },
  ],
}
