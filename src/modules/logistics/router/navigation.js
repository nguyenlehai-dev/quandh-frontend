export const navigation = {
  title: 'Logistics',
  icon: { icon: 'tabler-truck' },
  action: 'read',
  subject: 'Logistics',
  children: [
    { title: 'Dashboard', to: 'apps-logistics-dashboard', action: 'read', subject: 'Logistics' },
    { title: 'Fleet', to: 'apps-logistics-fleet', action: 'read', subject: 'Logistics' },
  ],
}
