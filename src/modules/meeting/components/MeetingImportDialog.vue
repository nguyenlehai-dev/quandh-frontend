<script setup>
const props = defineProps({
  alertText: {
    type: String,
    default: '',
  },
  dialogTitle: {
    type: String,
    default: '',
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'import',
  'update:isDialogVisible',
])

const { t } = useI18n()

const refForm = ref()
const importFile = ref([])
const resolvedAlertText = computed(() => props.alertText || t('meeting.dialogs.import.defaultAlert'))
const resolvedDialogTitle = computed(() => props.dialogTitle || t('meeting.dialogs.import.defaultTitle'))

const closeDialog = () => {
  emit('update:isDialogVisible', false)
  importFile.value = []
  refForm.value?.resetValidation()
}

const handleImport = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (!valid)
      return

    emit('import', importFile.value[0])
    closeDialog()
  })
}
</script>

<template>
  <VDialog
    max-width="700"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard :title="resolvedDialogTitle">
      <VCardText>
        <VForm
          ref="refForm"
          validate-on="submit"
          @submit.prevent="handleImport"
        >
          <VRow>
            <VCol cols="12">
              <VFileInput
                v-model="importFile"
                accept=".xlsx,.xls,.csv"
                :label="t('meeting.dialogs.import.fileLabel')"
                :placeholder="t('meeting.dialogs.import.filePlaceholder')"
                prepend-icon=""
                :rules="[requiredValidator]"
              >
                <template #append>
                  <VBtn variant="tonal">
                    {{ t('meeting.dialogs.import.chooseFile') }}
                  </VBtn>
                </template>
              </VFileInput>
            </VCol>

            <VCol cols="12">
              <VAlert
                variant="tonal"
                color="info"
                icon="tabler-info-circle"
              >
                {{ resolvedAlertText }}
              </VAlert>
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

        <VBtn @click="handleImport">
          {{ t('meeting.common.importData') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
