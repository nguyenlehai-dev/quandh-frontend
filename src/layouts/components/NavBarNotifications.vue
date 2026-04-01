<script setup>
import { getNotificationId, navigateToNotificationTarget } from '@/modules/auth/user/utils/notifications'

const notifications = ref([])
const isLoading = ref(false)
const NOTIFICATIONS_FORBIDDEN_KEY = 'userNotificationsForbidden'
const notificationsForbidden = ref(sessionStorage.getItem(NOTIFICATIONS_FORBIDDEN_KEY) === '1')
const router = useRouter()

const fetchNotifications = async () => {
  if (notificationsForbidden.value) return

  isLoading.value = true
  try {
    const res = await $api('/user/notifications')

    if (res?.data) {
      notifications.value = res.data
    }
  }
  catch (error) {
    if (error?.status === 403 || error?.statusCode === 403) {
      notificationsForbidden.value = true
      sessionStorage.setItem(NOTIFICATIONS_FORBIDDEN_KEY, '1')
      notifications.value = []

      return
    }

    console.error('Failed to fetch notifications:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Load khi mount
fetchNotifications()

// Auto-refresh mỗi 30 giây
const refreshInterval = setInterval(fetchNotifications, 30000)

onBeforeUnmount(() => clearInterval(refreshInterval))

const removeNotification = async notificationId => {
  if (notificationsForbidden.value) return

  try {
    await $api(`/user/notifications/${notificationId}`, { method: 'DELETE' })
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }
  catch {}
}

const markRead = async notificationIds => {
  if (notificationsForbidden.value) return

  try {
    await $api('/user/notifications/mark-read', {
      method: 'POST',
      body: { ids: notificationIds },
    })

    notifications.value.forEach(item => {
      if (notificationIds.includes(item.id))
        item.isSeen = true
    })
  }
  catch {}
}

const markUnRead = async notificationIds => {
  if (notificationsForbidden.value) return

  try {
    await $api('/user/notifications/mark-unread', {
      method: 'POST',
      body: { ids: notificationIds },
    })

    notifications.value.forEach(item => {
      if (notificationIds.includes(item.id))
        item.isSeen = false
    })
  }
  catch {}
}

const handleNotificationClick = notification => {
  const notificationId = getNotificationId(notification)

  if (notificationId && !notification.isSeen)
    markRead([notificationId])

  navigateToNotificationTarget(notification, router).then(isNavigated => {
    if (!isNavigated && notificationId) {
      router.push({
        name: 'user-notifications',
        query: { selected: String(notificationId) },
      })
    }
  })
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
    @click:all="router.push({ name: 'user-notifications' })"
  />
</template>
