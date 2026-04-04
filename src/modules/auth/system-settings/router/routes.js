export const routes = [
  {
    path: '/system/dashboard',
    name: 'system-dashboard',
    component: () => import('../views/SystemDashboardPage.vue'),
    meta: { action: 'read', subject: 'Dashboard' },
  },
  {
    path: '/system/settings/general',
    name: 'system-settings-general',
    component: () => import('../views/GeneralSettingsPage.vue'),
    meta: { action: 'read', subject: 'Setting' },
  },
  {
    path: '/system/settings/admin-experience',
    name: 'system-settings-admin-experience',
    component: () => import('../views/AdminExperienceSettingsPage.vue'),
    meta: { action: 'read', subject: 'Setting' },
  },
  {
    path: '/system/settings/public-channels',
    name: 'system-settings-public-channels',
    component: () => import('../views/PublicChannelsSettingsPage.vue'),
    meta: { action: 'read', subject: 'Setting' },
  },
  {
    path: '/system/settings/integrations',
    name: 'system-settings-integrations',
    component: () => import('../views/IntegrationSettingsPage.vue'),
    meta: { action: 'read', subject: 'Setting' },
  },
  {
    path: '/system/settings/notifications',
    name: 'system-settings-notifications',
    component: () => import('../views/NotificationSettingsPage.vue'),
    meta: { action: 'read', subject: 'Setting' },
  },
]
