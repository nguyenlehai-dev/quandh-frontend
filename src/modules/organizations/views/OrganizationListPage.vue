<script setup>
import AddEditOrganizationDialog from '@/components/dialogs/AddEditOrganizationDialog.vue'

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
  { title: 'Tên tổ chức', key: 'name' },
  { title: 'Mô tả', key: 'description' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Ngày tạo', key: 'created_at' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const organizations = ref([])
const totalOrganizations = ref(0)
const loading = ref(false)

const fetchOrganizations = async () => {
  loading.value = true
  try {
    const res = await $api('/organizations', {
      params: {
        search: searchQuery.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    organizations.value = res.data ?? []
    totalOrganizations.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch organizations error:', err)
    organizations.value = []
    totalOrganizations.value = 0
  }
  finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, () => {
  page.value = 1
  fetchOrganizations()
}, { debounce: 500 })

watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchOrganizations()
})

onMounted(() => fetchOrganizations())

// CRUD dialog
const isDialogVisible = ref(false)
const editingOrganization = ref(null)

const openAddDialog = () => {
  editingOrganization.value = null
  isDialogVisible.value = true
}

const openEditDialog = item => {
  editingOrganization.value = { ...item }
  isDialogVisible.value = true
}

const deleteOrganization = async id => {
  await $api(`/organizations/${id}`, { method: 'DELETE' })
  fetchOrganizations()
}

const onSaved = () => {
  fetchOrganizations()
}

const resolveStatusVariant = status => {
  if (status === 'active') return { color: 'success', text: 'Hoạt động' }

  return { color: 'error', text: 'Ngừng' }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Tổ chức
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
        <VBtn
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Thêm mới
        </VBtn>
      </VCardText>
      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="organizations"
        :items-length="totalOrganizations"
        :headers="headers"
        :loading="loading"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.name="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.name }}
          </div>
        </template>

        <template #item.description="{ item }">
          <div class="text-body-2">
            {{ item.description || '—' }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="resolveStatusVariant(item.status).color"
            size="small"
            label
          >
            {{ resolveStatusVariant(item.status).text }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          <div class="text-body-2">
            {{ item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—' }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <IconBtn @click="openEditDialog(item)">
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn @click="deleteOrganization(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalOrganizations"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <AddEditOrganizationDialog
      v-model:is-dialog-visible="isDialogVisible"
      :organization="editingOrganization"
      @saved="onSaved"
    />
  </div>
</template>
