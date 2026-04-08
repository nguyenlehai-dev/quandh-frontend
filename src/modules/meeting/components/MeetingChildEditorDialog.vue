<script setup>
const props = defineProps({
  childConfig: {
    type: Object,
    required: true,
  },
  childItem: {
    type: Object,
    default: null,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'save',
  'update:isDialogVisible',
])

const refForm = ref()
const formData = ref({})
const isEditMode = computed(() => Boolean(props.childItem?.id))
const dialogTitle = computed(() => `${isEditMode.value ? 'Cập nhật' : 'Thêm mới'} ${props.childConfig.title.toLowerCase()}`)

const createDefaultForm = () => props.childConfig.fields.reduce((acc, field) => {
  acc[field] = field === 'status' ? props.childConfig.statusOptions?.[0]?.value ?? '' : ''

  return acc
}, { id: null })

const fieldLabel = field => ({
  content: 'Nội dung',
  description: 'Mô tả',
  document_number: 'Số văn bản',
  duration_minutes: 'Thời lượng',
  issued_at: 'Ngày ban hành',
  position: 'Chức vụ',
  remind_at: 'Thời gian nhắc',
  review_note: 'Ghi chú duyệt',
  role: 'Vai trò',
  sort_order: 'Thứ tự',
  status: 'Trạng thái',
  title: 'Tiêu đề',
  type: 'Loại biểu quyết',
  user_id: 'ID người dùng',
}[field] ?? field)

const isLongField = field => ['content', 'description', 'review_note'].includes(field)
const isDateField = field => ['issued_at', 'remind_at'].includes(field)
const isRequired = field => field === props.childConfig.requiredField

const syncForm = () => {
  formData.value = props.childItem
    ? { ...createDefaultForm(), ...props.childItem }
    : createDefaultForm()
  refForm.value?.resetValidation()
}

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const handleSave = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (!valid)
      return

    emit('save', { ...formData.value })
  })
}

watch(() => props.isDialogVisible, isVisible => {
  if (isVisible)
    syncForm()
})

watch(() => props.childItem, syncForm, { immediate: true })
</script>

<template>
  <VDialog
    max-width="820"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard :title="dialogTitle">
      <VCardText>
        <VForm
          ref="refForm"
          validate-on="submit"
          @submit.prevent="handleSave"
        >
          <VRow>
            <VCol
              v-for="field in props.childConfig.fields"
              :key="field"
              cols="12"
              :md="isLongField(field) ? 12 : 6"
            >
              <AppSelect
                v-if="field === 'status' && props.childConfig.statusOptions"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :items="props.childConfig.statusOptions"
              />

              <AppSelect
                v-else-if="field === 'type'"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :items="[
                  { title: 'Công khai', value: 'public' },
                  { title: 'Ẩn danh', value: 'anonymous' },
                ]"
              />

              <AppDateTimePicker
                v-else-if="isDateField(field)"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :placeholder="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
                :config="{ enableTime: field === 'remind_at', altFormat: field === 'remind_at' ? 'd/m/Y H:i' : 'd/m/Y', altInput: true, dateFormat: field === 'remind_at' ? 'Y-m-d H:i:S' : 'Y-m-d' }"
              />

              <AppTextarea
                v-else-if="isLongField(field)"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
                rows="3"
              />

              <AppTextField
                v-else
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3 pt-0">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeDialog"
        >
          Đóng
        </VBtn>

        <VBtn @click="handleSave">
          Lưu
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
