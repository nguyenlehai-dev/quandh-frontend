<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import girlUsingMobile from '@images/pages/girl-using-mobile.png'
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getCoreErrorMessage, isCoreForbiddenError } from '@/modules/core/utils/coreErrors'
import ExportRoleDialog from '@/modules/role-permission/components/ExportRoleDialog.vue'
import ImportRoleDialog from '@/modules/role-permission/components/ImportRoleDialog.vue'
import {
  bulkDeleteCoreRoles,
  createCoreRole,
  getCoreRole,
  deleteCoreRole,
  downloadCoreRolesExport,
  downloadCoreRolesTemplate,
  getCoreRoles,
  getCoreRoleStats,
  importCoreRoles,
  updateCoreRole,
} from '@/modules/role-permission/services/coreRoles'
import { getCoreUsers } from '@/modules/user-management/services/coreUsers'
import { mapCoreUserToViewModel } from '@/modules/user-management/utils/coreUserAdapters'

const { t } = useI18n()
const fallbackAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6]
const getFallbackAvatar = userId => fallbackAvatars[userId % fallbackAvatars.length]

const roles = ref([])
const users = ref([])
const totalRoles = ref(0)
const isLoading = ref(false)
const isRoleDialogVisible = ref(false)
const isAddRoleDialogVisible = ref(false)
const isImportDialogVisible = ref(false)
const isExportDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const pendingDeleteRole = ref(null)
const selectedRoleIds = ref([])
const selectedBulkAction = ref()
const roleDetail = ref({
  id: null,
  name: '',
  permissionIds: [],
  permissionNames: [],
})
const { isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()
const bulkActions = computed(() => [
  { title: t('Delete selected roles'), value: 'delete' },
])

const toggleRoleSelection = (roleId, isSelected) => {
  if (isSelected) {
    selectedRoleIds.value = [...new Set([...selectedRoleIds.value, roleId])]

    return
  }

  selectedRoleIds.value = selectedRoleIds.value.filter(id => id !== roleId)
}

const roleCards = computed(() => roles.value.map(role => {
  const roleUsers = users.value.filter(user => user.roleIds.includes(role.id))

  return {
    details: {
      id: role.id,
      name: role.name,
      permissionIds: [],
      permissionNames: role.permissions ?? [],
    },
    role: role.name,
    totalUsers: roleUsers.length,
    users: roleUsers.map(user => ({
      avatar: user.avatar || getFallbackAvatar(user.id),
      fullName: user.fullName,
      id: user.id,
    })),
  }
}))

const loadUsers = async () => {
  let currentPage = 1
  let lastPage = 1
  const nextUsers = []

  do {
    const response = await getCoreUsers({
      limit: 100,
      page: currentPage,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    })

    nextUsers.push(...(response.data ?? []).map(mapCoreUserToViewModel))
    lastPage = response.meta?.last_page ?? 1
    currentPage += 1
  } while (currentPage <= lastPage)

  users.value = nextUsers
}

const loadRoles = async () => {
  const response = await getCoreRoles({
    limit: 100,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  roles.value = response.data ?? []
}

const loadRoleStats = async () => {
  const response = await getCoreRoleStats()

  totalRoles.value = response?.data?.total ?? 0
}

const refreshRoleCards = async () => {
  isLoading.value = true

  try {
    const results = await Promise.allSettled([
      loadRoles(),
      loadRoleStats(),
      loadUsers(),
    ])

    const failedResult = results.find(result => result.status === 'rejected')

    if (failedResult?.reason) {
      showSnackbar(
        isCoreForbiddenError(failedResult.reason)
          ? 'Tài khoản hiện tại không có quyền truy cập dữ liệu vai trò.'
          : getCoreErrorMessage(failedResult.reason, 'Không thể tải dữ liệu vai trò.'),
        'error',
      )
    }
  }
  finally {
    isLoading.value = false
  }
}

const editPermission = async role => {
  if (!role?.id) {
    roleDetail.value = { ...role }
    isRoleDialogVisible.value = true

    return
  }

  const response = await getCoreRole(role.id)
  const roleData = response?.data ?? role

  roleDetail.value = {
    id: roleData.id,
    name: roleData.name,
    permissionIds: [],
    permissionNames: roleData.permissions ?? [],
  }
  isRoleDialogVisible.value = true
}

const requestDeleteRole = role => {
  pendingDeleteRole.value = role
  isDeleteDialogVisible.value = true
}

const saveRole = async payload => {
  const requestBody = {
    guard_name: 'web',
    name: payload.name,
    permission_ids: payload.permissionIds,
  }

  if (payload.id) {
    await updateCoreRole(payload.id, requestBody)
    showSnackbar('Đã cập nhật vai trò thành công.')
  }
  else {
    await createCoreRole(requestBody)
    showSnackbar('Đã tạo vai trò mới thành công.')
  }

  await refreshRoleCards()
}

const confirmDeleteRole = async isConfirmed => {
  if (!isConfirmed || !pendingDeleteRole.value)
    return

  try {
    if (Array.isArray(pendingDeleteRole.value?.ids)) {
      await bulkDeleteCoreRoles(pendingDeleteRole.value.ids)
      selectedRoleIds.value = []
      selectedBulkAction.value = undefined
      showSnackbar('Đã xóa các vai trò đã chọn.')
    }
    else {
      await deleteCoreRole(pendingDeleteRole.value.id)
      showSnackbar('Đã xóa vai trò thành công.')
    }

    await refreshRoleCards()
  }
  catch (error) {
    showSnackbar(error?.data?.message || 'Không thể xóa vai trò này.', 'error')
  }
  finally {
    pendingDeleteRole.value = null
  }
}

const handleBulkAction = action => {
  if (action === 'delete' && selectedRoleIds.value.length)
    requestDeleteRole({ ids: [...selectedRoleIds.value] })
}

const handleImportRoles = async file => {
  await importCoreRoles(file)
  await refreshRoleCards()
  showSnackbar('Đã nhập dữ liệu vai trò thành công.')
}

const handleDownloadRoleTemplate = async () => {
  await downloadCoreRolesTemplate()
}

const handleExportRoles = async () => {
  await downloadCoreRolesExport({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 100,
  })
  showSnackbar('Đã xuất dữ liệu vai trò thành công.')
}

onMounted(() => {
  refreshRoleCards()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex flex-wrap align-center gap-4">
          <AppSelect
            v-if="selectedRoleIds.length"
            v-model="selectedBulkAction"
            :placeholder="$t('Action')"
            :items="bulkActions"
            style="inline-size: 15rem;"
            @update:model-value="handleBulkAction"
          />

          <div>
            <div class="text-body-2 text-medium-emphasis mb-1">
              {{ $t('Total Roles') }}
            </div>
            <div class="text-h4">
              {{ totalRoles }}
            </div>
          </div>

          <VSpacer />

          <div class="d-flex gap-3 flex-wrap">
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-download"
              @click="isImportDialogVisible = true"
            >
              {{ $t('Import') }}
            </VBtn>

            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-upload"
              @click="isExportDialogVisible = true"
            >
              {{ $t('Export') }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      v-for="item in roleCards"
      :key="item.role"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard :loading="isLoading">
        <VCardText class="pb-0 d-flex justify-end">
          <VCheckbox
            :model-value="selectedRoleIds.includes(item.details.id)"
            hide-details
            @update:model-value="value => toggleRoleSelection(item.details.id, value)"
          />
        </VCardText>

        <VCardText class="d-flex align-center pb-4">
          <div class="text-body-1">
            {{ $t('Total {count} users', { count: item.totalUsers }) }}
          </div>

          <VSpacer />

          <div class="v-avatar-group">
            <template
              v-for="(user, index) in item.users"
              :key="`${item.role}-${user.id}`"
            >
              <VAvatar
                v-if="item.users.length > 4 ? index < 3 : index < item.users.length"
                size="40"
                :image="user.avatar"
              />
            </template>
            <VAvatar
              v-if="item.totalUsers > 3"
              :color="$vuetify.theme.current.dark ? '#373B50' : '#EEEDF0'"
            >
              <span>+{{ item.totalUsers - 3 }}</span>
            </VAvatar>
          </div>
        </VCardText>

        <VCardText>
          <div class="d-flex justify-space-between align-center">
            <div>
              <h5 class="text-h5">
                {{ item.role }}
              </h5>
              <div class="d-flex align-center">
                <a
                  href="javascript:void(0)"
                  @click="editPermission(item.details)"
                >
                  {{ $t('Edit role') }}
                </a>
              </div>
            </div>
            <IconBtn>
              <VIcon icon="tabler-dots-vertical" class="text-high-emphasis" />
              <VMenu activator="parent">
                <VList>
                  <VListItem
                    prepend-icon="tabler-pencil"
                    @click="editPermission(item.details)"
                  >
                    {{ $t('Edit') }}
                  </VListItem>

                  <VListItem
                    prepend-icon="tabler-trash"
                    @click="requestDeleteRole(item.details)"
                  >
                    {{ $t('Delete') }}
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
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
            cols="5"
            class="d-flex flex-column justify-end align-center mt-5"
          >
            <img
              width="85"
              :src="girlUsingMobile"
            >
          </VCol>

          <VCol cols="7">
            <VCardText class="d-flex flex-column align-end justify-end gap-4">
              <VBtn
                size="small"
                @click="isAddRoleDialogVisible = true"
              >
                {{ $t('Add New Role') }}
              </VBtn>
              <div class="text-end">
                {{ $t('Add a new role if it does not already exist in the system.') }}
              </div>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>

  <AddEditRoleDialog
    v-model:is-dialog-visible="isAddRoleDialogVisible"
    @save="saveRole"
  />

    <AddEditRoleDialog
      v-model:is-dialog-visible="isRoleDialogVisible"
      v-model:role-permissions="roleDetail"
      @save="saveRole"
    />

    <ImportRoleDialog
      v-model:is-dialog-visible="isImportDialogVisible"
      @download-template="handleDownloadRoleTemplate"
      @import="handleImportRoles"
    />

    <ExportRoleDialog
      v-model:is-dialog-visible="isExportDialogVisible"
      @export="handleExportRoles"
    />

  <ConfirmDialog
      v-model:is-dialog-visible="isDeleteDialogVisible"
      :confirmation-question="$t('Are you sure you want to delete this role?')"
      :confirm-title="$t('Deleted')"
      :confirm-msg="$t('The role has been removed from the system.')"
      :cancel-title="$t('Cancelled')"
      :cancel-msg="$t('The role remains unchanged.')"
      @confirm="confirmDeleteRole"
  />

  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    timeout="2400"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>
