<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  organization: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'saved',
])

const form = ref({
  name: '',
  description: '',
  status: 'active',
})

const saving = ref(false)

watch(() => props.isDialogVisible, visible => {
  if (visible && props.organization) {
    form.value = {
      name: props.organization.name || '',
      description: props.organization.description || '',
      status: props.organization.status || 'active',
    }
  }
  else if (visible) {
    form.value = { name: '', description: '', status: 'active' }
  }
})

const onSubmit = async () => {
  if (!form.value.name) return

  saving.value = true
  try {
    if (props.organization?.id) {
      await $api(`/organizations/${props.organization.id}`, {
        method: 'PUT',
        body: form.value,
      })
    }
    else {
      await $api('/organizations', {
        method: 'POST',
        body: form.value,
      })
    }

    emit('saved')
    emit('update:isDialogVisible', false)
  }
  catch (err) {
    console.error('Save organization error:', err)
  }
  finally {
    saving.value = false
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
}
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
          {{ props.organization?.id ? 'Chỉnh sửa' : 'Thêm' }} Tổ chức
        </h4>

        <VForm @submit.prevent="onSubmit">
          <AppTextField
            v-model="form.name"
            label="Tên tổ chức"
            placeholder="Nhập tên tổ chức"
            class="mb-4"
          />

          <AppTextField
            v-model="form.description"
            label="Mô tả"
            placeholder="Mô tả..."
            class="mb-4"
          />

          <AppSelect
            v-model="form.status"
            label="Trạng thái"
            :items="[
              { title: 'Hoạt động', value: 'active' },
              { title: 'Ngừng hoạt động', value: 'inactive' },
            ]"
            class="mb-6"
          />

          <div class="d-flex gap-4 justify-center">
            <VBtn
              type="submit"
              :loading="saving"
            >
              {{ props.organization?.id ? 'Cập nhật' : 'Tạo mới' }}
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
