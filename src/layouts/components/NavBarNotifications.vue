<script setup>
const notifications = ref([])
const isLoading = ref(false)

const fetchNotifications = async () => {
  isLoading.value = true
  try {
    const res = await $api('/user/notifications')

    if (res?.data) {
      notifications.value = res.data
    }
  }
  catch (error) {
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
  try {
    await $api(`/user/notifications/${notificationId}`, { method: 'DELETE' })
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }
  catch {}
}

const markRead = async notificationIds => {
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
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
