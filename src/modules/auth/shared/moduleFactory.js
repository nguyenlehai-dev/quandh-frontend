import { getI18n } from '@/plugins/i18n'

export const tAuth = key => getI18n().global.t(key)

export function createModuleManifest({ routes, navigation, navOrder }) {
  return {
    routes,
    navigation,
    navOrder,
  }
}

export function createNavItem({ titleKey, icon, to, action, subject, children }) {
  const item = {
    title: titleKey ? tAuth(titleKey) : undefined,
    action,
    subject,
  }

  if (icon)
    item.icon = { icon }

  if (to)
    item.to = to

  if (Array.isArray(children) && children.length > 0)
    item.children = children

  return item
}

export function createNavGroup({ titleKey, icon, children, action, subject }) {
  return createNavItem({
    titleKey,
    icon,
    children,
    action,
    subject,
  })
}
