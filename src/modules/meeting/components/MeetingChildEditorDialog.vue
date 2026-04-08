<script setup>
const props = defineProps({
  childConfig: {
    type: Object,
    required: true,
  },
  meetingItems: {
    type: Array,
    default: () => [],
  },
  selectItems: {
    type: Object,
    default: () => ({}),
  },
  childItem: {
    type: Object,
    default: null,
  },
  isReadOnly: {
    type: Boolean,
    default: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  lockMeeting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'save',
  'update:isDialogVisible',
])

const { t } = useI18n()

const refForm = ref()
const formData = ref({})
const isEditMode = computed(() => Boolean(props.childItem?.id))

const dialogTitle = computed(() => {
  if (props.isReadOnly)
    return t('meeting.common.viewItem', { item: props.childConfig.title.toLowerCase() })

  return t(isEditMode.value ? 'meeting.common.updateItem' : 'meeting.common.createItem', { item: props.childConfig.title.toLowerCase() })
})

const createDefaultForm = () => props.childConfig.fields.reduce((acc, field) => {
  acc[field] = field === 'status' ? props.childConfig.statusOptions?.[0]?.value ?? '' : ''

  return acc
}, {
  id: null,
  meetingId: null,
})

const fieldLabel = field => ({
  content: t('meeting.fields.content'),
  description: t('meeting.fields.description'),
  document_number: t('meeting.fields.document_number'),
  duration_minutes: t('meeting.fields.duration_minutes'),
  issued_at: t('meeting.fields.issued_at'),
  meetingId: t('meeting.fields.meeting'),
  position: t('meeting.fields.position'),
  remind_at: t('meeting.fields.remind_at'),
  review_note: t('meeting.fields.review_note'),
  role: t('meeting.fields.role'),
  sort_order: t('meeting.fields.sort_order'),
  status: t('meeting.fields.status'),
  title: t('meeting.fields.title'),
  type: t('meeting.fields.voting_type'),
  user_id: t('meeting.fields.user_id'),
}[field] ?? field)

const isLongField = field => ['content', 'description', 'review_note'].includes(field)
const isDateField = field => ['issued_at', 'remind_at'].includes(field)
const isRequired = field => field === props.childConfig.requiredField

const syncForm = () => {
  formData.value = props.childItem
    ? { ...createDefaultForm(), ...props.childItem }
    : createDefaultForm()

  if (!formData.value.meetingId && props.meetingItems.length === 1)
    formData.value.meetingId = props.meetingItems[0]?.value ?? null

  refForm.value?.resetValidation()
}

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const handleSave = () => {
  if (props.isReadOnly) {
    closeDialog()

    return
  }

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
              v-if="props.meetingItems.length"
              cols="12"
            >
              <AppSelect
                v-model="formData.meetingId"
                :label="fieldLabel('meetingId')"
                :items="props.meetingItems"
                :rules="[requiredValidator]"
                :readonly="props.isReadOnly || props.lockMeeting"
              />
            </VCol>

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
                :readonly="props.isReadOnly"
              />

              <AppSelect
                v-else-if="field === 'type'"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :items="[
                  { title: t('meeting.votingType.public'), value: 'public' },
                  { title: t('meeting.votingType.anonymous'), value: 'anonymous' },
                ]"
                :readonly="props.isReadOnly"
              />

              <AppSelect
                v-else-if="props.selectItems[field]"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :items="props.selectItems[field]"
                :rules="isRequired(field) ? [requiredValidator] : []"
                :readonly="props.isReadOnly"
              />

              <AppDateTimePicker
                v-else-if="isDateField(field)"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :placeholder="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
                :config="{ enableTime: field === 'remind_at', altFormat: field === 'remind_at' ? 'd/m/Y H:i' : 'd/m/Y', altInput: true, dateFormat: field === 'remind_at' ? 'Y-m-d H:i:S' : 'Y-m-d' }"
                :readonly="props.isReadOnly"
              />

              <AppTextarea
                v-else-if="isLongField(field)"
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
                rows="3"
                :readonly="props.isReadOnly"
              />

              <AppTextField
                v-else
                v-model="formData[field]"
                :label="fieldLabel(field)"
                :rules="isRequired(field) ? [requiredValidator] : []"
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
