export default {
  name: 'standard-auth-module',
  displayName: 'Standard Auth Module',
  group: 'auth-template',
  navOrder: 120,
  path: 'src/modules/_template_modules/standard-auth-module',
  servicePaths: ['src/modules/_template_modules/standard-auth-module/services/standardAuthModuleService.js'],
  purpose: 'Template cho module con ben trong auth.',
  features: [
    'Dung san shared auth helpers',
    'Co route, navigation, service va view mau',
  ],
  api: [
    { method: 'GET', endpoint: '/standard-auth-module', service: 'fetchStandardAuthModules', description: 'Danh sach items' },
    { method: 'GET', endpoint: '/standard-auth-module/:id', service: 'fetchStandardAuthModule', description: 'Chi tiet item' },
    { method: 'POST', endpoint: '/standard-auth-module', service: 'createStandardAuthModule', description: 'Tao item' },
    { method: 'PUT', endpoint: '/standard-auth-module/:id', service: 'updateStandardAuthModule', description: 'Cap nhat item' },
    { method: 'DELETE', endpoint: '/standard-auth-module/:id', service: 'deleteStandardAuthModule', description: 'Xoa item' },
  ],
}
