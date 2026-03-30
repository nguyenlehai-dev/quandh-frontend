<script setup>
import {
  getNotificationCategory,
  getNotificationDetailEntries,
  getNotificationId,
  getNotificationSubtitle,
  getNotificationTime,
  getNotificationTitle,
  isNotificationSeen,
  navigateToNotificationTarget,
} from '@/modules/auth/user/utils/notifications'

const router = useRouter()
const route = useRoute()

const notifications = ref([])
const loading = ref(false)
const selectedRows = ref([])
const selectedFilter = ref('all')
const selectedCategory = ref('all')
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedNotificationId = ref(route.query.selected ? String(route.query.selected) : null)
const drawerOpen = ref(Boolean(selectedNotificationId.value))

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await $api('/user/notifications')

    notifications.value = Array.isArray(res?.data) ? res.data : []
  }
  catch (error) {
    console.error('Fetch notifications error:', error)
    notifications.value = []
  }
  finally {
    loading.value = false
  }
}

const notificationItems = computed(() => notifications.value.map(item => ({
  raw: item,
  id: String(getNotificationId(item) ?? ''),
  title: getNotificationTitle(item),
  subtitle: getNotificationSubtitle(item),
  time: getNotificationTime(item),
  category: getNotificationCategory(item),
  isSeen: isNotificationSeen(item),
})).filter(item => item.id))

const unreadCount = computed(() => notificationItems.value.filter(item => !item.isSeen).length)
const readCount = computed(() => notificationItems.value.filter(item => item.isSeen).length)

const categoryOptions = computed(() => {
  const categories = [...new Set(notificationItems.value.map(item => item.category).filter(Boolean))]

  return [
    { title: 'Tất cả nhóm', value: 'all' },
    ...categories.map(item => ({ title: item, value: item })),
  ]
})

const filteredNotifications = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  return notificationItems.value.filter(item => {
    const matchesState = selectedFilter.value === 'all'
      || (selectedFilter.value === 'read' && item.isSeen)
      || (selectedFilter.value === 'unread' && !item.isSeen)

    const matchesCategory = selectedCategory.value === 'all' || item.category === selectedCategory.value

    const matchesKeyword = !keyword
      || item.title.toLowerCase().includes(keyword)
      || item.subtitle.toLowerCase().includes(keyword)
      || item.category.toLowerCase().includes(keyword)

    return matchesState && matchesCategory && matchesKeyword
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotifications.value.length / itemsPerPage.value)))

const pagedNotifications = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value

  return filteredNotifications.value.slice(start, start + itemsPerPage.value)
})

const selectedNotification = computed(() => notificationItems.value.find(item => item.id === selectedNotificationId.value) ?? null)

const syncSelectedQuery = async value => {
  const nextQuery = { ...route.query }

  if (value)
    nextQuery.selected = String(value)
  else
    delete nextQuery.selected

  await router.replace({ query: nextQuery })
}

const normalizeIds = ids => ids
  .map(id => String(id))
  .filter(Boolean)

const getApiIds = ids => normalizeIds(ids).map(id => {
  const numericId = Number(id)

  return Number.isNaN(numericId) ? id : numericId
})

const updateLocalSeenState = (ids, isSeen) => {
  const normalizedIds = normalizeIds(ids)

  notifications.value.forEach(item => {
    const notificationId = String(getNotificationId(item))

    if (normalizedIds.includes(notificationId)) {
      item.isSeen = isSeen
      item.read = isSeen
      item.readAt = isSeen ? item.readAt ?? new Date().toISOString() : null
      item['is_seen'] = isSeen
    }
  })
}

const markRead = async ids => {
  const normalizedIds = normalizeIds(ids)

  if (!normalizedIds.length) return

  try {
    await $api('/user/notifications/mark-read', {
      method: 'POST',
      body: { ids: getApiIds(normalizedIds) },
    })

    updateLocalSeenState(normalizedIds, true)
  }
  catch (error) {
    console.error('Mark notifications read error:', error)
  }
}

const markUnread = async ids => {
  const normalizedIds = normalizeIds(ids)

  if (!normalizedIds.length) return

  try {
    await $api('/user/notifications/mark-unread', {
      method: 'POST',
      body: { ids: getApiIds(normalizedIds) },
    })

    updateLocalSeenState(normalizedIds, false)
  }
  catch (error) {
    console.error('Mark notifications unread error:', error)
  }
}

const removeNotification = async ids => {
  const normalizedIds = normalizeIds(ids)

  if (!normalizedIds.length) return

  try {
    await Promise.all(normalizedIds.map(id => $api(`/user/notifications/${id}`, { method: 'DELETE' })))
    notifications.value = notifications.value.filter(item => !normalizedIds.includes(String(getNotificationId(item))))
    selectedRows.value = selectedRows.value.filter(id => !normalizedIds.includes(String(id)))

    if (selectedNotificationId.value && normalizedIds.includes(String(selectedNotificationId.value)))
      await closeDetail()
  }
  catch (error) {
    console.error('Remove notifications error:', error)
  }
}

