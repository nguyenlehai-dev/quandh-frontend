<script setup>
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const headers = [
  { title: 'Người thực hiện', key: 'causer' },
  { title: 'Hành động', key: 'description' },
  { title: 'Đối tượng', key: 'subject_type' },
  { title: 'Thời gian', key: 'created_at' },
  { title: 'Chi tiết', key: 'actions', sortable: false },
]

const logs = ref([])
const totalLogs = ref(0)
const loading = ref(false)

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await $api('/log-activities', {
      params: {
        search: searchQuery.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    logs.value = res.data ?? []
    totalLogs.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch activity logs error:', err)
    logs.value = []
    totalLogs.value = 0
  }
  finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, () => {
  page.value = 1
  fetchLogs()
}, { debounce: 500 })

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchLogs()
})

onMounted(() => fetchLogs())

const resolveActionColor = description => {
  if (!description) return 'info'
  const d = description.toLowerCase()
  if (d.includes('created') || d.includes('tạo')) return 'success'
  if (d.includes('updated') || d.includes('cập nhật')) return 'warning'
  if (d.includes('deleted') || d.includes('xóa')) return 'error'

  return 'info'
}

const formatSubjectType = type => {
  if (!type) return '—'

  // Extract class name from full namespace (e.g. "App\\Models\\User" => "User")
  return type.split('\\').pop()
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Nhật ký hoạt động
        </h5>
        <VSpacer />
        <AppTextField
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          density="compact"
          style="max-inline-size: 250px;"
        >
          <template #prepend-inner>
            <VIcon
              icon="tabler-search"
              size="18"
            />
          </template>
        </AppTextField>
      </VCardText>
      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="logs"
        :items-length="totalLogs"
        :headers="headers"
        :loading="loading"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.causer="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              variant="tonal"
              color="primary"
            >
              <span>{{ item.causer?.name?.charAt(0) ?? '?' }}</span>
            </VAvatar>
            <div class="text-body-1 text-high-emphasis">
              {{ item.causer?.name ?? 'Hệ thống' }}
            </div>
          </div>
        </template>

        <template #item.description="{ item }">
          <VChip
            :color="resolveActionColor(item.description)"
            size="small"
            label
          >
            {{ item.description || '—' }}
          </VChip>
        </template>

        <template #item.subject_type="{ item }">
          <div class="text-body-2">
            {{ formatSubjectType(item.subject_type) }}
            <span
              v-if="item.subject_id"
              class="text-disabled"
            > #{{ item.subject_id }}</span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <div class="text-body-2">
            {{ item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '—' }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalLogs"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
