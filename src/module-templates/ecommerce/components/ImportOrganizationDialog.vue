<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'downloadTemplate',
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
    max-width="640"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard title="Nhập danh sách tổ chức">
      <VCardText>
        <div class="mb-4">
          <p class="text-body-1 text-high-emphasis mb-1">
            Tải tệp dữ liệu
          </p>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Hỗ trợ tệp Excel hoặc CSV theo mẫu Core API. Bạn có thể tải file mẫu trước khi nhập.
          </p>
        </div>

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
              Hỗ trợ tệp `.xlsx`, `.xls`, `.csv`. Cột chuẩn theo template Core: `id`, `name`, `slug`, `description`, `status`, `parent_id`, `parent_slug`, `sort_order`.
            </VAlert>
          </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-space-between flex-wrap gap-3 pt-0">
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-download"
          @click="emit('downloadTemplate')"
        >
          Tải file mẫu
        </VBtn>

        <div class="d-flex gap-3">
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
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
