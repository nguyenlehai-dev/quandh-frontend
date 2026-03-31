<script setup>
import girlUsingMobile from '@images/pages/girl-using-mobile.png'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { fetchRole } from '../services/roleService'

const emit = defineEmits(['changed'])
const { t } = useI18n()

const roles = ref([])
const loading = ref(false)
const editingRole = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(9)
const search = ref('')
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })
const { snackbar, showSuccess, showError } = useActionFeedback()

const itemsPerPageOptions = [
  { title: '6', value: 6 },
  { title: '9', value: 9 },
  { title: '12', value: 12 },
]

const searchLabel = computed(() => {
  const label = t('roles.roles.list.search_label')

  return label === 'roles.roles.list.search_label' ? 'Tim kiem vai tro' : label
})

const searchPlaceholder = computed(() => {
  const placeholder = t('roles.roles.list.search_placeholder')

  return placeholder === 'roles.roles.list.search_placeholder' ? 'Nhap ten vai tro' : placeholder
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await $api('/roles', {
      params: {
        search: search.value || undefined,
        limit: itemsPerPage.value,
        page: page.value,
        ['sort_by']: 'created_at',
        ['sort_order']: 'desc',
      },
    })

    roles.value = (res.data ?? res ?? []).map(role => ({
      id: role.id,
      role: role.name,
      scope: role.scope ?? 'admin',
      guardName: role.guard_name ?? 'api',
      totalUsers: role.users_count ?? 0,
      permissions: role.permissions ?? [],
    }))
    totalItems.value = res.meta?.total ?? roles.value.length

    if (!roles.value.length && totalItems.value > 0 && page.value > 1) {
      page.value = totalPages.value
      await fetchRoles()
    }
  }
  catch (err) {
    console.error('Fetch roles error:', err)
    roles.value = []
    totalItems.value = 0
    showError(err, 'Không thể tải danh sách vai trò.')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => fetchRoles())
watch(page, () => fetchRoles())
watch(itemsPerPage, () => {
  page.value = 1
  fetchRoles()
})
watch(search, () => {
  page.value = 1
  fetchRoles()
})

defineExpose({ refreshRoles: fetchRoles })

const isRoleDialogVisible = ref(false)
const roleDetail = ref({ id: null, name: '', permissions: [] })
const isAddRoleDialogVisible = ref(false)

const editPermission = async item => {
  editingRole.value = true
  roleDetail.value = { id: null, name: '', permissions: [] }
  try {
    const res = await fetchRole(item.id)
    const detail = res.data ?? res

    roleDetail.value = {
      id: detail.id,
      name: detail.name,
      scope: detail.scope ?? item.scope,
      // eslint-disable-next-line camelcase
      guard_name: detail.guard_name ?? item.guardName ?? 'api',
      permissions: detail.permissions ?? item.permissions ?? [],
    }
  }
  catch (err) {
    console.error('Fetch role detail error:', err)
    showError(err, 'Không thể tải chi tiết vai trò.')
  }
  finally {
    editingRole.value = false
    if (roleDetail.value?.id === item.id)
      isRoleDialogVisible.value = true
  }
}

const onRoleSaved = payload => {
  page.value = 1
  if (payload?.message)
    showSuccess(payload.message)

  fetchRoles()
  emit('changed')
}

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return
  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  }
  catch (err) {
    showError(err, 'Không thể thực hiện thao tác này.')
  }
  finally {
    isConfirming.value = false
  }
}

const deleteRole = item => {
  openConfirmDialog({
    title: 'Xóa vai trò',
    message: `Bạn có chắc chắn muốn xóa vai trò "${item.role}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await $api(`/roles/${item.id}`, { method: 'DELETE' })
      showSuccess('Xóa vai trò thành công.')
      fetchRoles()
      emit('changed')
    },
  })
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-4 mb-6">
      <VTextField
        v-model="search"
        :label="searchLabel"
        :placeholder="searchPlaceholder"
        prepend-inner-icon="tabler-search"
        density="comfortable"
        clearable
        style="max-inline-size: 360px;"
      />
      <VBtn
        v-if="$can('create', 'Role')"
        color="primary"
        prepend-icon="tabler-plus"
        @click="isAddRoleDialogVisible = true"
      >
        Thêm vai trò
      </VBtn>
    </div>

    <VRow>
      <!-- Loading -->
      <VCol
        v-if="loading"
        cols="12"
        class="text-center"
      >
        <VProgressCircular indeterminate />
      </VCol>

      <!-- 👉 Roles -->
      <VCol
        v-for="item in roles"
        :key="item.role"
        cols="12"
        sm="6"
        lg="4"
      >
        <VCard class="h-100">
          <VCardText class="pb-3">
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-body-2 text-disabled">{{ t('roles.roles.card.total_users_count', { count: item.totalUsers }) }}</span>
              <IconBtn
                size="small"
                variant="text"
                color="secondary"
              >
                <VIcon
                  icon="tabler-copy"
                  size="20"
                />
              </IconBtn>
            </div>
            <h4 class="text-h4 mb-4 font-weight-bold">
              {{ item.role }}
            </h4>
            <div class="d-flex align-center gap-2">
              <a
                v-if="$can('update', 'Role')"
                href="javascript:void(0)"
                class="text-info font-weight-medium text-body-2 text-decoration-none"
                @click="editPermission(item)"
              >
                {{ editingRole && roleDetail.id === item.id ? t('roles.roles.card.loading') : t('roles.roles.card.edit_role') }}
              </a>
              <IconBtn
                v-if="$can('delete', 'Role')"
                size="small"
                variant="text"
                color="error"
                @click="deleteRole(item)"
              >
                <VIcon
                  icon="tabler-trash"
                  size="18"
                />
              </IconBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 👉 Add New Role -->
      <VCol
        v-if="$can('create', 'Role')"
        cols="12"
        sm="6"
        lg="4"
      >
        <VCard
          class="h-100"
          :ripple="false"
        >
          <VRow
            no-gutters
            class="h-100"
          >
            <VCol
              cols="4"
              class="d-flex flex-column justify-end align-center mt-3"
            >
              <img
                width="85"
                :src="girlUsingMobile"
              >
            </VCol>

            <VCol
              cols="8"
              class="d-flex flex-column align-end justify-center pe-5"
            >
              <VBtn
                size="small"
                variant="outlined"
                color="info"
                class="mb-2"
                @click="isAddRoleDialogVisible = true"
              >
                {{ t('roles.roles.card.create_new_role') }}
              </VBtn>
              <span
                class="text-caption text-end text-disabled"
                style="line-height: 1.2; max-inline-size: 150px;"
              >
                {{ t('roles.roles.card.create_new_role_hint') }}
              </span>
            </VCol>
          </VRow>
        </VCard>
        <AddEditRoleDialog
          v-model:is-dialog-visible="isAddRoleDialogVisible"
          @saved="onRoleSaved"
        />
      </VCol>
    </VRow>

    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mt-6">
      <span class="text-body-2 text-disabled">
        {{ t('roles.roles.list.showing_summary', { shown: roles.length, total: totalItems }) }}
      </span>

      <div class="d-flex align-center gap-4">
        <AppSelect
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          density="compact"
          style="max-inline-size: 88px;"
        />

        <VPagination
          v-model="page"
          :length="totalPages"
          :total-visible="$vuetify.display.smAndDown ? 4 : 7"
        />
      </div>
    </div>

    <AddEditRoleDialog
      v-model:is-dialog-visible="isRoleDialogVisible"
      v-model:role-permissions="roleDetail"
      @saved="onRoleSaved"
    />

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>
