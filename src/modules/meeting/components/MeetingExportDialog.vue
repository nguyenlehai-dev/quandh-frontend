<script setup>
const props = defineProps({
  alertText: {
    type: String,
    default: 'Dữ liệu sẽ được xuất dưới dạng tệp Excel `.xlsx`.',
  },
  dialogTitle: {
    type: String,
    default: 'Xuất dữ liệu cuộc họp',
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

const exportScopeOptions = computed(() => {
  if (props.scopeOptions.length)
    return props.scopeOptions

  const options = [
    { title: 'Toàn bộ dữ liệu đã lọc', value: 'filtered' },
    { title: 'Trang hiện tại', value: 'page' },
  ]

  if (props.selectedCount)
    options.unshift({ title: `Dòng đang chọn (${props.selectedCount})`, value: 'selected' })

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

    <VCard :title="props.dialogTitle">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <AppSelect
              v-model="exportScope"
              label="Phạm vi xuất"
              placeholder="Chọn phạm vi"
              :items="exportScopeOptions"
            />
          </VCol>

          <VCol cols="12">
            <VAlert
              variant="tonal"
              color="success"
              icon="tabler-file-spreadsheet"
            >
              {{ props.alertText }}
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
          Đóng
        </VBtn>

        <VBtn
          prepend-icon="tabler-download"
          @click="handleExport"
        >
          Xuất dữ liệu
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
