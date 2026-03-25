export const navigation = {
  title: 'Invoice',
  icon: { icon: 'tabler-file-invoice' },
  action: 'read',
  subject: 'Invoice',
  children: [
    { title: 'List', to: 'apps-invoice-list', action: 'read', subject: 'Invoice' },
    { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } }, action: 'read', subject: 'Invoice' },
    { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } }, action: 'update', subject: 'Invoice' },
    { title: 'Add', to: 'apps-invoice-add', action: 'create', subject: 'Invoice' },
  ],
}
