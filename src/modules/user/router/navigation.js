export const navigation = {
  title: 'User',
  icon: { icon: 'tabler-user' },
  children: [
    { title: 'List', to: 'apps-user-list' },
    { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
  ],
}
