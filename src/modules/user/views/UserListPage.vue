<script setup>


const { t } = useI18n()

const searchQuery = ref('')
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers
const headers = [
  {
    title: 'Cán bộ',
    key: 'name',
  },
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'Tên đăng nhập',
    key: 'user_name',
  },
  {
    title: 'Trạng thái',
    key: 'status',
  },
  {
    title: 'Hành động',
    key: 'actions',
    sortable: false,
  },
]

const users = ref([])
const totalUsers = ref(0)
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await $api('/users', {
      params: {
        search: searchQuery.value,
        status: selectedStatus.value,
        limit: itemsPerPage.value,
        page: page.value,
        sort_by: sortBy.value,
        sort_order: orderBy.value,
      },
    })

    users.value = res.data ?? []
    totalUsers.value = res.meta?.total ?? res.total ?? 0
  } catch (err) {
    console.error('Fetch users error:', err)
    users.value = []
    totalUsers.value = 0
  } finally {
    loading.value = false
  }
}

// Debounce search/filter changes (500ms) to reduce API calls
watchDebounced([searchQuery, selectedStatus], () => {
  page.value = 1
  fetchUsers()
}, { debounce: 500 })

// Pagination/sort changes fire immediately
watch([itemsPerPage, page, sortBy, orderBy], () => {
  fetchUsers()
})

// Initial fetch
onMounted(() => fetchUsers())

const status = [
  {
    title: 'Đang hoạt động',
    value: 'active',
  },
  {
    title: 'Tạm khóa',
    value: 'inactive',
  },
  {
    title: 'Cấm',
    value: 'banned',
  },
]

const resolveUserStatusVariant = stat => {
  if (!stat) return 'primary'
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'warning'
  if (statLowerCase === 'banned')
    return 'error'
  
  return 'primary'
}

const isAddNewUserDrawerVisible = ref(false)

const newUser = ref({
  name: '',
  user_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  status: 'active',
})

const onSubmitNewUser = async () => {
  try {
    await $api('/users', {
      method: 'POST',
      body: newUser.value,
    })

    isAddNewUserDrawerVisible.value = false
    newUser.value = { name: '', user_name: '', email: '', password: '', password_confirmation: '', status: 'active' }
    fetchUsers()
  } catch (err) {
    console.error('Create user error:', err)
  }
}

const addNewUser = async userData => {
  await $api('/users', {
    method: 'POST',
    body: userData,
  })

  // Refetch User
  fetchUsers()
}

const deleteUser = async id => {
  await $api(`/users/${ id }`, { method: 'DELETE' })

  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)

  // Refetch User
  fetchUsers()
}

const widgetData = ref([
  {
    title: t('user.user.widgets.session'),
    value: '21,459',
    change: 29,
    desc: t('user.user.widgets.total_users'),
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: t('user.user.widgets.paid_users'),
    value: '4,567',
    change: 18,
    desc: t('user.user.widgets.last_week'),
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: t('user.user.widgets.active_users'),
    value: '19,860',
    change: -14,
    desc: t('user.user.widgets.last_week'),
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: t('user.user.widgets.pending_users'),
    value: '237',
    change: 42,
    desc: t('user.user.widgets.last_week'),
    icon: 'tabler-user-search',
    iconColor: 'warning',
  },
])
</script>

<template>
  <div>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template
          v-for="(data, id) in widgetData"
          :key="id"
        >
          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ data.title }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h4 class="text-h4">
                        {{ data.value }}
                      </h4>
                      <div
                        class="text-base"
                        :class="data.change > 0 ? 'text-success' : 'text-error'"
                      >
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
                    </div>
                  </div>
                  <VAvatar
                    :color="data.iconColor"
                    variant="tonal"
                    rounded
                    size="42"
                  >
                    <VIcon
                      :icon="data.icon"
                      size="26"
                    />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ t('common.common.labels.filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Chọn trạng thái"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: t('common.common.labels.all') },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('user.user.list.search')"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            {{ t('common.common.actions.export') }}
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            v-if="$can('create', 'User')"
            prepend-icon="tabler-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            {{ t('user.user.list.add') }}
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="users"
        item-value="id"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- Cán bộ -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              variant="tonal"
              color="primary"
            >
              <span>{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base font-weight-medium">
                {{ item.name }}
              </h6>
              <div class="text-sm text-disabled">
                @{{ item.user_name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status === 'active' ? 'Đang hoạt động' : (item.status === 'banned' ? 'Cấm' : 'Tạm khóa') }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('delete', 'User')"
            @click="deleteUser(item.id)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn>
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>

                  <VListItemTitle>{{ t('common.common.actions.view') }}</VListItemTitle>
                </VListItem>

                <VListItem link>
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.edit') }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="$can('delete', 'User')"
                  @click="deleteUser(item.id)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('common.common.actions.delete') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User Dialog (rendered only when open) -->
    <template v-if="isAddNewUserDrawerVisible">
      <VCard class="mt-6" title="Thêm Cán bộ mới">
        <VCardText>
          <VForm @submit.prevent="onSubmitNewUser">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="newUser.name"
                  :rules="[requiredValidator]"
                  label="Họ và Tên"
                  placeholder="Nguyễn Văn A"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="newUser.user_name"
                  :rules="[requiredValidator]"
                  label="Tên đăng nhập"
                  placeholder="nguyenvana"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="newUser.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="email@example.com"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="newUser.password"
                  :rules="[requiredValidator]"
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="newUser.password_confirmation"
                  :rules="[requiredValidator]"
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="••••••"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="newUser.status"
                  label="Trạng thái"
                  :items="[
                    { title: 'Đang hoạt động', value: 'active' },
                    { title: 'Tạm khóa', value: 'inactive' },
                    { title: 'Cấm', value: 'banned' },
                  ]"
                />
              </VCol>
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Lưu
                </VBtn>
                <VBtn
                  variant="tonal"
                  color="error"
                  @click="isAddNewUserDrawerVisible = false"
                >
                  Hủy
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>