const openDetail = async item => {
  selectedNotificationId.value = item.id
  drawerOpen.value = true
  await syncSelectedQuery(item.id)

  if (!item.isSeen)
    await markRead([item.id])
}

const closeDetail = async () => {
  drawerOpen.value = false
  selectedNotificationId.value = null
  await syncSelectedQuery(null)
}

const openTarget = async (item = selectedNotification.value) => {
  if (!item) return

  const navigated = await navigateToNotificationTarget(item.raw, router)

  if (!navigated)
    drawerOpen.value = true
}

const toggleSelectedReadState = async shouldRead => {
  const ids = normalizeIds(selectedRows.value)

  if (!ids.length) return

  if (shouldRead)
    await markRead(ids)
  else
    await markUnread(ids)
}

const deleteSelected = async () => {
  const ids = normalizeIds(selectedRows.value)

  if (!ids.length) return

  await removeNotification(ids)
}

const markAllVisibleRead = async () => {
  const ids = normalizeIds(filteredNotifications.value.filter(item => !item.isSeen).map(item => item.id))

  await markRead(ids)
}

watch([selectedFilter, selectedCategory, searchQuery, itemsPerPage], () => {
  page.value = 1
})

watch(filteredNotifications, items => {
  if (page.value > totalPages.value)
    page.value = totalPages.value

  if (!items.some(item => item.id === selectedNotificationId.value)) {
    selectedNotificationId.value = null
    drawerOpen.value = false
  }
}, { immediate: true })

watch(() => route.query.selected, selected => {
  selectedNotificationId.value = selected ? String(selected) : null
  drawerOpen.value = Boolean(selectedNotificationId.value)
}, { immediate: true })

const headers = [
  { title: '', key: 'data-table-select', sortable: false, width: 44 },
  { title: 'Thông báo', key: 'title', sortable: false },
  { title: 'Nhóm', key: 'category', sortable: false, width: 150 },
  { title: 'Thời gian', key: 'time', sortable: false, width: 180 },
  { title: 'Trạng thái', key: 'status', sortable: false, width: 130 },
  { title: 'Thao tác', key: 'actions', sortable: false, width: 150 },
]

onMounted(fetchNotifications)
</script>

