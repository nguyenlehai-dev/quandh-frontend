export default {
  name: 'standard-root-module',
  displayName: 'Standard Root Module',
  group: 'root',
  navOrder: 120,
  path: 'src/modules/_template_modules/standard-root-module',
  servicePaths: ['src/modules/_template_modules/standard-root-module/services/standardRootModuleService.js'],
  purpose: 'Template cho module root.',
  features: [
    'Co du folder chuan',
    'Co route, navigation, service va view mau',
  ],
  api: [
    { method: 'GET', endpoint: '/standard-root-module', service: 'fetchStandardRootModules', description: 'Danh sach items' },
    { method: 'GET', endpoint: '/standard-root-module/:id', service: 'fetchStandardRootModule', description: 'Chi tiet item' },
    { method: 'POST', endpoint: '/standard-root-module', service: 'createStandardRootModule', description: 'Tao item' },
    { method: 'PUT', endpoint: '/standard-root-module/:id', service: 'updateStandardRootModule', description: 'Cap nhat item' },
    { method: 'DELETE', endpoint: '/standard-root-module/:id', service: 'deleteStandardRootModule', description: 'Xoa item' },
  ],
}
