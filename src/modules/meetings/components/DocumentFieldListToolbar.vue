<script setup>
import { ref } from 'vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  
  statusOptions: { type: Array, required: true },
  
  selectedRowsCount: { type: Number, default: 0 },
  isImporting: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  canImport: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canBulkUpdateStatus: { type: Boolean, default: false },
  canBulkDestroy: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  
  'bulkChangeStatus',
  'bulkDelete',
  'import',
  'export',
  'add',
])

const isImportDialogVisible = ref(false)
const importFile = ref(null)

const closeImportDialog = () => {
  isImportDialogVisible.value = false
  importFile.value = null
}

const handleImport = () => {
  if (importFile.value) {
    emit('import', importFile.value)
    closeImportDialog()
  }
}
</script>

<template>
  <div>
    <VCardItem title="Bộ lọc và Tìm kiếm" />

    <VCardText>
      <VRow class="align-center">
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            :model-value="searchQuery"
            label="Tìm kiếm"
            placeholder="Tìm kiếm..."
            @update:model-value="emit('update:searchQuery', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppSelect
            :model-value="statusFilter"
            label="Trạng thái"
            :items="[{ title: 'Tất cả trạng thái', value: '' }, ...statusOptions]"
            item-title="title"
            item-value="value"
            placeholder="Lọc theo trạng thái"
            @update:model-value="emit('update:statusFilter', $event)"
          />
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VCardText>
      <div class="d-flex justify-sm-space-between justify-start flex-wrap gap-4">
        <div class="d-flex gap-x-4 align-center flex-wrap">
          <template v-if="selectedRowsCount > 0">
            <VMenu>
              <template #activator="{ props: menuProps }">
                <VBtn
                  v-bind="menuProps"
                  variant="tonal"
                  prepend-icon="tabler-chevron-down"
                >
                  Thao tác
                </VBtn>
              </template>

              <VList>
                <VListItem
                  v-if="canBulkUpdateStatus"
                  @click="emit('bulkChangeStatus', 'active')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-check" />
                  </template>
                  <VListItemTitle>Kích hoạt</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkUpdateStatus"
                  @click="emit('bulkChangeStatus', 'inactive')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-x" />
                  </template>
                  <VListItemTitle>Tạm khóa</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkDestroy"
                  @click="emit('bulkDelete')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Xóa nhiều</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>
        </div>

        <div class="d-flex gap-x-4 align-center flex-wrap">
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
            text="Nhập dữ liệu"
            :loading="isImporting"
            :disabled="!canImport"
            @click="isImportDialogVisible = true"
          />
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-file-download"
            text="Xuất dữ liệu"
            :loading="isExporting"
            :disabled="!canExport"
            @click="emit('export')"
          />
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            :disabled="!canCreate"
            @click="emit('add')"
          >
            Thêm mới
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VDivider />

    <VDialog
      v-model="isImportDialogVisible"
      max-width="500"
    >
      <VCard title="Nhập dữ liệu">
        <VCardText>
          <div class="text-caption mb-5 text-disabled">
            Import hỗ trợ file `.xlsx`, `.xls`, `.csv` theo mẫu quy định.
          </div>

          <VFileInput
            v-model="importFile"
            label="Chọn file Excel"
            accept=".xlsx,.xls,.csv"
            prepend-icon="tabler-file-spreadsheet"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            @click="closeImportDialog"
          >
            Hủy
          </VBtn>
          <VBtn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            @click="handleImport"
          >
            Nhập dữ liệu
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>