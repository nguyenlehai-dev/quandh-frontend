export const navigation = [
  { heading: 'Bảng điều khiển' }, // Changed from Dashboards
  {
    title: 'Tổng quan hệ thống', // Analytics -> System overview
    icon: { icon: 'tabler-chart-pie-2' },
    to: 'dashboards-analytics',
    action: 'read',
    subject: 'Dashboard',
  },
  {
    title: 'Tổng quan nghiệp vụ', // CRM -> Business overview
    icon: { icon: 'tabler-briefcase' },
    to: 'dashboards-crm',
    action: 'read',
    subject: 'Dashboard',
  },
  // The rest are removed since they are demo dashboards
]
