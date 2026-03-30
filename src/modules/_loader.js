// Module Auto-Discovery Loader
//
// Tu dong scan tat ca modules/**/index.js bang Vite import.meta.glob.
// Khi them module moi, chi can tao folder trong modules/ voi index.js
// -> he thong tu nhan dien, khong can sua bat ky file nao khac.
import { can } from '@layouts/plugins/casl'
import { getI18n } from '@/plugins/i18n'

const moduleFiles = import.meta.glob([
  './**/index.js',
  '!./_template_modules/**/index.js',
], { eager: true })

const t = key => getI18n().global.t(key)

// Danh sách các module không tải vào app (demo hoặc chưa dùng tới)
// eslint-disable-next-line sonarjs/no-empty-collection
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
    const segments = path.replace('./', '').split('/')
    const moduleName = segments.at(-2)
    const hasIgnoredSegment = segments.some(segment => segment.startsWith('_'))

    // eslint-disable-next-line sonarjs/no-empty-collection
    return !hasIgnoredSegment && !IGNORED_MODULES.includes(moduleName)
  })
  .map(([path, mod]) => {
    const segments = path.replace('./', '').split('/')
    const moduleName = segments.at(-2)

    return {
      name: moduleName,
      path,
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

function normalizeNavItems(nav) {
  if (!nav) return []

  return Array.isArray(nav) ? nav : [nav]
}

function isNavItemVisible(item) {
  if (!item || item.heading) return false

  if (item.children?.length) {
    const hasVisibleChild = item.children.some(child => isNavItemVisible(child))
    if (!(item.action && item.subject))
      return hasVisibleChild

    return can(item.action, item.subject) && hasVisibleChild
  }

  return can(item.action, item.subject)
}

function buildSection(heading, items) {
  const normalizedItems = normalizeNavItems(items)

  if (!normalizedItems.some(item => isNavItemVisible(item)))
    return []

  return [
    { heading },
    ...normalizedItems,
  ]
}

/**
 * Build cây menu sidebar theo cấu trúc chuẩn:
 * 1. Hồ sơ cá nhân
 * 2. Bảng điều khiển (Tổng quan hệ thống, Tổng quan nghiệp vụ)
 * 3. Quản lý cuộc họp (từ meetings module)
 * 4. Quản lý hệ thống (từ các system modules)
 */
export function getModuleNavigation() {
  // 1. Bảng điều khiển: luôn hiện cho mọi user
  const dashboardNav = [
    {
      title: t('navigation.navigation.dashboard.system_overview'),
      to: 'system-dashboard',
      icon: { icon: 'tabler-layout-dashboard' },
      action: 'read',
      subject: 'Dashboard',
    },
    {
      title: t('navigation.navigation.dashboard.business_overview'),
      to: 'meetings-business-overview',
      icon: { icon: 'tabler-briefcase' },
      action: 'read',
      subject: 'BusinessOverview',
    },
  ]

  // 2. Quản lý cuộc họp (từ meetings module)
  const meetingsNav = normalizeNavItems(getModNav('meetings'))

  // 3. Quản lý hệ thống
  const orgNav = getModNav('organizations')
  const userNav = getModNav('user')
  const activityLogNav = getModNav('activity-logs')
  const rolesNav = getModNav('roles')
  const settingsNav = getModNav('system-settings')

  const systemNav = [
    orgNav,
    userNav,
    activityLogNav,
    rolesNav,
    settingsNav,
  ].filter(Boolean)

  return [
    ...buildSection(t('navigation.navigation.dashboard.section'), dashboardNav),
    ...buildSection(t('navigation.navigation.meetings.section'), meetingsNav),
    ...buildSection(t('navigation.navigation.system.section'), systemNav),
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
