<script setup>
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const headers = [
  { title: 'STT', key: 'index', sortable: false, width: 60 },
  { title: 'Người dùng', key: 'causer' },
  { title: 'Hành động', key: 'description' },
  { title: 'Đối tượng', key: 'subject_type' },
  { title: 'Thời gian', key: 'created_at' },
]

const { data: requestData, isFetching: isLoading } = await useApi(createUrl('/activity-logs', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    limit: itemsPerPage,
    page,
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <div class="d-flex align-center gap-3">
          <VIcon
            icon="tabler-history"
            size="24"
            color="primary"
          />
          <h5 class="text-h5 font-weight-bold">
            Nhật ký hoạt động
          </h5>
        </div>
        <VSpacer />
        <AppTextField
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          density="compact"
          style="max-inline-size: 250px;"
        />
      </VCardText>
      <VDivider />
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </section>
</template>
