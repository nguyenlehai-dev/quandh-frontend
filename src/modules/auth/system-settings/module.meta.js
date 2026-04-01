export default {
  name: 'system-settings',
  displayName: 'System Settings',
  group: 'auth',
  navOrder: 120,
  path: 'src/modules/auth/system-settings',
  servicePaths: ['src/modules/auth/system-settings/services/systemSettingService.js'],
  purpose: 'Quan ly cau hinh chung, logo, favicon, ngon ngu va thong bao cua he thong.',
  features: [
    'System dashboard',
    'General settings',
    'Notification settings',
    'Dong bo public settings cho shell app',
  ],
  api: [
    { method: 'GET', endpoint: '/settings', service: '$api', description: 'Lay toan bo cau hinh' },
    { method: 'PUT', endpoint: '/settings', service: '$api', description: 'Cap nhat cau hinh' },
    { method: 'GET', endpoint: '/settings/public', service: '$api', description: 'Lay cau hinh cong khai' },
  ],
}
