import { ability } from '@/plugins/casl/ability'

/**
 * Returns ability result if ACL is configured or else just return true
 * We should allow passing string | undefined to can because for admin ability we omit defining action & subject
 *
 * Useful if you don't know if ACL is configured or not
 * Used in @core files to handle absence of ACL without errors
 *
 * @param {string} action CASL Actions // https://casl.js.org/v4/en/guide/intro#basics
 * @param {string} subject CASL Subject // https://casl.js.org/v4/en/guide/intro#basics
 */
export const can = (action, subject) => {
  if (!action && !subject)
    return true

  return ability.can(action, subject)
}

/**
 * Check if user can view item based on it's ability
 * Based on item's action and subject & Hide group if all of it's children are hidden
 * @param {object} item navigation object item
 */
/**
 * Check if a single nav item is visible based on permissions.
 * For leaf items: check action/subject.
 * For group items (with children): recursively check if any child is visible.
 */
const isNavItemVisible = item => {
  // If item has children, it's a group — recursively check children
  if (item.children && item.children.length) {
    return item.children.some(child => isNavItemVisible(child))
  }

  // Leaf item: check permission
  return can(item.action, item.subject)
}

export const canViewNavMenuGroup = item => {
  const hasAnyVisibleChild = item.children.some(child => isNavItemVisible(child))

  // If subject and action is defined in item => Return based on children visibility (Hide group if no child is visible)
  // Else check for ability using provided subject and action along with checking if has any visible child
  if (!(item.action && item.subject))
    return hasAnyVisibleChild
  
  return can(item.action, item.subject) && hasAnyVisibleChild
}
export const canNavigate = to => {
  // Find the most specific route that has action & subject defined
  // Check from most specific (last) to least specific (first)
  for (let i = to.matched.length - 1; i >= 0; i--) {
    const route = to.matched[i]
    if (route.meta?.action && route.meta?.subject)
      return ability.can(route.meta.action, route.meta.subject)
  }

  // No route has explicit permissions → allow navigation
  return true
}
