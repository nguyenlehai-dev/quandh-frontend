<script setup>
import { VForm } from 'vuetify/components/VForm'

const props = defineProps({
  rolePermissions: {
    type: Object,
    required: false,
    default: () => ({
      id: null,
      name: '',
      permissions: [],
    }),
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

// Permission list from API
const allPermissions = ref([])
const loadingPermissions = ref(false)
const saving = ref(false)
const submitError = ref('')

const fetchPermissions = async () => {
  loadingPermissions.value = true
  try {
    const res = await $api('/permissions', { params: { limit: 999 } })

    allPermissions.value = (res.data ?? [])
      .filter(p => !p.name.startsWith('group:'))
      .map(p => ({
        id: p.id,
        name: p.name,
        guardName: p.guard_name ?? 'api',
        description: p.description || p.name,
        parentId: p.parent_id,
        checked: false,
      }))
  }
  catch (err) {
    console.error('Fetch permissions error:', err)
    allPermissions.value = []
  }
  finally {
    loadingPermissions.value = false
  }
}

const isSelectAll = ref(false)
const role = ref('')
const roleId = ref(null)
const roleScope = ref('admin')
const roleGuardName = ref('api')
const permissionSearch = ref('')
const refPermissionForm = ref()

const scopeOptions = [
  { title: 'Trong quản trị', value: 'admin' },
  { title: 'Ngoài quản trị', value: 'user' },
]

const availablePermissions = computed(() => allPermissions.value.filter(p => p.guardName === roleGuardName.value))
const checkedCount = computed(() => availablePermissions.value.filter(p => p.checked).length)
const isIndeterminate = computed(() => checkedCount.value > 0 && checkedCount.value < availablePermissions.value.length)

// Select all toggle
watch(isSelectAll, val => {
  availablePermissions.value.forEach(p => {
    p.checked = val
  })
})

watch(isIndeterminate, () => {
  if (!isIndeterminate.value && checkedCount.value === 0)
    isSelectAll.value = false
})

watch(() => checkedCount.value, count => {
  if (count === availablePermissions.value.length && count > 0)
    isSelectAll.value = true
})

// ─── Preset permissions per scope ────────────────
// "Trong quản trị" → tất cả quyền quản trị hệ thống
// "Ngoài quản trị" → chỉ quyền xem nội dung cơ bản
const scopePresets = {
  admin: {
    // Các nhóm được tick TẤT CẢ quyền
    fullGroups: ['users', 'roles', 'organizations', 'permissions', 'settings', 'log-activities'],

    // Các nhóm chỉ tick quyền đọc (index, show, stats)
    readGroups: ['meetings', 'posts', 'documents', 'document-types', 'post-categories'],
  },
  user: {
    fullGroups: [],
    readGroups: ['meetings', 'posts', 'documents', 'post-categories'],
  },
}

const readActions = ['index', 'show', 'stats']

const applyScopePreset = scope => {
  const preset = scopePresets[scope]
  if (!preset) return

  availablePermissions.value.forEach(p => {
    const dotIndex = p.name.indexOf('.')
    const prefix = dotIndex > -1 ? p.name.substring(0, dotIndex) : p.name
    const action = dotIndex > -1 ? p.name.substring(dotIndex + 1) : ''

    if (preset.fullGroups.includes(prefix)) {
      p.checked = true
    }
    else if (preset.readGroups.includes(prefix)) {
      p.checked = readActions.includes(action)
    }
    else {
      p.checked = false
    }
  })
}

// Watch scope change — only apply preset for NEW roles (not editing)
watch(roleScope, newScope => {
  if (!roleId.value && allPermissions.value.length > 0) {
    applyScopePreset(newScope)
  }
})

// ─── Vietnamese label map for permission groups ─────
const groupLabelMap = {
  users: 'Quản lý người dùng',
  roles: 'Quản lý vai trò',
  organizations: 'Quản lý tổ chức',
  permissions: 'Quản lý quyền hạn',
  posts: 'Quản lý tin tức',
  settings: 'Quản lý cấu hình',
  'log-activities': 'Quản lý nhật ký',
  'report-periods': 'Quản lý đợt báo cáo',
  'report-templates': 'Quản lý mẫu báo cáo',
  reports: 'Quản lý danh sách báo cáo',
  meetings: 'Quản lý cuộc họp',
  documents: 'Quản lý tài liệu',
  'document-types': 'Quản lý loại tài liệu',
  'post-categories': 'Quản lý danh mục tin tức',
  'issuing-agencies': 'Quản lý cơ quan ban hành',
  'issuing-levels': 'Quản lý cấp ban hành',
  'document-signers': 'Quản lý người ký',
  'document-fields': 'Quản lý lĩnh vực',
}

// ─── Vietnamese label map for permission actions ─────
const actionLabelMap = {
  index: 'Truy cập danh sách',
  show: 'Xem chi tiết',
  store: 'Tạo mới',
  update: 'Cập nhật',
  destroy: 'Xóa',
  stats: 'Thống kê',
  import: 'Nhập dữ liệu',
  export: 'Xuất dữ liệu',
  bulkDestroy: 'Xóa hàng loạt',
  bulkUpdateStatus: 'Cập nhật trạng thái hàng loạt',
  review: 'Xem xét',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
  assignPermissions: 'Phân quyền',
}

const sortByLabel = (left, right) => left.localeCompare(right, 'vi', { sensitivity: 'base' })

// Tree/Group logic
const permissionGroups = computed(() => {
  const groups = {}

  availablePermissions.value.forEach(p => {
    // Split "users.index" → prefix="users", action="index"
    const dotIndex = p.name.indexOf('.')
    const prefix = dotIndex > -1 ? p.name.substring(0, dotIndex) : p.name
    const action = dotIndex > -1 ? p.name.substring(dotIndex + 1) : ''

    if (!groups[prefix]) {
      groups[prefix] = {
        name: prefix,
        label: groupLabelMap[prefix] || (p.description.includes(' - ') ? p.description.split(' - ')[0] : prefix),
        permissions: [],
      }
    }

    // Build a nice Vietnamese description for each permission
    const groupLabel = groups[prefix].label
    const actionLabel = actionLabelMap[action] || (p.description.includes(' - ') ? p.description.split(' - ').slice(1).join(' - ') : p.description)

    // Build the full description like "Truy cập danh sách người dùng"
    const groupNoun = groupLabel.replace(/^Quản lý\s*/i, '')

    groups[prefix].permissions.push({
      ...p,
      displayLabel: `${actionLabel} ${groupNoun}`.trim(),
    })
  })

  return Object.values(groups)
    .map(group => ({
      ...group,
      permissions: group.permissions
        .filter(permission => {
          if (!permissionSearch.value) return true

          const keyword = permissionSearch.value.toLowerCase()

          return permission.displayLabel.toLowerCase().includes(keyword)
            || permission.name.toLowerCase().includes(keyword)
        })
        .sort((left, right) => sortByLabel(left.displayLabel, right.displayLabel)),
    }))
    .filter(group => {
      if (!permissionSearch.value) return true

      const keyword = permissionSearch.value.toLowerCase()

      return group.label.toLowerCase().includes(keyword) || group.permissions.length > 0
    })
    .sort((left, right) => sortByLabel(left.label, right.label))
})

const isGroupChecked = group => {
  return group.permissions.length > 0 && group.permissions.every(p => p.checked)
}

const isGroupIndeterminate = group => {
  const checked = group.permissions.filter(p => p.checked).length

  return checked > 0 && checked < group.permissions.length
}

const toggleGroup = (group, val) => {
  group.permissions.forEach(p => p.checked = val)
}

// When dialog opens, fetch permissions and populate form
watch(() => props.isDialogVisible, async visible => {
  if (visible) {
    submitError.value = ''
    await fetchPermissions()

    if (props.rolePermissions?.name) {
      // Edit mode
      role.value = props.rolePermissions.name
      roleId.value = props.rolePermissions.id
      roleScope.value = props.rolePermissions.scope || 'admin'
      roleGuardName.value = props.rolePermissions.guard_name || 'api'
      permissionSearch.value = ''

      const existingNames = (props.rolePermissions.permissions || []).map(p => p.name || p)

      allPermissions.value.forEach(p => {
        p.checked = existingNames.includes(p.name)
      })
    }
    else {
      // Add mode — apply default preset
      role.value = ''
      roleId.value = null
      roleScope.value = 'admin'
      roleGuardName.value = 'api'
      permissionSearch.value = ''
      allPermissions.value.forEach(p => {
        p.checked = false
      })
      applyScopePreset('admin')
    }
  }
})

const onSubmit = async () => {
  if (!role.value) return

  saving.value = true
  submitError.value = ''
  try {
    const selectedIds = availablePermissions.value.filter(p => p.checked).map(p => p.id)

    if (roleId.value) {
      await $api(`/roles/${roleId.value}`, {
        method: 'PUT',
        body: {
          name: role.value,
          scope: roleScope.value,
          // eslint-disable-next-line camelcase
          guard_name: roleGuardName.value,
          // eslint-disable-next-line camelcase
          permission_ids: selectedIds,
        },
      })
    }
    else {
      await $api('/roles', {
        method: 'POST',
        body: {
          name: role.value,
          scope: roleScope.value,
          // eslint-disable-next-line camelcase
          guard_name: roleGuardName.value,
          // eslint-disable-next-line camelcase
          permission_ids: selectedIds,
        },
      })
    }

    emit('saved')
    emit('update:isDialogVisible', false)
    isSelectAll.value = false
    refPermissionForm.value?.reset()
  }
  catch (err) {
    console.error('Save role error:', err)
    submitError.value = err?.response?._data?.message || err?.data?.message || err?.message || 'Không thể cập nhật vai trò.'
  }
  finally {
    saving.value = false
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
  isSelectAll.value = false
  submitError.value = ''
  refPermissionForm.value?.reset()
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    scrollable
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard>
      <!-- ─── Header ─────────────────────────────── -->
      <VCardTitle class="d-flex align-center justify-center flex-column pt-8 pb-4">
        <VAvatar
          color="info"
          variant="tonal"
          size="48"
          class="mb-3"
        >
          <VIcon
            icon="tabler-shield-check"
            size="26"
          />
        </VAvatar>
        <h4 class="text-h4 text-uppercase font-weight-bold">
          {{ roleId ? 'CHỈNH SỬA VAI TRÒ' : 'TẠO MỚI VAI TRÒ' }}
        </h4>
        <span class="text-body-2 text-disabled mt-1">Phân quyền</span>
      </VCardTitle>

      <VDivider />

      <!-- ─── Scrollable body ────────────────────── -->
      <VCardText
        class="pt-6"
        style="max-block-size: 65vh; overflow-y: auto;"
      >
        <VForm ref="refPermissionForm">
          <VAlert
            v-if="submitError"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ submitError }}
          </VAlert>

          <!-- ─── Role name + Scope ─────────────── -->
          <VRow class="mb-6">
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="role"
                label="Tên vai trò"
                placeholder="Nhập tên vai trò"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="roleScope"
                :items="scopeOptions"
                label="Vai trò dành cho"
                placeholder="Chọn phạm vi"
              />
            </VCol>
          </VRow>

          <VAlert
            v-if="roleGuardName !== 'api'"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Vai trò này đang dùng guard <strong>{{ roleGuardName }}</strong>. Dialog chỉ hiển thị permission cùng guard để tránh lỗi cập nhật.
          </VAlert>

          <!-- ─── Permission section ────────────── -->
          <h5 class="text-h5 font-weight-bold mb-4">
            Phân quyền
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
              Không có permission nào thuộc guard <strong>{{ roleGuardName }}</strong>.
            </VAlert>

            <div class="role-perm-header d-flex align-center justify-space-between px-4 py-3 mb-6 mt-4 rounded">
              <span class="text-h6 font-weight-bold">Quyền Quản trị viên</span>
              <VCheckbox
                v-model="isSelectAll"
                :indeterminate="isIndeterminate"
                label="Chọn tất cả"
                hide-details
                density="compact"
              />
            </div>

            <AppTextField
              v-model="permissionSearch"
              label="Tim kiem quyen"
              placeholder="Nhap ten quyen hoac nhom quyen"
              prepend-inner-icon="tabler-search"
              class="mb-4"
            />

            <!-- Permission groups -->
            <div
              v-for="group in permissionGroups"
              :key="group.name"
              class="role-perm-group mb-6"
            >
              <!-- Group header -->
              <div class="d-flex align-center justify-space-between mb-3 bg-var-theme-background">
                <h6 class="text-h6 font-weight-bold">
                  {{ group.label }}
                </h6>
                <VCheckbox
                  :model-value="isGroupChecked(group)"
                  :indeterminate="isGroupIndeterminate(group)"
                  label="Chọn tất cả"
                  hide-details
                  density="compact"
                  @update:model-value="toggleGroup(group, $event)"
                />
              </div>

              <!-- Permissions grid (2 columns) -->
              <VRow dense>
                <VCol
                  v-for="permission in group.permissions"
                  :key="permission.id"
                  cols="12"
                  sm="6"
                  class="py-1"
                >
                  <VCheckbox
                    v-model="permission.checked"
                    :label="permission.displayLabel"
                    hide-details
                    density="compact"
                    class="ms-2"
                  />
                </VCol>
              </VRow>

              <VDivider class="mt-5" />
            </div>
          </template>
        </VForm>
      </VCardText>

      <!-- ─── Actions ────────────────────────────── -->
      <VDivider />
      <VCardActions class="pa-4 d-flex justify-center gap-4">
        <VBtn
          color="primary"
          :loading="saving"
          min-width="120"
          @click="onSubmit"
        >
          <VIcon
            icon="tabler-check"
            class="me-1"
          />
          {{ roleId ? 'Cập nhật' : 'Tạo mới' }}
        </VBtn>

        <VBtn
          color="secondary"
          variant="tonal"
          min-width="120"
          @click="onReset"
        >
          Hủy
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.role-perm-header {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.08);
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
