export const navigation = {
  title: 'User',
  icon: { icon: 'tabler-user' },
  action: 'read',
  subject: 'User',
  children: [
    { title: 'List', to: 'apps-user-list', action: 'read', subject: 'User' },
    { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } }, action: 'read', subject: 'User' },
  ],
}
