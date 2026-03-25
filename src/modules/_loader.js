// Module Auto-Discovery Loader
//
// Tu dong scan tat ca modules/[name]/index.js bang Vite import.meta.glob.
// Khi them module moi, chi can tao folder trong modules/ voi index.js
// -> he thong tu nhan dien, khong can sua bat ky file nao khac.
const moduleFiles = import.meta.glob('./*/index.js', { eager: true })

// Danh sách các module không tải vào app (demo hoặc chưa dùng tới)
const IGNORED_MODULES = [
  'example',
  'ecommerce',
  'academy',
  'logistics',
  'kanban',
  'chat',
  'email',
  'calendar',
  'invoice',
  'front-pages',
]

export const modules = Object.entries(moduleFiles)
  .filter(([path]) => {
    const moduleName = path.split('/')[1]

    return !IGNORED_MODULES.includes(moduleName)
  })
  .map(([path, mod]) => {
    const moduleName = path.split('/')[1]

    return {
      name: moduleName,
      ...mod.default,
    }
  })

/**
 * Merge tất cả routes từ các modules
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export function getModuleRoutes() {
  return modules.flatMap(m => m.routes || [])
}

/**
 * Merge tat ca navigation items tu cac modules
 * Thu tu duoc xac dinh boi property `navOrder` trong index.js cua moi module
 * Module nao khong khai bao `navOrder` se o cuoi, sap xep theo alphabet
 * @returns {Array}
 */
export function getModuleNavigation() {
  // 1. Dashboard navigation (co san heading ben trong)
  const dashboardMod = modules.find(m => m.name === 'dashboards')
  const dashboardNav = dashboardMod?.navigation || []

  // 2. App modules navigation (sap xep theo navOrder)
  const appModules = modules
    .filter(m => m.name !== 'dashboards' && m.navigation && m.navigation !== null)
    .sort((a, b) => {
      const ao = a.navOrder ?? 999
      const bo = b.navOrder ?? 999

      if (ao !== bo) return ao - bo

      return a.name.localeCompare(b.name)
    })

  const meetingsNav = appModules
    .filter(m => (m.navOrder ?? 999) < 50)
    .map(m => m.navigation)
    .filter(Boolean)
    .flat()

  const systemNav = appModules
    .filter(m => (m.navOrder ?? 999) >= 50)
    .map(m => m.navigation)
    .filter(Boolean)
    .flat()

  return [
    ...dashboardNav,
    { heading: 'Quản lý cuộc họp' },
    ...meetingsNav,
    { heading: 'Quản lý hệ thống' },
    ...systemNav,
  ]
}

/**
 * Install tất cả modules vào Vue app
 * @param {import('vue').App} app
 */
export function installModules(app) {
  modules.forEach(m => {
    if (typeof m.install === 'function') {
      m.install(app)
    }
  })
}
