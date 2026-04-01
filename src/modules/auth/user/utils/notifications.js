const getNestedValue = (source, path) => path.split('.').reduce((value, segment) => value?.[segment], source)

export const getNotificationId = notification => (
  notification?.id
  ?? notification?.notification_id
  ?? notification?.uuid
  ?? notification?._id
)

export const getNotificationTitle = notification => (
  notification?.title
  ?? notification?.subject
  ?? notification?.message
  ?? notification?.data?.title
  ?? 'Thông báo'
)

export const getNotificationSubtitle = notification => (
  notification?.subtitle
  ?? notification?.description
  ?? notification?.content
  ?? notification?.body
  ?? notification?.message
  ?? notification?.data?.subtitle
  ?? notification?.data?.message
  ?? 'Không có nội dung chi tiết.'
)

export const getNotificationTime = notification => (
  notification?.time
  ?? notification?.created_at
  ?? notification?.createdAt
  ?? notification?.updated_at
  ?? notification?.updatedAt
  ?? ''
)

export const isNotificationSeen = notification => Boolean(
  notification?.isSeen
  ?? notification?.is_seen
  ?? notification?.read
  ?? notification?.read_at,
)

export const getNotificationCategory = notification => (
  notification?.category
  ?? notification?.type
  ?? notification?.module
  ?? notification?.data?.category
  ?? notification?.data?.type
  ?? 'Khác'
)

export const getNotificationDetailEntries = notification => {
  const source = notification?.data && typeof notification.data === 'object'
    ? notification.data
    : notification

  return Object.entries(source || {})
    .filter(([key, value]) => !['icon', 'img', 'image', 'avatar', 'title', 'subtitle', 'message', 'content', 'body'].includes(key) && value !== null && value !== undefined && value !== '')
}

const resolveNotificationRouteObject = notification => {
  const routeObject = notification?.route
    ?? notification?.data?.route
    ?? notification?.data?.to

  if (routeObject && typeof routeObject === 'object')
    return routeObject

  const routeName = notification?.routeName
    ?? notification?.route_name
    ?? notification?.data?.routeName
    ?? notification?.data?.route_name
    ?? notification?.target_route
    ?? notification?.targetRoute
    ?? notification?.data?.target_route

  if (routeName) {
    return {
      name: routeName,
      params: notification?.routeParams
        ?? notification?.route_params
        ?? notification?.data?.routeParams
        ?? notification?.data?.route_params
        ?? {},
      query: notification?.routeQuery
        ?? notification?.route_query
        ?? notification?.data?.routeQuery
        ?? notification?.data?.route_query
        ?? {},
    }
  }

  const meetingId = notification?.meeting_id
    ?? notification?.meetingId
    ?? notification?.data?.meeting_id
    ?? notification?.data?.meetingId
    ?? notification?.entity_id
    ?? notification?.entityId
    ?? notification?.data?.entity_id
    ?? notification?.data?.entityId

  const entityType = String(
    notification?.entity_type
    ?? notification?.entityType
    ?? notification?.data?.entity_type
    ?? notification?.data?.entityType
    ?? notification?.module
    ?? notification?.data?.module
    ?? '',
  ).toLowerCase()

  if (meetingId && entityType.includes('meeting'))
    return { name: 'meetings-participant-details', params: { id: meetingId } }

  const userId = notification?.user_id
    ?? notification?.userId
    ?? notification?.data?.user_id
    ?? notification?.data?.userId

  if (userId && entityType.includes('user'))
    return { name: 'apps-user-view-id', params: { id: userId } }

  return null
}

export const resolveNotificationTarget = notification => {
  const routeObject = resolveNotificationRouteObject(notification)

  if (routeObject)
    return { type: 'route', value: routeObject }

  const stringTargetPaths = [
    'url',
    'href',
    'link',
    'path',
    'targetUrl',
    'target_url',
    'redirectUrl',
    'redirect_url',
    'data.url',
    'data.href',
    'data.link',
    'data.path',
    'data.targetUrl',
    'data.target_url',
    'data.redirectUrl',
    'data.redirect_url',
  ]

  for (const path of stringTargetPaths) {
    const value = getNestedValue(notification, path)

    if (typeof value !== 'string' || !value.trim())
      continue

    if (value.startsWith('http://') || value.startsWith('https://'))
      return { type: 'external', value }

    return { type: 'path', value }
  }

  return null
}

export const navigateToNotificationTarget = async (notification, router) => {
  const target = resolveNotificationTarget(notification)

  if (!target)
    return false

  if (target.type === 'external') {
    window.location.href = target.value

    return true
  }

  await router.push(target.value)

  return true
}
