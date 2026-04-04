<script setup>
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
    showError(err, 'Khong the tai danh sach quyen cho vai tro.')
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
  users: 'Nguoi dung',
  roles: 'Vai tro',
  organizations: 'To chuc',
  permissions: 'Quyen han',
  settings: 'Cau hinh he thong',
  'log-activities': 'Nhat ky hoat dong',
  posts: 'Tin tuc',
  meetings: 'Cuoc hop',
  'my-meetings': 'Lich hop cua toi',
  'meeting-types': 'Loai cuoc hop',
  'attendee-groups': 'Nhom thanh phan tham du',
  'attendee-group-members': 'Thanh vien nhom tham du',
  'meeting-document-types': 'Loai tai lieu hop',
  'meeting-document-fields': 'Linh vuc tai lieu hop',
  documents: 'Tai lieu hop',
  conclusions: 'Ket luan',
  votings: 'Bieu quyet',
  reminders: 'Nhac lich hop',
  checkins: 'Diem danh',
  notifications: 'Thong bao',
  'post-categories': 'Danh muc tin tuc',
}

const actionLabelMap = {
  index: 'Xem danh sach',
  show: 'Xem chi tiet',
  store: 'Tao moi',
  update: 'Cap nhat',
  destroy: 'Xoa',
  stats: 'Thong ke',
  import: 'Nhap du lieu',
  export: 'Xuat du lieu',
  'bulk-destroy': 'Xoa hang loat',
  'bulk-update-status': 'Cap nhat trang thai hang loat',
  tree: 'Xem cay quyen',
  dashboard: 'Xem bang dieu khien',
  'live-control': 'Dieu hanh truc tiep',
  'set-active': 'Dat noi dung dang dien ra',
  approve: 'Duyet',
  reject: 'Tu choi',
  vote: 'Bo phieu',
  open: 'Mo',
  close: 'Dong',
  'qr-checkin': 'Diem danh QR',
  'self-checkin': 'Tu diem danh',
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
        .sort((left, right) => sortByLabel(left.displayLabel, right.displayLabel)),
    }))
    .filter(group => group.permissions.length > 0)
    .sort((left, right) => sortByLabel(left.label, right.label))
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
    showSnackbar('Vui long nhap ten vai tro.', 'warning')

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
      emit('saved', { message: 'Cap nhat vai tro thanh cong.' })
    }
    else {
      await $api('/roles', {
        method: 'POST',
        body,
      })
      emit('saved', { message: 'Tao vai tro thanh cong.' })
    }

    emit('update:isDialogVisible', false)
    refPermissionForm.value?.reset()
  }
  catch (err) {
    console.error('Save role error:', err)
    submitError.value = err?.response?._data?.message || err?.data?.message || err?.message || 'Khong the luu vai tro.'
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
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    scrollable
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard>
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
          {{ isReadonlyMode ? 'CHI TIET VAI TRO' : (roleId ? 'CHINH SUA VAI TRO' : 'TAO MOI VAI TRO') }}
        </h4>
        <span class="text-body-2 text-disabled mt-1">{{ isReadonlyMode ? 'Thong tin va danh sach quyen' : 'Phan quyen' }}</span>
      </VCardTitle>

      <VDivider />

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

          <VRow class="mb-6">
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="role"
                label="Ten vai tro"
                placeholder="Nhap ten vai tro"
                :readonly="isReadonlyMode"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="roleGuardName"
                label="Guard"
                placeholder="web"
                :readonly="isReadonlyMode"
              />
            </VCol>
          </VRow>

          <VAlert
            v-if="normalizedRoleGuardName !== 'web'"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Dialog chi hien thi permission cung guard <strong>{{ normalizedRoleGuardName }}</strong> de tranh loi cap nhat.
          </VAlert>

          <h5 class="text-h5 font-weight-bold mb-4">
            Phan quyen
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
              Khong co permission nao thuoc guard <strong>{{ normalizedRoleGuardName }}</strong>.
            </VAlert>

            <div class="role-perm-header d-flex align-center justify-space-between px-4 py-3 mb-6 mt-4 rounded">
              <span class="text-h6 font-weight-bold">Danh sach quyen</span>
              <VCheckbox
                v-model="isSelectAll"
                :disabled="isReadonlyMode"
                :indeterminate="isIndeterminate"
                label="Chon tat ca"
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
                  label="Chon tat ca"
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
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 d-flex justify-center gap-4">
        <VBtn
          v-if="!isReadonlyMode"
          color="primary"
          :loading="saving"
          min-width="120"
          @click="onSubmit"
        >
          <VIcon
            icon="tabler-check"
            class="me-1"
          />
          {{ roleId ? 'Cap nhat' : 'Tao moi' }}
        </VBtn>

        <VBtn
          color="secondary"
          variant="tonal"
          min-width="120"
          @click="onReset"
        >
          {{ isReadonlyMode ? 'Dong' : 'Huy' }}
        </VBtn>
      </VCardActions>
    </VCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
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
