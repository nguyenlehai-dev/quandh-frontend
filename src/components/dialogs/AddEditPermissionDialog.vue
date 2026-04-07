<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  permissionId: {
    type: Number,
    required: false,
    default: null,
  },
  permissionName: {
    type: String,
    required: false,
    default: '',
  },
  assignedRoles: {
    type: Array,
    required: false,
    default: () => [],
  },
  roleOptions: {
    type: Array,
    required: false,
    default: () => [],
  },
})

const emit = defineEmits([
  'save',
  'update:assignedRoles',
  'update:isDialogVisible',
  'update:permissionName',
])

const refForm = ref()
const currentPermissionName = ref('')
const currentAssignedRoles = ref([])

const dialogTitle = computed(() => props.permissionId ? 'Chỉnh sửa quyền' : 'Thêm mới quyền')
const dialogDescription = computed(() => props.permissionId ? 'Cập nhật thông tin quyền theo nhu cầu vận hành.' : 'Tạo quyền mới và gán cho các vai trò phù hợp.')

const syncFormData = () => {
  currentPermissionName.value = props.permissionName
  currentAssignedRoles.value = [...props.assignedRoles]
}

const onReset = () => {
  emit('update:isDialogVisible', false)
  nextTick(() => {
    refForm.value?.resetValidation()
    syncFormData()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (!valid)
      return

    const payload = {
      id: props.permissionId,
      name: currentPermissionName.value.trim(),
      assignedTo: [...currentAssignedRoles.value],
    }

    emit('update:permissionName', payload.name)
    emit('update:assignedRoles', payload.assignedTo)
    emit('save', payload)
    emit('update:isDialogVisible', false)
  })
}

watch(
  () => [props.isDialogVisible, props.permissionName, props.permissionId, props.assignedRoles],
  ([isDialogVisible]) => {
    if (isDialogVisible)
      syncFormData()
  },
  { immediate: true },
)
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <DialogCloseBtn @click="onReset" />

    <VCard class="pa-2 pa-sm-10">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          {{ dialogTitle }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ dialogDescription }}
        </p>

        <VForm
          ref="refForm"
          validate-on="submit"
        >
          <VAlert
            type="warning"
            title="Lưu ý"
            variant="tonal"
            class="mb-6"
          >
            <template #text>
              Không chỉnh sửa tùy tiện các quyền lõi nếu chưa được duyệt, vì có thể ảnh hưởng luồng phân quyền đang vận hành.
            </template>
          </VAlert>

          <div class="mb-6">
            <AppTextField
              v-model="currentPermissionName"
              label="Tên quyền"
              placeholder="Nhập tên quyền"
              :rules="[requiredValidator]"
            />
          </div>

          <div class="mb-6">
            <AppSelect
              v-model="currentAssignedRoles"
              label="Vai trò được gán"
              placeholder="Chọn vai trò"
              :items="props.roleOptions"
              :rules="[requiredValidator]"
              chips
              closable-chips
              multiple
            />
          </div>

          <div class="d-flex gap-3 justify-end flex-wrap">
            <VBtn
              variant="tonal"
              color="secondary"
              @click="onReset"
            >
              Đóng
            </VBtn>

            <VBtn @click="onSubmit">
              {{ props.permissionId ? 'Lưu thay đổi' : 'Tạo quyền' }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
