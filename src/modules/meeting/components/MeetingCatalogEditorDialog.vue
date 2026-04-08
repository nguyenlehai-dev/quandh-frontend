<script setup>
import { CATALOG_STATUS_OPTIONS } from '@/modules/meeting/configs/meetingOptions'

const props = defineProps({
  catalogConfig: {
    type: Object,
    required: true,
  },
  catalogItem: {
    type: Object,
    default: null,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  isReadOnly: {
    type: Boolean,
    default: false,
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

const { t } = useI18n()

const refForm = ref()
const formData = ref({})
const isEditMode = computed(() => Boolean(props.catalogItem?.id))

const dialogTitle = computed(() => {
  if (props.isReadOnly)
    return t('meeting.common.viewItem', { item: props.catalogConfig.singularTitle })

  return t(isEditMode.value ? 'meeting.common.updateItem' : 'meeting.common.createItem', { item: props.catalogConfig.singularTitle })
})

const createDefaultForm = () => ({
  id: null,
  meetingTypeId: null,
  name: '',
  position: '',
  description: '',
  status: 'active',
})

const syncForm = () => {
  formData.value = props.catalogItem
    ? { ...createDefaultForm(), ...props.catalogItem }
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

watch(() => props.catalogItem, syncForm, { immediate: true })
</script>

<template>
  <VDialog
    max-width="760"
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
              :md="props.catalogConfig.usesPosition ? 6 : 8"
            >
              <AppTextField
                v-model="formData.name"
                :label="t('meeting.fields.module_name')"
                :placeholder="props.catalogConfig.title"
                :rules="[requiredValidator]"
                :readonly="props.isReadOnly"
              />
            </VCol>

            <VCol
              v-if="props.catalogConfig.usesPosition"
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formData.position"
                :label="t('meeting.fields.position')"
                :placeholder="t('meeting.placeholders.positionExample')"
                :readonly="props.isReadOnly"
              />
            </VCol>

            <VCol
              cols="12"
              :md="props.catalogConfig.usesPosition ? 6 : 4"
            >
              <AppSelect
                v-model="formData.status"
                :label="t('meeting.fields.status')"
                :items="CATALOG_STATUS_OPTIONS"
                :readonly="props.isReadOnly"
              />
            </VCol>

            <VCol
              v-if="props.catalogConfig.usesMeetingType"
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meetingTypeId"
                :label="t('meeting.fields.meeting_type')"
                :placeholder="t('meeting.placeholders.selectMeetingType')"
                :items="props.meetingTypes"
                clearable
                clear-icon="tabler-x"
                :readonly="props.isReadOnly"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                :label="t('meeting.fields.description')"
                rows="3"
                :readonly="props.isReadOnly"
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
          {{ t('meeting.common.close') }}
        </VBtn>

        <VBtn
          v-if="!props.isReadOnly"
          @click="handleSave"
        >
          {{ t('meeting.common.save') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
