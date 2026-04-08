<script setup>
import { MEETING_STATUS_OPTIONS } from '@/modules/meeting/configs/meetingOptions'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  meeting: {
    type: Object,
    default: null,
  },
  meetingTypes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'save',
  'update:isDialogVisible',
])

const refForm = ref()
const formData = ref({})
const isEditMode = computed(() => Boolean(props.meeting?.id))
const dialogTitle = computed(() => isEditMode.value ? 'Cập nhật cuộc họp' : 'Thêm mới cuộc họp')

const createDefaultForm = () => ({
  id: null,
  meetingTypeId: null,
  code: '',
  title: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  status: 'draft',
})

const syncForm = () => {
  formData.value = props.meeting
    ? { ...createDefaultForm(), ...props.meeting }
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

watch(() => props.meeting, syncForm, { immediate: true })
</script>

<template>
  <VDialog
    max-width="900"
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
              cols="12"
              md="8"
            >
              <AppTextField
                v-model="formData.title"
                label="Tên module"
                placeholder="Ví dụ: Họp không giấy"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model="formData.code"
                label="Mã cuộc họp"
                placeholder="HOP-2026-001"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meetingTypeId"
                label="Loại cuộc họp"
                placeholder="Chọn loại cuộc họp"
                :items="props.meetingTypes"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formData.location"
                label="Địa điểm"
                placeholder="Phòng họp A"
              />
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <AppDateTimePicker
                v-model="formData.startAt"
                label="Thời gian bắt đầu"
                placeholder="Chọn thời gian"
                :rules="[requiredValidator]"
                :config="{ enableTime: true, altFormat: 'd/m/Y H:i', altInput: true, dateFormat: 'Y-m-d H:i:S' }"
              />
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <AppDateTimePicker
                v-model="formData.endAt"
                label="Thời gian kết thúc"
                placeholder="Chọn thời gian"
                :config="{ enableTime: true, altFormat: 'd/m/Y H:i', altInput: true, dateFormat: 'Y-m-d H:i:S' }"
              />
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <AppSelect
                v-model="formData.status"
                label="Trạng thái"
                :items="MEETING_STATUS_OPTIONS"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                placeholder="Nội dung tổng quan cuộc họp"
                rows="3"
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