<template>
  <section>
    <VRow class="mb-6">
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="primary"
              variant="tonal"
              size="52"
            >
              <VIcon icon="tabler-bell" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-medium-emphasis">
                Tổng thông báo
              </div>
              <div class="text-h4 font-weight-bold">
                {{ notificationItems.length }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="warning"
              variant="tonal"
              size="52"
            >
              <VIcon icon="tabler-mail-opened" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-medium-emphasis">
                Chưa đọc
              </div>
              <div class="text-h4 font-weight-bold">
                {{ unreadCount }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="success"
              variant="tonal"
              size="52"
            >
              <VIcon icon="tabler-circle-check" />
            </VAvatar>
            <div>
              <div class="text-body-2 text-medium-emphasis">
                Đã đọc
              </div>
              <div class="text-h4 font-weight-bold">
                {{ readCount }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
          <div>
            <div class="text-h5 mb-1">
              Quản lý thông báo
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Xem toàn bộ danh sách, lọc đọc/chưa đọc và mở nhanh tới nội dung liên quan.
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              variant="outlined"
              prepend-icon="tabler-mail-opened"
              @click="markAllVisibleRead"
            >
              Đánh dấu tất cả đã đọc
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-refresh"
              :loading="loading"
              @click="fetchNotifications"
            >
              Tải lại
            </VBtn>
          </div>
        </div>

        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm theo tiêu đề, nội dung hoặc nhóm"
              prepend-inner-icon="tabler-search"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedCategory"
              :items="categoryOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                :color="selectedFilter === 'all' ? 'primary' : undefined"
                :variant="selectedFilter === 'all' ? 'flat' : 'outlined'"
                @click="selectedFilter = 'all'"
              >
                Tất cả
              </VBtn>
              <VBtn
                :color="selectedFilter === 'unread' ? 'warning' : undefined"
                :variant="selectedFilter === 'unread' ? 'flat' : 'outlined'"
                @click="selectedFilter = 'unread'"
              >
                Chưa đọc
              </VBtn>
              <VBtn
                :color="selectedFilter === 'read' ? 'success' : undefined"
                :variant="selectedFilter === 'read' ? 'flat' : 'outlined'"
                @click="selectedFilter = 'read'"
              >
                Đã đọc
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard>
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="text-body-2 text-medium-emphasis">
          Hiển thị {{ filteredNotifications.length }} thông báo phù hợp.
        </div>

        <div class="d-flex flex-wrap gap-2">
          <VBtn
            variant="outlined"
            :disabled="!selectedRows.length"
            prepend-icon="tabler-mail-opened"
            @click="toggleSelectedReadState(true)"
          >
            Đánh dấu đã đọc
          </VBtn>
          <VBtn
            variant="outlined"
            :disabled="!selectedRows.length"
            prepend-icon="tabler-mail"
            @click="toggleSelectedReadState(false)"
          >
            Đánh dấu chưa đọc
          </VBtn>
          <VBtn
            color="error"
            variant="outlined"
            :disabled="!selectedRows.length"
            prepend-icon="tabler-trash"
            @click="deleteSelected"
          >
            Xoá đã chọn
          </VBtn>
        </div>
      </VCardText>

      <VDataTable
        v-model="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="pagedNotifications"
        :items-per-page="itemsPerPage"
        :loading="loading"
        item-value="id"
        show-select
      >
        <template #item.title="{ item }">
          <div
            class="cursor-pointer"
            @click="openDetail(item)"
          >
            <div class="d-flex align-center gap-2">
              <VIcon
                size="10"
                icon="tabler-circle-filled"
                :color="item.isSeen ? 'secondary' : 'primary'"
              />
              <span class="font-weight-medium">{{ item.title }}</span>
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ item.subtitle }}
            </div>
          </div>
        </template>

        <template #item.category="{ item }">
          <VChip
            size="small"
            variant="tonal"
          >
            {{ item.category }}
          </VChip>
        </template>

        <template #item.time="{ item }">
          <span class="text-body-2">{{ item.time || '-' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.isSeen ? 'success' : 'warning'"
            variant="tonal"
          >
            {{ item.isSeen ? 'Đã đọc' : 'Chưa đọc' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <IconBtn @click="openDetail(item)">
              <VIcon icon="tabler-eye" />
            </IconBtn>
            <IconBtn @click="item.isSeen ? markUnread([item.id]) : markRead([item.id])">
              <VIcon :icon="item.isSeen ? 'tabler-mail' : 'tabler-mail-opened'" />
            </IconBtn>
            <IconBtn @click="removeNotification([item.id])">
              <VIcon
                icon="tabler-trash"
                color="error"
              />
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 pa-4">
            <AppSelect
              v-model="itemsPerPage"
              :items="[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 },
              ]"
              style="max-inline-size: 88px;"
            />

            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="filteredNotifications.length"
            />
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VNavigationDrawer
      v-model="drawerOpen"
      location="right"
      temporary
      width="460"
      @update:model-value="value => !value && selectedNotificationId && closeDetail()"
    >
      <div class="pa-5">
        <div class="d-flex align-start justify-space-between gap-3 mb-4">
          <div>
            <div class="text-h6">
              {{ selectedNotification?.title || 'Chi tiết thông báo' }}
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ selectedNotification?.time || '' }}
            </div>
          </div>

          <IconBtn @click="closeDetail">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </div>

        <template v-if="selectedNotification">
          <VChip
            size="small"
            :color="selectedNotification.isSeen ? 'success' : 'warning'"
            variant="tonal"
            class="mb-4"
          >
            {{ selectedNotification.isSeen ? 'Đã đọc' : 'Chưa đọc' }}
          </VChip>

          <div class="text-body-1 mb-4">
            {{ selectedNotification.subtitle }}
          </div>

          <div class="d-flex flex-wrap gap-2 mb-5">
            <VBtn
              color="primary"
              prepend-icon="tabler-arrow-right"
              @click="openTarget"
            >
              Mở chi tiết thay đổi
            </VBtn>
            <VBtn
              variant="outlined"
              :prepend-icon="selectedNotification.isSeen ? 'tabler-mail' : 'tabler-mail-opened'"
              @click="selectedNotification.isSeen ? markUnread([selectedNotification.id]) : markRead([selectedNotification.id])"
            >
              {{ selectedNotification.isSeen ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc' }}
            </VBtn>
          </div>

          <VDivider class="mb-4" />

          <div class="text-subtitle-2 mb-3">
            Thông tin liên quan
          </div>
          <div class="notification-detail-grid">
            <div
              v-for="[key, value] in getNotificationDetailEntries(selectedNotification.raw)"
              :key="key"
              class="notification-detail-item"
            >
              <div class="text-caption text-medium-emphasis mb-1">
                {{ key }}
              </div>
              <div class="text-body-2">
                {{ typeof value === 'object' ? JSON.stringify(value) : value }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </VNavigationDrawer>
  </section>
</template>

<style scoped>
.notification-detail-grid {
  display: grid;
  gap: 12px;
}

.notification-detail-item {
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 12px;
  padding: 12px;
}
</style>
