<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  searchQuery: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  hasInvalidDateRange: { type: Boolean, default: false },
  selectedRowsCount: { type: Number, default: 0 },
  isImporting: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  canImport: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canBulkDestroy: { type: Boolean, default: false },
  downloadTemplateHandler: { type: Function, default: null },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:fromDate',
  'update:toDate',
  'bulk-delete',
  'import',
  'export',
  'add',
])

const { t } = useI18n()
const isImportDialogVisible = ref(false)
const importFile = ref(null)

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: value => emit('update:searchQuery', value),
})

const fromDateModel = computed({
  get: () => props.fromDate,
  set: value => emit('update:fromDate', value),
})

const toDateModel = computed({
  get: () => props.toDate,
  set: value => emit('update:toDate', value),
})

const showBulkActions = computed(() => props.selectedRowsCount > 0)
const invalidDateRangeMessage = computed(() => 'Den ngay phai lon hon hoac bang tu ngay.')
const canDownloadTemplate = computed(() => typeof props.downloadTemplateHandler === 'function')

const closeImportDialog = () => {
  isImportDialogVisible.value = false
  importFile.value = null
}

const openImportDialog = () => {
  if (!props.canImport) return
  isImportDialogVisible.value = true
}

const handleImport = () => {
  const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value
  if (!file) return

  emit('import', file)
  closeImportDialog()
}
</script>

<template>
  <div>
    <VCardItem :title="t('permissions.permissions.page.filter')" />

    <VCardText>
      <VRow class="align-center">
        <VCol cols="12" md="4">
          <AppTextField
            v-model="searchQueryModel"
            :label="t('common.common.actions.search')"
            :placeholder="t('permissions.permissions.page.search_placeholder')"
          />
        </VCol>

        <VCol cols="12" md="4">
          <DemoDateTimePickerDisabledRange
            v-model="fromDateModel"
            :label="t('permissions.permissions.page.from_date')"
            :placeholder="t('permissions.permissions.page.from_date')"
          />
        </VCol>

        <VCol cols="12" md="4">
          <DemoDateTimePickerDisabledRange
            v-model="toDateModel"
            :label="t('permissions.permissions.page.to_date')"
            :placeholder="t('permissions.permissions.page.to_date')"
          />
          <div
            v-if="hasInvalidDateRange"
            class="text-error text-caption mt-1"
          >
            {{ invalidDateRangeMessage }}
          </div>
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VCardText>
      <div class="d-flex justify-sm-space-between justify-start flex-wrap gap-4">
        <div class="d-flex gap-x-4 align-center flex-wrap">
          <template v-if="showBulkActions && canBulkDestroy">
            <VMenu>
              <template #activator="{ props: menuProps }">
                <VBtn
                  v-bind="menuProps"
                  variant="tonal"
                  prepend-icon="tabler-chevron-down"
                >
                  {{ t('common.common.labels.actions') }}
                </VBtn>
              </template>

              <VList>
                <VListItem @click="emit('bulk-delete')">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('permissions.permissions.page.bulk_delete') }}</VListItemTitle>
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
            :text="t('common.common.actions.import')"
            :loading="isImporting"
            :disabled="!canImport"
            @click="openImportDialog"
          />
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-file-download"
            :text="t('common.common.actions.export')"
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
            {{ t('permissions.permissions.page.add_new') }}
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VDivider />
  </div>

  <VDialog
    v-model="isImportDialogVisible"
    max-width="500"
  >
    <VCard :title="t('permissions.permissions.page.import_dialog_title')">
      <VCardText>
        <div class="text-caption mb-5 text-disabled">
          {{ t('permissions.permissions.page.import_hint') }}
        </div>

        <div
          v-if="canDownloadTemplate"
          class="d-flex justify-end mb-4"
        >
          <VBtn
            variant="text"
            color="info"
            prepend-icon="tabler-download"
            @click="downloadTemplateHandler?.()"
          >
            {{ t('permissions.permissions.page.download_template') }}
          </VBtn>
        </div>

        <VFileInput
          v-model="importFile"
          :label="t('permissions.permissions.page.select_excel')"
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
          {{ t('permissions.permissions.page.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="isImporting"
          :disabled="!importFile"
          @click="handleImport"
        >
          {{ t('permissions.permissions.page.import') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
