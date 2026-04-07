<script setup>
import { getCorePermissionTree } from '@/modules/role-permission/services/corePermissions'
import { buildPermissionGroupsFromTree, buildPermissionNameIdLookup } from '@/modules/role-permission/utils/coreAccessAdapters'

const props = defineProps({
  rolePermissions: {
    type: Object,
    required: false,
    default: () => ({
      id: null,
      name: '',
      permissionNames: [],
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'save',
  'update:isDialogVisible',
  'update:rolePermissions',
])

const refPermissionForm = ref()
const isSelectAll = ref(false)
const isLoading = ref(false)
const roleName = ref('')
const selectedPermissionIds = ref([])
const permissionTree = ref([])

const permissionGroups = computed(() => buildPermissionGroupsFromTree(permissionTree.value))
const permissionNameIdLookup = computed(() => buildPermissionNameIdLookup(permissionTree.value))
const permissionCount = computed(() => permissionGroups.value.reduce((count, group) => count + group.permissions.length, 0))
const checkedCount = computed(() => selectedPermissionIds.value.length)
const isIndeterminate = computed(() => checkedCount.value > 0 && checkedCount.value < permissionCount.value)

const syncFormData = () => {
  roleName.value = props.rolePermissions?.name ?? ''
  selectedPermissionIds.value = (props.rolePermissions?.permissionNames ?? [])
    .map(permissionName => permissionNameIdLookup.value[permissionName])
    .filter(Boolean)
}

const loadPermissionTree = async () => {
  if (permissionTree.value.length)
    return

  isLoading.value = true

  try {
    const response = await getCorePermissionTree()

    permissionTree.value = response.data ?? []
    syncFormData()
  }
  finally {
    isLoading.value = false
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
  nextTick(() => {
    refPermissionForm.value?.resetValidation()
    syncFormData()
  })
}

const onSubmit = async () => {
  const { valid } = await refPermissionForm.value.validate()

  if (!valid)
    return

  const nextRolePermissions = {
    id: props.rolePermissions?.id ?? null,
    name: roleName.value.trim(),
    permissionIds: [...selectedPermissionIds.value],
    permissionNames: Object.entries(permissionNameIdLookup.value)
      .filter(([, permissionId]) => selectedPermissionIds.value.includes(permissionId))
      .map(([permissionName]) => permissionName),
  }

  emit('update:rolePermissions', nextRolePermissions)
  emit('save', nextRolePermissions)
  emit('update:isDialogVisible', false)
}

watch(isSelectAll, value => {
  if (!permissionCount.value)
    return

  selectedPermissionIds.value = value
    ? permissionGroups.value.flatMap(group => group.permissions.map(permission => permission.id))
    : []
})

watch(
  () => selectedPermissionIds.value,
  value => {
    if (value.length === permissionCount.value && permissionCount.value)
      isSelectAll.value = true
    else if (!value.length)
      isSelectAll.value = false
  },
  { deep: true },
)

watch(
  () => props.isDialogVisible,
  async isDialogVisible => {
    if (!isDialogVisible)
      return

    await loadPermissionTree()
    syncFormData()
  },
  { immediate: true },
)
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 960"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          {{ props.rolePermissions?.id ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới' }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          Đồng bộ danh sách quyền truy cập của vai trò theo Core API.
        </p>

        <VForm
          ref="refPermissionForm"
          validate-on="submit"
        >
          <AppTextField
            v-model="roleName"
            class="mb-6"
            label="Tên vai trò"
            placeholder="Nhập tên vai trò"
            :rules="[requiredValidator]"
          />

          <VTable class="permission-table text-no-wrap mb-6">
            <thead>
              <tr>
                <th class="text-uppercase">
                  Nhóm quyền
                </th>
                <th class="text-uppercase">
                  Danh sách quyền
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <h6 class="text-h6">
                    Tất cả quyền
                  </h6>
                </td>
                <td>
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-model="isSelectAll"
                      :indeterminate="isIndeterminate"
                      label="Chọn tất cả"
                    />
                  </div>
                </td>
              </tr>

              <tr
                v-for="group in permissionGroups"
                :key="group.id"
              >
                <td style="inline-size: 18rem;">
                  <div class="d-flex flex-column">
                    <h6 class="text-h6">
                      {{ group.title }}
                    </h6>
                    <span class="text-sm text-medium-emphasis">
                      {{ group.description || group.permissions.length + ' quyền' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-x-4 gap-y-2">
                    <VCheckbox
                      v-for="permission in group.permissions"
                      :key="permission.id"
                      v-model="selectedPermissionIds"
                      :label="permission.description || permission.name"
                      :value="permission.id"
                      hide-details
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>

          <div class="d-flex align-center justify-center gap-4">
            <VBtn
              :loading="isLoading"
              @click="onSubmit"
            >
              {{ props.rolePermissions?.id ? 'Lưu thay đổi' : 'Tạo vai trò' }}
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
  td,
  th {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding-block: 0.75rem;
    vertical-align: top;
  }
}
</style>
