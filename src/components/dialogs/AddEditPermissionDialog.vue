<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  permissionItem: {
    type: Object,
    required: false,
    default: () => ({
      id: null,
      name: '',
      'guard_name': 'web',
      description: '',
      'sort_order': 0,
      'parent_id': null,
    }),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  parentOptions: {
    type: Array,
    required: false,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'saved',
])

const currentPermission = ref({
  id: null,
  name: '',
  'guard_name': 'web',
  description: '',
  'sort_order': 0,
  'parent_id': null,
})

const saving = ref(false)
const isEditMode = computed(() => !!currentPermission.value.id)
const isReadonlyMode = computed(() => props.readonly)
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const permissionGroupLabelMap = {
  users: 'Nguoi dung',
  roles: 'Vai tro',
  organizations: 'To chuc',
  permissions: 'Quyen han',
  settings: 'Cau hinh he thong',
  'log-activities': 'Nhat ky hoat dong',
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
}

const permissionActionLabelMap = {
  index: 'Xem danh sach',
  show: 'Xem chi tiet',
  store: 'Tao moi',
  update: 'Cap nhat',
  destroy: 'Xoa',
  stats: 'Xem thong ke',
  import: 'Nhap du lieu',
  export: 'Xuat du lieu',
  tree: 'Xem cay quyen',
  dashboard: 'Xem bang dieu khien',
  'live-control': 'Dieu hanh truc tiep',
  'bulk-destroy': 'Xoa hang loat',
  'bulk-update-status': 'Cap nhat trang thai hang loat',
  'set-active': 'Dat noi dung dang dien ra',
  approve: 'Duyet',
  reject: 'Tu choi',
  vote: 'Bo phieu',
  open: 'Mo',
  close: 'Dong',
  'qr-checkin': 'Diem danh QR',
  'self-checkin': 'Tu diem danh',
}

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

const getPermissionGroupLabel = groupName => permissionGroupLabelMap[groupName] || humanizePermissionPart(groupName)

const displayPermissionName = computed(() => {
  const permissionName = currentPermission.value.name
  if (!permissionName)
    return ''

  if (permissionName.startsWith('group:'))
    return getPermissionGroupLabel(permissionName.replace('group:', ''))

  const [groupName = permissionName, actionName = ''] = permissionName.split('.')
  const groupLabel = getPermissionGroupLabel(groupName)
  const actionLabel = permissionActionLabelMap[actionName] || humanizePermissionPart(actionName)

  return actionName ? `${actionLabel} ${groupLabel}`.trim() : groupLabel
})

const syncState = () => {
  currentPermission.value = {
    id: props.permissionItem?.id ?? null,
    name: props.permissionItem?.name ?? '',
    'guard_name': props.permissionItem?.guard_name ?? 'web',
    description: props.permissionItem?.description ?? '',
    'sort_order': props.permissionItem?.sort_order ?? 0,
    'parent_id': props.permissionItem?.parent_id ?? null,
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
}

const onSubmit = async () => {
  if (isReadonlyMode.value) {
    onReset()

    return
  }

  if (!currentPermission.value.name.trim()) {
    showSnackbar('Vui long nhap ma quyen.', 'warning')

    return
  }

  saving.value = true
  try {
    const payload = {
      name: currentPermission.value.name.trim(),
      'guard_name': currentPermission.value.guard_name?.trim() || 'web',
      description: currentPermission.value.description || '',
      'sort_order': Number(currentPermission.value.sort_order || 0),
      'parent_id': currentPermission.value.parent_id || null,
    }

    if (isEditMode.value) {
      await $api(`/permissions/${currentPermission.value.id}`, {
        method: 'PUT',
        body: payload,
      })
      showSuccess('Cap nhat quyen han thanh cong.')
    }
    else {
      await $api('/permissions', {
        method: 'POST',
        body: payload,
      })
      showSuccess('Tao quyen han thanh cong.')
    }

    emit('saved')
    onReset()
  }
  catch (err) {
    console.error('Save permission error:', err)
    showError(err, 'Khong the luu quyen han.')
  }
  finally {
    saving.value = false
  }
}

watch(() => props.isDialogVisible, visible => {
  if (visible)
    syncState()
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard class="pa-2 pa-sm-8">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          {{ isReadonlyMode ? 'Chi tiet quyen han' : (isEditMode ? 'Chinh sua quyen han' : 'Them quyen han') }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ isReadonlyMode ? 'Xem thong tin va cau truc cay cua quyen han.' : (isEditMode ? 'Cap nhat thong tin va cau truc cay quyen han.' : 'Khai bao ma quyen va thong tin hien thi moi.') }}
        </p>

        <VAlert
          v-if="displayPermissionName"
          type="info"
          variant="tonal"
          class="mb-6"
        >
          <div class="d-flex flex-column gap-1">
            <span class="text-subtitle-2 font-weight-bold">{{ displayPermissionName }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ currentPermission.name }}</span>
          </div>
        </VAlert>

        <VForm @submit.prevent="onSubmit">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="currentPermission.name"
                label="Ma quyen he thong"
                placeholder="Vi du: permissions.export"
                :readonly="isReadonlyMode"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="currentPermission.guard_name"
                label="Guard"
                placeholder="web"
                :readonly="isReadonlyMode"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="currentPermission.description"
                label="Mo ta"
                placeholder="Mo ta ro quyen han nay dung de lam gi"
                rows="3"
                auto-grow
                :readonly="isReadonlyMode"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="currentPermission.sort_order"
                type="number"
                label="Thu tu hien thi"
                placeholder="0"
                :readonly="isReadonlyMode"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="currentPermission.parent_id"
                :items="props.parentOptions"
                label="Quyen cha"
                placeholder="Chon quyen cha"
                clearable
                :readonly="isReadonlyMode"
                :disabled="isReadonlyMode"
              />
            </VCol>
          </VRow>

          <div class="d-flex gap-4 justify-center mt-6">
            <VBtn
              v-if="!isReadonlyMode"
              type="submit"
              :loading="saving"
            >
              {{ isEditMode ? 'Cap nhat' : 'Them moi' }}
            </VBtn>
            <VBtn
              color="secondary"
              variant="tonal"
              @click="onReset"
            >
              {{ isReadonlyMode ? 'Dong' : 'Huy' }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </VDialog>
</template>
