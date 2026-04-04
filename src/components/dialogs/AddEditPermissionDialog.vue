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
      'guard_name': 'api',
      description: '',
      'sort_order': 0,
      'parent_id': null,
    }),
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
  'guard_name': 'api',
  description: '',
  'sort_order': 0,
  'parent_id': null,
})

const saving = ref(false)
const isEditMode = computed(() => !!currentPermission.value.id)
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const syncState = () => {
  currentPermission.value = {
    id: props.permissionItem?.id ?? null,
    name: props.permissionItem?.name ?? '',
    'guard_name': props.permissionItem?.guard_name ?? 'api',
    description: props.permissionItem?.description ?? '',
    'sort_order': props.permissionItem?.sort_order ?? 0,
    'parent_id': props.permissionItem?.parent_id ?? null,
  }
}

const onReset = () => {
  emit('update:isDialogVisible', false)
}

const onSubmit = async () => {
  if (!currentPermission.value.name.trim()) {
    showSnackbar('Vui long nhap ma quyen.', 'warning')

    return
  }

  saving.value = true
  try {
    const payload = {
      name: currentPermission.value.name.trim(),
      'guard_name': currentPermission.value.guard_name?.trim() || 'api',
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
          {{ isEditMode ? 'Chinh sua quyen han' : 'Them quyen han' }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ isEditMode ? 'Cap nhat thong tin va cau truc cay quyen han.' : 'Khai bao ma quyen va thong tin hien thi moi.' }}
        </p>

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
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="currentPermission.guard_name"
                label="Guard"
                placeholder="api"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="currentPermission.description"
                label="Mo ta"
                placeholder="Mo ta ro quyen han nay dung de lam gi"
                rows="3"
                auto-grow
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
              />
            </VCol>
          </VRow>

          <div class="d-flex gap-4 justify-center mt-6">
            <VBtn
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
              Huy
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
