<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'export',
  'update:isDialogVisible',
])

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const handleExport = () => {
  emit('export')
  closeDialog()
}
</script>

<template>
  <VDialog
    max-width="560"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard title="Xuất dữ liệu vai trò">
      <VCardText>
        <VAlert
          variant="tonal"
          color="success"
          icon="tabler-file-spreadsheet"
        >
          Dữ liệu vai trò sẽ được xuất dưới dạng tệp Excel `.xlsx` theo bộ lọc hiện tại.
        </VAlert>
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
