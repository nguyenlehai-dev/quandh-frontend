<script setup>
import AuthDataActions from '@/modules/auth/shared/AuthDataActions.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedStatus: { type: String, default: '' },
  meetingTypeFilter: { type: [String, Number], default: null },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
  endFromDate: { type: String, default: '' },
  endToDate: { type: String, default: '' },
  
  statusOptions: { type: Array, required: true },
  meetingTypeOptions: { type: Array, required: true },
  hasInvalidDateRange: { type: Boolean, default: false },
  
  selectedRowsCount: { type: Number, default: 0 },
  bulkStatusOptions: { type: Array, default: () => [] },
  
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
  'update:selectedStatus',
  'update:meetingTypeFilter',
  'update:fromDate',
  'update:toDate',
  'update:endFromDate',
  'update:endToDate',
  'bulkChangeStatus',
  'bulkDelete',
  'import',
  'export',
  'add',
])

const router = useRouter()
const isImportDialogVisible = ref(false)
const importFile = ref(null)

const resetFilters = () => {
  emit('update:searchQuery', '')
  emit('update:selectedStatus', '')
  emit('update:meetingTypeFilter', null)
  emit('update:fromDate', '')
  emit('update:toDate', '')
  emit('update:endFromDate', '')
  emit('update:endToDate', '')
}

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
            placeholder="Tìm kiếm cuộc họp"
            @update:model-value="emit('update:searchQuery', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppSelect
            :model-value="selectedStatus"
            label="Trạng thái"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            placeholder="Tất cả trạng thái"
            @update:model-value="emit('update:selectedStatus', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppSelect
            :model-value="meetingTypeFilter"
            label="Loại cuộc họp"
            :items="meetingTypeOptions"
            item-title="title"
            item-value="value"
            placeholder="Tất cả loại cuộc họp"
            clearable
            @update:model-value="emit('update:meetingTypeFilter', $event)"
          />
        </VCol>
        <!-- <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="fromDate"
            label="Bắt đầu từ"
            type="datetime-local"
            :error="hasInvalidDateRange"
            @update:model-value="emit('update:fromDate', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="toDate"
            label="Bắt đầu đến"
            type="datetime-local"
            :error="hasInvalidDateRange"
            @update:model-value="emit('update:toDate', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="endFromDate"
            label="Kết thúc từ"
            type="datetime-local"
            :error="hasInvalidDateRange"
            @update:model-value="emit('update:endFromDate', $event)"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="endToDate"
            label="Kết thúc đến"
            type="datetime-local"
            :error="hasInvalidDateRange"
            @update:model-value="emit('update:endToDate', $event)"
          />
          <div
            v-if="hasInvalidDateRange"
            class="text-error text-caption mt-1"
          >
            Đến ngày phải lớn hơn hoặc bằng từ ngày.
          </div>
        </VCol> -->
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
                  @click="emit('bulkChangeStatus', 'draft')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-x" />
                  </template>
                  <VListItemTitle>Bản nháp</VListItemTitle>
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
            @click="router.push({ name: 'meetings-create' })"
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
      <VCard title="Nhập dữ liệu cuộc họp">
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
