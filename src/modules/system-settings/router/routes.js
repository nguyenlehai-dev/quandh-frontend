export const routes = [
  {
    path: '/system/dashboard',
    name: 'system-dashboard',
    component: () => import('../views/SystemDashboardPage.vue'),
    meta: { action: 'read', subject: 'SystemSetting' }, // Needs high rank view permission, SystemSetting is appropriate for now.
  },
  {
    path: '/system/settings/general',
    name: 'system-settings-general',
    component: () => import('../views/GeneralSettingsPage.vue'),
    meta: { action: 'read', subject: 'SystemSetting' },
  },
  {
    path: '/system/settings/notifications',
    name: 'system-settings-notifications',
    component: () => import('../views/NotificationSettingsPage.vue'),
    meta: { action: 'read', subject: 'SystemSetting' },
  },
]
