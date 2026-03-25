<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  permissionName: {
    type: String,
    required: false,
    default: '',
  },
  permissionId: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'update:permissionName',
  'saved',
])

const currentPermissionName = ref('')
const currentDescription = ref('')
const saving = ref(false)

const onReset = () => {
  emit('update:isDialogVisible', false)
  currentPermissionName.value = ''
  currentDescription.value = ''
}

const onSubmit = async () => {
  if (!currentPermissionName.value) return

  saving.value = true
  try {
    if (props.permissionId) {
      await $api(`/permissions/${props.permissionId}`, {
        method: 'PUT',
        body: {
          name: currentPermissionName.value,
          description: currentDescription.value,
        },
      })
    }
    else {
      await $api('/permissions', {
        method: 'POST',
        body: {
          name: currentPermissionName.value,
          description: currentDescription.value,
        },
      })
    }

    emit('saved')
    onReset()
  }
  catch (err) {
    console.error('Save permission error:', err)
  }
  finally {
    saving.value = false
  }
}

watch(() => props.isDialogVisible, visible => {
  if (visible) {
    currentPermissionName.value = props.permissionName || ''
    currentDescription.value = ''
  }
})
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
          {{ props.permissionId ? 'Chỉnh sửa' : 'Thêm' }} Quyền
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ props.permissionId ? 'Cập nhật' : 'Thêm mới' }} quyền truy cập.
        </p>

        <VForm @submit.prevent="onSubmit">
          <VAlert
            type="warning"
            title="Lưu ý!"
            variant="tonal"
            class="mb-6"
          >
            <template #text>
              Việc {{ props.permissionId ? 'sửa' : 'thêm' }} quyền có thể ảnh hưởng đến phân quyền hệ thống.
            </template>
          </VAlert>

          <AppTextField
            v-model="currentPermissionName"
            label="Tên quyền"
            placeholder="Ví dụ: users.create"
            class="mb-4"
          />

          <AppTextField
            v-model="currentDescription"
            label="Mô tả"
            placeholder="Mô tả quyền..."
            class="mb-6"
          />

          <div class="d-flex gap-4 justify-center">
            <VBtn
              type="submit"
              :loading="saving"
            >
              {{ props.permissionId ? 'Cập nhật' : 'Thêm mới' }}
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
