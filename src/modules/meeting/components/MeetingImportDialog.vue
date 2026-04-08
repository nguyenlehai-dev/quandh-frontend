<script setup>
const props = defineProps({
  alertText: {
    type: String,
    default: 'Hệ thống hỗ trợ `.xlsx`, `.xls`, `.csv`. Cột tối thiểu: `title`, `start_at`; các cột khuyến nghị: `code`, `location`, `status`, `description`.',
  },
  dialogTitle: {
    type: String,
    default: 'Nhập dữ liệu cuộc họp',
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

const refForm = ref()
const importFile = ref([])

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

    <VCard :title="props.dialogTitle">
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
                label="Tệp dữ liệu"
                placeholder="Chọn tệp Excel hoặc CSV"
                prepend-icon=""
                :rules="[requiredValidator]"
              >
                <template #append>
                  <VBtn variant="tonal">
                    Chọn tệp
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
                {{ props.alertText }}
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
          Đóng
        </VBtn>

        <VBtn @click="handleImport">
          Nhập dữ liệu
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
