<script setup>
const headers = [
  {
    title: 'Tên quyền',
    key: 'name',
  },
  {
    title: 'Mô tả',
    key: 'description',
    sortable: false,
  },
  {
    title: 'Ngày tạo',
    key: 'created_at',
    sortable: false,
  },
  {
    title: 'Hành động',
    key: 'actions',
    sortable: false,
  },
]

const search = ref('')

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const isPermissionDialogVisible = ref(false)
const isAddPermissionDialogVisible = ref(false)
const permissionName = ref('')




const permissions = ref([])
const totalPermissions = ref(0)
const loading = ref(false)

const fetchPermissions = async () => {
  loading.value = true
  try {
    const res = await $api('/permissions', {
      params: {
        search: search.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    permissions.value = res.data ?? []
    totalPermissions.value = res.meta?.total ?? res.total ?? 0
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    permissions.value = []
    totalPermissions.value = 0
  }
  finally {
    loading.value = false
  }
}

// Debounce search (500ms)
watchDebounced(search, () => {
  page.value = 1
  fetchPermissions()
}, { debounce: 500 })

// Pagination/sort changes fire immediately
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchPermissions()
})

// Initial fetch
onMounted(() => fetchPermissions())

const editPermission = item => {
  isPermissionDialogVisible.value = true
  permissionName.value = item.name
  editingPermissionId.value = item.id
}

const editingPermissionId = ref(null)

const deletePermission = async id => {
  try {
    await $api(`/permissions/${id}`, { method: 'DELETE' })
    fetchPermissions()
  }
  catch (err) {
    console.error('Delete permission error:', err)
  }
}

const onPermissionSaved = () => {
  fetchPermissions()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex gap-2 align-center">
            <p class="text-body-1 mb-0">
              Show
            </p>
            <AppSelect
              :model-value="itemsPerPage"
              :items="[
                { value: 5, title: '5' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'All' },
              ]"
              style="inline-size: 5.5rem;"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
            />
          </div>

          <div class="d-flex align-center gap-4 flex-wrap">
            <AppTextField
              v-model="search"
              placeholder="Search Permission"
              style="inline-size: 15.625rem;"
            />
            <VBtn
              density="default"
              prepend-icon="tabler-plus"
              @click="isAddPermissionDialogVisible = true"
            >
              Add Permission
            </VBtn>
          </div>
        </VCardText>

        <VDivider />

        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-length="totalPermissions"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
          ]"
          :headers="headers"
          :items="permissions"
          item-value="name"
          class="text-no-wrap"
          @update:options="updateOptions"
        >
          <!-- Name -->
          <template #item.name="{ item }">
            <div class="text-high-emphasis text-body-1">
              {{ item.name }}
            </div>
          </template>

          <!-- Description -->
          <template #item.description="{ item }">
            <div class="text-body-2">
              {{ item.description || '—' }}
            </div>
          </template>

          <!-- Created At -->
          <template #item.created_at="{ item }">
            <div class="text-body-2">
              {{ item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—' }}
            </div>
          </template>

          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalPermissions"
            />
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn
              @click="editPermission(item)"
            >
              <VIcon
                size="22"
                icon="tabler-edit"
              />
            </IconBtn>
            <IconBtn
              @click="deletePermission(item.id)"
            >
              <VIcon
                size="22"
                icon="tabler-trash"
              />
            </IconBtn>
          </template>
        </VDataTableServer>
      </VCard>

      <AddEditPermissionDialog
        v-model:is-dialog-visible="isPermissionDialogVisible"
        v-model:permission-name="permissionName"
        :permission-id="editingPermissionId"
        @saved="onPermissionSaved"
      />
      <AddEditPermissionDialog
        v-model:is-dialog-visible="isAddPermissionDialogVisible"
        @saved="onPermissionSaved"
      />
    </VCol>
  </VRow>
</template>
