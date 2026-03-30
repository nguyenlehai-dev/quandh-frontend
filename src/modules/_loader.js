// Module Auto-Discovery Loader
//
// Tu dong scan tat ca modules/[name]/index.js bang Vite import.meta.glob.
// Khi them module moi, chi can tao folder trong modules/ voi index.js
// -> he thong tu nhan dien, khong can sua bat ky file nao khac.
const moduleFiles = import.meta.glob('./*/index.js', { eager: true })

// Danh sách các module không tải vào app (demo hoặc chưa dùng tới)
const IGNORED_MODULES = [
  // 'example',
  // 'ecommerce',
  // 'academy',
  // 'logistics',
  // 'kanban',
  // 'chat',
  // 'email',
  // 'calendar',
  // 'invoice',
  // 'front-pages',
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
 * Lấy navigation item từ module theo tên
 */
function getModNav(name) {
  const mod = modules.find(m => m.name === name)

  return mod?.navigation || null
}

/**
 * Build cây menu sidebar theo cấu trúc chuẩn:
 * 1. Hồ sơ cá nhân
 * 2. Bảng điều khiển (Tổng quan hệ thống, Tổng quan nghiệp vụ)
 * 3. Quản lý cuộc họp (từ meetings module)
 * 4. Quản lý hệ thống (từ các system modules)
 */
export function getModuleNavigation() {
  // 1. Hồ sơ cá nhân (đã gỡ bỏ theo yêu cầu)

  // 2. Bảng điều khiển
  const dashboardNav = [
    { title: 'Tổng quan hệ thống', to: 'dashboards-crm', icon: { icon: 'tabler-layout-dashboard' } },
    { title: 'Tổng quan nghiệp vụ', to: 'meetings-business-overview', icon: { icon: 'tabler-briefcase' } },
  ]

  // 3. Quản lý cuộc họp (từ meetings module)
  const meetingsNav = getModNav('meetings')

  // 4. Quản lý hệ thống
  const orgNav = getModNav('organizations')
  const userNav = getModNav('user')
  const rolesNav = getModNav('roles')
  const settingsNav = getModNav('system-settings')

  const systemNav = [
    orgNav,
    userNav,
    {
      title: 'Nhật ký hoạt động',
      icon: { icon: 'tabler-history' },
      to: 'system-activity-logs',
    },
    rolesNav,
    settingsNav,
  ].filter(Boolean)

  return [
    { heading: 'Bảng điều khiển' },
    ...dashboardNav,
    { heading: 'Quản lý cuộc họp' },
    ...(Array.isArray(meetingsNav) ? meetingsNav : (meetingsNav ? [meetingsNav] : [])),
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
