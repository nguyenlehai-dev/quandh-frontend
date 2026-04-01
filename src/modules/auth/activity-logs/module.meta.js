export default {
  name: 'activity-logs',
  displayName: 'Activity Logs',
  group: 'auth',
  navOrder: 95,
  path: 'src/modules/auth/activity-logs',
  servicePaths: ['src/modules/auth/activity-logs/services/activityLogService.js'],
  purpose: 'Giam sat nhat ky thao tac cua he thong va xuat bao cao audit.',
  features: [
    'Danh sach nhat ky',
    'Loc theo actor, route, action, thoi gian',
    'Thong ke tong quan',
    'Xuat file',
    'Bulk delete',
  ],
  api: [
    { method: 'GET', endpoint: '/log-activities', service: 'fetchActivityLogs', description: 'Danh sach nhat ky' },
    { method: 'GET', endpoint: '/log-activities/stats', service: 'fetchActivityLogStats', description: 'Thong ke nhat ky' },
    { method: 'GET', endpoint: '/log-activities/export', service: 'exportActivityLogs', description: 'Xuat danh sach nhat ky' },
    { method: 'POST', endpoint: '/log-activities/bulk-delete', service: 'bulkDeleteActivityLogs', description: 'Xoa hang loat nhat ky' },
  ],
}
