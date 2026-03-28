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
  permissionDescription: {
    type: String,
    required: false, 
    default: '',
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
    currentDescription.value = props.permissionDescription || ''
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
          Chi tiết quyền hạn
        </h4>
        <p class="text-body-1 text-center mb-6">
          Xem mã hệ thống và cập nhật mô tả chức năng.
        </p>

        <VForm @submit.prevent="onSubmit">
          <VAlert
            type="info"
            title="Lưu ý"
            variant="tonal"
            class="mb-6"
          >
            <template #text>
              Mã quyền là cố định. Bạn có thể tự do chỉnh sửa <b>Mô tả</b> để giải thích chi tiết chức năng này cho các Admin khác hiểu.
            </template>
          </VAlert>

          <AppTextField
            v-model="currentPermissionName"
            label="Mã quyền hệ thống (Không được sửa)"
            placeholder="Ví dụ: users.create"
            class="mb-4"
            disabled
            hint="Mã này kết nối trực tiếp với Database & Mã nguồn."
            persistent-hint
          />

          <AppTextarea
            v-model="currentDescription"
            label="Mô tả chức năng"
            placeholder="Mô tả cụ thể quyền này dùng để làm gì cho người dùng biết (Ví dụ: Cho phép kế toán xem biểu đồ...)"
            class="mb-6 mt-4"
            rows="3"
            auto-grow
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
