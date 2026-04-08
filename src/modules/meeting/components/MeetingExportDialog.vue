<script setup>
const { t } = useI18n()

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
  selectedCount: {
    type: Number,
    default: 0,
  },
  scopeOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'export',
  'update:isDialogVisible',
])

const exportScope = ref('filtered')
const resolvedAlertText = computed(() => props.alertText || t('meeting.dialogs.export.defaultAlert'))
const resolvedDialogTitle = computed(() => props.dialogTitle || t('meeting.dialogs.export.defaultTitle'))

const exportScopeOptions = computed(() => {
  if (props.scopeOptions.length)
    return props.scopeOptions

  const options = [
    { title: t('meeting.exportScope.filtered'), value: 'filtered' },
    { title: t('meeting.exportScope.page'), value: 'page' },
  ]

  if (props.selectedCount)
    options.unshift({ title: t('meeting.exportScope.selected', { count: props.selectedCount }), value: 'selected' })

  return options
})

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const handleExport = () => {
  emit('export', exportScope.value)
  closeDialog()
}

watch(
  () => props.selectedCount,
  selectedCount => {
    if (!selectedCount && exportScope.value === 'selected')
      exportScope.value = 'filtered'
  },
  { immediate: true },
)
</script>

<template>
  <VDialog
    max-width="560"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard :title="resolvedDialogTitle">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <AppSelect
              v-model="exportScope"
              :label="t('meeting.dialogs.export.scopeLabel')"
              :placeholder="t('meeting.dialogs.export.scopePlaceholder')"
              :items="exportScopeOptions"
            />
          </VCol>

          <VCol cols="12">
            <VAlert
              variant="tonal"
              color="success"
              icon="tabler-file-spreadsheet"
            >
              {{ resolvedAlertText }}
            </VAlert>
          </VCol>
        </VRow>
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
          prepend-icon="tabler-download"
          @click="handleExport"
        >
          {{ t('meeting.common.exportData') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
