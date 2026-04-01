<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'

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
const isEditMode = computed(() => !!props.permissionId)
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const onReset = () => {
  emit('update:isDialogVisible', false)
  currentPermissionName.value = ''
  currentDescription.value = ''
}

const onSubmit = async () => {
  if (!currentPermissionName.value.trim()) {
    showSnackbar('Vui lòng nhập mã quyền.', 'warning')

    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await $api(`/permissions/${props.permissionId}`, {
        method: 'PUT',
        body: {
          name: currentPermissionName.value.trim(),
          description: currentDescription.value,
        },
      })
      showSuccess('Cập nhật quyền hạn thành công.')
    }
    else {
      await $api('/permissions', {
        method: 'POST',
        body: {
          name: currentPermissionName.value.trim(),
          description: currentDescription.value,
        },
      })
      showSuccess('Tạo quyền hạn thành công.')
    }

    emit('saved')
    onReset()
  }
  catch (err) {
    console.error('Save permission error:', err)
    showError(err, 'Không thể lưu quyền hạn.')
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
          {{ isEditMode ? 'Chi tiết quyền hạn' : 'Thêm quyền hạn' }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ isEditMode ? 'Xem mã hệ thống và cập nhật mô tả chức năng.' : 'Khai báo mã quyền và mô tả chức năng mới.' }}
        </p>

        <VForm @submit.prevent="onSubmit">
          <VAlert
            type="info"
            title="Lưu ý"
            variant="tonal"
            class="mb-6"
          >
            <template #text>
              <span v-if="isEditMode">
                Mã quyền là cố định. Bạn có thể tự do chỉnh sửa <b>Mô tả</b> để giải thích chi tiết chức năng này cho các Admin khác hiểu.
              </span>
              <span v-else>
                Mã quyền nên theo chuẩn <b>resource.action</b>, ví dụ: <b>users.store</b>, <b>permissions.export</b>.
              </span>
            </template>
          </VAlert>

          <AppTextField
            v-model="currentPermissionName"
            :label="isEditMode ? 'Mã quyền hệ thống (Không được sửa)' : 'Mã quyền hệ thống'"
            placeholder="Ví dụ: users.create"
            class="mb-4"
            :disabled="isEditMode"
            hint="Mã này kết nối trực tiếp với Database va ma nguon."
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
              {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
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

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </VDialog>
</template>
