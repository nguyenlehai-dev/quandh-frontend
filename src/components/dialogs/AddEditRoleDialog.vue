<script setup>
import { useI18n } from 'vue-i18n'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { useActionFeedback } from '@/composables/useActionFeedback'

const props = defineProps({
  rolePermissions: {
    type: Object,
    required: false,
    default: () => ({
      id: null,
      name: '',
      permissions: [],
      'guard_name': 'web',
    }),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'update:rolePermissions',
  'saved',
])

const { t } = useI18n()
const { snackbar, showError, showSnackbar } = useActionFeedback()

const allPermissions = ref([])
const loadingPermissions = ref(false)
const saving = ref(false)
const submitError = ref('')

const role = ref('')
const roleId = ref(null)
const roleGuardName = ref('web')
const permissionSearch = ref('')
const isSelectAll = ref(false)
const refPermissionForm = ref()

const fetchPermissions = async () => {
  loadingPermissions.value = true
  try {
    const response = await $api('/permissions', {
      params: {
        limit: 100,
        'sort_by': 'sort_order',
        'sort_order': 'asc',
      },
    })

    allPermissions.value = (response.data ?? [])
      .filter(permission => !permission.name?.startsWith('group:'))
      .map(permission => ({
        id: permission.id,
        name: permission.name,
        guardName: permission.guard_name ?? 'web',
        checked: false,
      }))
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    allPermissions.value = []
    showError(err, t('roles.roles.dialog.messages.fetch_permissions_error'))
  }
  finally {
    loadingPermissions.value = false
  }
}

const normalizedRoleGuardName = computed(() => String(roleGuardName.value || 'web').trim() || 'web')
const availablePermissions = computed(() => allPermissions.value.filter(permission => permission.guardName === normalizedRoleGuardName.value))
const checkedCount = computed(() => availablePermissions.value.filter(permission => permission.checked).length)
const isIndeterminate = computed(() => checkedCount.value > 0 && checkedCount.value < availablePermissions.value.length)
const isReadonlyMode = computed(() => props.readonly)

watch(isSelectAll, value => {
  if (isReadonlyMode.value)
    return

  availablePermissions.value.forEach(permission => {
    permission.checked = value
  })
})

watch(() => checkedCount.value, count => {
  if (!count) {
    isSelectAll.value = false

    return
  }

  if (count === availablePermissions.value.length)
    isSelectAll.value = true
})

const groupLabelMap = {
  dashboards: 'Bảng điều khiển',
  users: 'Người dùng',
  roles: 'Vai trò',
  organizations: 'Tổ chức',
  permissions: 'Quyền hạn',
  settings: 'Cấu hình hệ thống',
  'log-activities': 'Nhật ký hoạt động',
  'post-categories': 'Danh mục tin tức',
  posts: 'Tin tức',
  meetings: 'Cuộc họp',
  'meeting-participants': 'Thành phần họp',
  'meeting-agendas': 'Chương trình họp',
  'meeting-documents': 'Tài liệu họp',
  'meeting-conclusions': 'Kết luận họp',
  'meeting-speech-requests': 'Đăng ký phát biểu',
  'meeting-votings': 'Biểu quyết họp',
  'meeting-personal-notes': 'Ghi chú cá nhân',
  'meeting-reminders': 'Nhắc lịch họp',
  'meeting-types': 'Loại cuộc họp',
  'attendee-groups': 'Nhóm thành phần tham dự',
  'attendee-group-members': 'Thành viên nhóm thành phần',
  'meeting-document-types': 'Loại tài liệu họp',
  'meeting-document-fields': 'Lĩnh vực tài liệu họp',
  'my-meetings': 'Lịch họp của tôi',
  // fallback placeholders
  documents: 'Tài liệu',
  conclusions: 'Kết luận',
  votings: 'Biểu quyết',
  reminders: 'Nhắc lịch họp',
  checkins: 'Điểm danh',
  notifications: 'Thông báo',
}

const actionLabelMap = {
  system: 'Tổng quan hệ thống',
  business: 'Tổng quan nghiệp vụ',
  index: 'Xem danh sách',
  show: 'Xem chi tiết',
  store: 'Tạo mới',
  update: 'Cập nhật',
  destroy: 'Xóa',
  stats: 'Thống kê',
  import: 'Nhập dữ liệu',
  export: 'Xuất dữ liệu',
  tree: 'Xem cây quyền',
  dashboard: 'Xem bảng điều khiển',
  'live-control': 'Điều hành trực tiếp',
  'bulk-destroy': 'Xóa hàng loạt',
  'bulk-update-status': 'Cập nhật trạng thái hàng loạt',
  'set-active': 'Đặt nội dung đang diễn ra',
  approve: 'Duyệt',
  reject: 'Từ chối',
  vote: 'Bỏ phiếu',
  open: 'Mở',
  close: 'Đóng',
  'qr-checkin': 'Điểm danh QR',
  'self-checkin': 'Tự điểm danh',
  checkin: 'Điểm danh',
  reorder: 'Sắp xếp lại',
  results: 'Xem kết quả',
  'change-status': 'Đổi trạng thái',
  'speech-request': 'Đăng ký phát biểu',
  note: 'Ghi chú cá nhân',
}

const groupOrder = Object.keys(groupLabelMap)
const actionOrder = Object.keys(actionLabelMap)

const getGroupSortIndex = groupName => {
  const index = groupOrder.indexOf(groupName)
  return index === -1 ? 999 : index
}

const getActionSortIndex = actionName => {
  const index = actionOrder.indexOf(actionName)
  return index === -1 ? 999 : index
}

const sortByLabel = (left, right) => left.localeCompare(right, 'vi', { sensitivity: 'base' })

const humanizePermissionPart = value => {
  const normalized = String(value || '').trim()
  if (!normalized)
    return ''

  return normalized
    .split(/[-_.]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const permissionGroups = computed(() => {
  const groups = {}
  const keyword = String(permissionSearch.value || '').trim().toLowerCase()

  availablePermissions.value.forEach(permission => {
    const [groupName = permission.name, actionName = ''] = permission.name.split('.')

    if (!groups[groupName]) {
      groups[groupName] = {
        name: groupName,
        label: groupLabelMap[groupName] || humanizePermissionPart(groupName),
        permissions: [],
      }
    }

    const actionLabel = actionLabelMap[actionName] || humanizePermissionPart(actionName) || permission.name

    groups[groupName].permissions.push({
      permission,
      displayLabel: actionName
        ? `${actionLabel} ${groupLabelMap[groupName] || humanizePermissionPart(groupName)}`.trim()
        : (groupLabelMap[groupName] || humanizePermissionPart(groupName) || permission.name),
    })
  })

  return Object.values(groups)
    .map(group => ({
      ...group,
      permissions: group.permissions
        .filter(item => {
          if (!keyword)
            return true

          return item.displayLabel.toLowerCase().includes(keyword)
            || item.permission.name.toLowerCase().includes(keyword)
            || group.label.toLowerCase().includes(keyword)
        })
        .sort((left, right) => {
          const actionL = left.permission.name.split('.')[1] || ''
          const actionR = right.permission.name.split('.')[1] || ''
          const indexL = getActionSortIndex(actionL)
          const indexR = getActionSortIndex(actionR)
          if (indexL !== indexR) return indexL - indexR
          return sortByLabel(left.displayLabel, right.displayLabel)
        }),
    }))
    .filter(group => group.permissions.length > 0)
    .sort((left, right) => {
      const indexL = getGroupSortIndex(left.name)
      const indexR = getGroupSortIndex(right.name)
      if (indexL !== indexR) return indexL - indexR
      return sortByLabel(left.label, right.label)
    })
})

const isGroupChecked = group => group.permissions.length > 0 && group.permissions.every(item => item.permission.checked)

const isGroupIndeterminate = group => {
  const checked = group.permissions.filter(item => item.permission.checked).length

  return checked > 0 && checked < group.permissions.length
}

const toggleGroup = (group, value) => {
  if (isReadonlyMode.value)
    return

  group.permissions.forEach(item => {
    item.permission.checked = value
  })
}

const syncDialogState = () => {
  submitError.value = ''
  permissionSearch.value = ''
  isSelectAll.value = false

  if (props.rolePermissions?.name) {
    role.value = props.rolePermissions.name
    roleId.value = props.rolePermissions.id
    roleGuardName.value = props.rolePermissions.guard_name || 'web'

    const selectedNames = (props.rolePermissions.permissions || []).map(permission => permission.name || permission)

    allPermissions.value.forEach(permission => {
      permission.checked = selectedNames.includes(permission.name)
    })

    return
  }

  role.value = ''
  roleId.value = null
  roleGuardName.value = 'web'
  allPermissions.value.forEach(permission => {
    permission.checked = false
  })
}

watch(() => props.isDialogVisible, async visible => {
  if (!visible)
    return

  await fetchPermissions()
  syncDialogState()
})

const onSubmit = async () => {
  if (isReadonlyMode.value) {
    onReset()

    return
  }

  const roleName = role.value?.trim()
  if (!roleName) {
    showSnackbar(t('roles.roles.dialog.messages.validation_name'), 'warning')

    return
  }

  saving.value = true
  submitError.value = ''

  try {
    const selectedIds = availablePermissions.value
      .filter(permission => permission.checked)
      .map(permission => permission.id)

    const body = {
      name: roleName,
      'guard_name': normalizedRoleGuardName.value,
      'permission_ids': selectedIds,
    }

    if (roleId.value) {
      await $api(`/roles/${roleId.value}`, {
        method: 'PUT',
        body,
      })
      emit('saved', { message: t('roles.roles.dialog.messages.update_success') })
    }
    else {
      await $api('/roles', {
        method: 'POST',
        body,
      })
      emit('saved', { message: t('roles.roles.dialog.messages.create_success') })
    }

    emit('update:isDialogVisible', false)
    refPermissionForm.value?.reset()
  }
  catch (err) {
    console.error('Save role error:', err)
    submitError.value = err?.response?._data?.message || err?.data?.message || err?.message || t('roles.roles.dialog.messages.save_error')
    showError(err, submitError.value)
  }
  finally {
    saving.value = false
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
  submitError.value = ''
  permissionSearch.value = ''
  isSelectAll.value = false
  refPermissionForm.value?.reset()
}
</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDialogVisible"
    temporary
    location="end"
    :width="$vuetify.display.smAndDown ? 360 : 760"
    class="role-drawer"
    @update:model-value="val => emit('update:isDialogVisible', val)"
  >
    <VForm
      ref="refPermissionForm"
      class="d-flex flex-column h-100"
      @submit.prevent="onSubmit"
    >
      <AppDrawerHeaderSection
        :title="isReadonlyMode ? t('roles.roles.dialog.title_detail') : (roleId ? t('roles.roles.dialog.title_edit') : t('roles.roles.dialog.title_create'))"
        @cancel="onReset"
      />

      <VDivider />

    <PerfectScrollbar
      class="role-drawer__scroll"
      :options="{ wheelPropagation: false }"
    >
      <VCard
        flat
        class="role-drawer__card"
      >
        <VCardText class="pt-6">
          <VAlert
              v-if="submitError"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ submitError }}
            </VAlert>

            <VRow class="mb-6">
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="role"
                  :label="t('roles.roles.dialog.fields.name')"
                  :placeholder="t('roles.roles.dialog.placeholders.name')"
                  :readonly="isReadonlyMode"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="roleGuardName"
                  :label="t('roles.roles.dialog.fields.guard_name')"
                  :placeholder="t('roles.roles.dialog.placeholders.guard_name')"
                  :readonly="isReadonlyMode"
                />
              </VCol>
            </VRow>

            <VAlert
              v-if="normalizedRoleGuardName !== 'web'"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              {{ t('roles.roles.dialog.messages.guard_warning', { guard: normalizedRoleGuardName }) }}
            </VAlert>

            <h5 class="text-h5 font-weight-bold mb-4">
              {{ t('roles.roles.dialog.sections.permissions') }}
            </h5>

            <VProgressLinear
              v-if="loadingPermissions"
              indeterminate
              class="mb-4"
            />

            <template v-else>
              <VAlert
                v-if="availablePermissions.length === 0"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ t('roles.roles.dialog.messages.no_permissions_for_guard', { guard: normalizedRoleGuardName }) }}
              </VAlert>

              <div class="role-perm-header d-flex align-center justify-space-between px-4 py-3 mb-6 mt-4 rounded">
                <span class="text-h6 font-weight-bold">{{ t('roles.roles.dialog.sections.permission_list') }}</span>
                <VCheckbox
                  v-model="isSelectAll"
                  :disabled="isReadonlyMode"
                  :indeterminate="isIndeterminate"
                  :label="t('roles.roles.dialog.actions.select_all')"
                  hide-details
                  density="compact"
                />
              </div>

              <AppTextField
                v-model="permissionSearch"
                :label="t('roles.roles.dialog.fields.permission_search')"
                :placeholder="t('roles.roles.dialog.placeholders.permission_search')"
                prepend-inner-icon="tabler-search"
                class="mb-4"
              />

              <div
                v-for="group in permissionGroups"
                :key="group.name"
                class="role-perm-group mb-6"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <h6 class="text-h6 font-weight-bold">
                    {{ group.label }}
                  </h6>
                  <VCheckbox
                    :model-value="isGroupChecked(group)"
                    :disabled="isReadonlyMode"
                    :indeterminate="isGroupIndeterminate(group)"
                    :label="t('roles.roles.dialog.actions.select_all')"
                    hide-details
                    density="compact"
                    @update:model-value="toggleGroup(group, $event)"
                  />
                </div>

                <VRow dense>
                  <VCol
                    v-for="permission in group.permissions"
                    :key="permission.permission.id"
                    cols="12"
                    sm="6"
                    class="py-1"
                  >
                    <VCheckbox
                      v-model="permission.permission.checked"
                      :label="permission.displayLabel"
                      :disabled="isReadonlyMode"
                      hide-details
                      density="compact"
                      class="ms-2"
                    />
                  </VCol>
                </VRow>

                <VDivider class="mt-5" />
              </div>
            </template>

        </VCardText>
      </VCard>
    </PerfectScrollbar>

    <VDivider />

    <div class="pa-4 d-flex justify-start gap-4 flex-shrink-0 bg-surface">
      <VBtn
        v-if="!isReadonlyMode"
        color="primary"
        :loading="saving"
        min-width="120"
        type="submit"
      >
        <VIcon
          icon="tabler-check"
          class="me-1"
        />
        {{ roleId ? t('roles.roles.dialog.actions.update') : t('roles.roles.dialog.actions.create') }}
      </VBtn>

      <VBtn
        color="secondary"
        variant="tonal"
        min-width="120"
        @click="onReset"
      >
        {{ isReadonlyMode ? t('roles.roles.dialog.actions.close') : t('roles.roles.dialog.actions.cancel') }}
      </VBtn>
    </div>
  </VForm>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </VNavigationDrawer>
</template>

<style lang="scss">
.role-drawer {
  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.role-drawer__scroll {
  flex: 1 1 auto;
  min-block-size: 0;
  block-size: 100%;
}

.role-drawer__card {
  min-block-size: 100%;
}

.role-perm-header {
  border: 1px solid rgba(var(--v-theme-primary-darken-1), 0.2);
  background: rgba(var(--v-theme-primary-darken-1), 0.08);
}

.role-perm-group {
  .v-checkbox {
    .v-label {
      color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
      font-size: 0.875rem;
      white-space: normal;
    }
  }
}
</style>
