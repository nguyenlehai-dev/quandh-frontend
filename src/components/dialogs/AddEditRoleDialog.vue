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

const fetchPermissions = async () => {
  loadingPermissions.value = true
  try {
    const res = await $api('/permissions', { params: { limit: 999 } })

    allPermissions.value = (res.data ?? []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || p.name,
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
const refPermissionForm = ref()

const checkedCount = computed(() => allPermissions.value.filter(p => p.checked).length)
const isIndeterminate = computed(() => checkedCount.value > 0 && checkedCount.value < allPermissions.value.length)

// Select all toggle
watch(isSelectAll, val => {
  allPermissions.value.forEach(p => {
    p.checked = val
  })
})

watch(isIndeterminate, () => {
  if (!isIndeterminate.value && checkedCount.value === 0)
    isSelectAll.value = false
})

watch(() => checkedCount.value, count => {
  if (count === allPermissions.value.length && count > 0)
    isSelectAll.value = true
})

// When dialog opens, fetch permissions and populate form
watch(() => props.isDialogVisible, async visible => {
  if (visible) {
    await fetchPermissions()

    if (props.rolePermissions?.name) {
      // Edit mode — populate existing data
      role.value = props.rolePermissions.name
      roleId.value = props.rolePermissions.id

      const existingNames = (props.rolePermissions.permissions || []).map(p => p.name || p)

      allPermissions.value.forEach(p => {
        p.checked = existingNames.includes(p.name)
      })
    }
    else {
      // Add mode — reset
      role.value = ''
      roleId.value = null
      allPermissions.value.forEach(p => {
        p.checked = false
      })
    }
  }
})

const onSubmit = async () => {
  if (!role.value) return

  saving.value = true
  try {
    const selectedIds = allPermissions.value.filter(p => p.checked).map(p => p.id)

    if (roleId.value) {
      // Update
      await $api(`/roles/${roleId.value}`, {
        method: 'PUT',
        body: {
          name: role.value,
          permission_ids: selectedIds,
        },
      })
    }
    else {
      // Create
      await $api('/roles', {
        method: 'POST',
        body: {
          name: role.value,
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
  }
  finally {
    saving.value = false
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
  isSelectAll.value = false
  refPermissionForm.value?.reset()
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          {{ roleId ? 'Chỉnh sửa' : 'Thêm' }} Vai trò
        </h4>
        <p class="text-body-1 text-center mb-6">
          Thiết lập quyền cho vai trò
        </p>

        <VForm ref="refPermissionForm">
          <AppTextField
            v-model="role"
            label="Tên vai trò"
            placeholder="Nhập tên vai trò"
          />

          <h5 class="text-h5 my-6">
            Danh sách quyền
          </h5>

          <VProgressLinear
            v-if="loadingPermissions"
            indeterminate
            class="mb-4"
          />

          <VTable
            v-else
            class="permission-table text-no-wrap mb-6"
          >
            <tr>
              <td>
                <h6 class="text-h6">
                  Chọn tất cả
                </h6>
              </td>
              <td>
                <div class="d-flex justify-end">
                  <VCheckbox
                    v-model="isSelectAll"
                    v-model:indeterminate="isIndeterminate"
                    label="Tất cả"
                  />
                </div>
              </td>
            </tr>

            <template
              v-for="permission in allPermissions"
              :key="permission.id"
            >
              <tr>
                <td>
                  <h6 class="text-h6">
                    {{ permission.description }}
                  </h6>
                  <span class="text-caption text-disabled">{{ permission.name }}</span>
                </td>
                <td>
                  <div class="d-flex justify-end">
                    <VCheckbox v-model="permission.checked" />
                  </div>
                </td>
              </tr>
            </template>
          </VTable>

          <div class="d-flex align-center justify-center gap-4">
            <VBtn
              :loading="saving"
              @click="onSubmit"
            >
              {{ roleId ? 'Cập nhật' : 'Tạo mới' }}
            </VBtn>

            <VBtn
              color="secondary"
              variant="tonal"
              @click="onReset"
            >
              Hủy
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.permission-table {
  td {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding-block: 0.5rem;

    .v-checkbox {
      min-inline-size: 4.75rem;
    }

    &:not(:first-child) {
      padding-inline: 0.5rem;
    }

    .v-label {
      white-space: nowrap;
    }
  }
}
</style>
