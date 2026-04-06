import { getI18n } from '@/plugins/i18n'

export function createMeetingsManifest({ routes = [], navigation = null, navOrder = 10, install } = {}) {
  return {
    routes,
    navigation,
    navOrder,
    ...(typeof install === 'function' ? { install } : {}),
  }
}

export function createMeetingsNavigationGroup({ titleKey, icon, children = [], action, subject }) {
  return {
    titleKey,
    icon: { icon },
    action,
    subject,
    children,
  }
}

export function createMeetingsNavigationItem({ titleKey, to, action, subject }) {
  return {
    titleKey,
    to,
    action,
    subject,
  }
}
