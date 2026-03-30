import { getI18n } from '@/plugins/i18n'

export function createMeetingsManifest({ routes = [], navigation = null, navOrder = 10, install } = {}) {
  return {
    routes,
    navigation,
    navOrder,
    ...(typeof install === 'function' ? { install } : {}),
  }
}

export function createMeetingsNavigationGroup({ titleKey, icon, children = [], action = 'read', subject = 'Meeting' }) {
  const t = key => getI18n().global.t(key)

  return {
    title: t(titleKey),
    icon: { icon },
    action,
    subject,
    children,
  }
}

export function createMeetingsNavigationItem({ titleKey, to, action = 'read', subject = 'Meeting' }) {
  const t = key => getI18n().global.t(key)

  return {
    title: t(titleKey),
    to,
    action,
    subject,
  }
}
