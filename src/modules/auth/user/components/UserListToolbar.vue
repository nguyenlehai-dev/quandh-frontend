<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  searchQuery: { type: String, required: true },
  selectedStatus: { type: String, default: null },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  statusOptions: { type: Array, required: true },
  hasInvalidDateRange: { type: Boolean, default: false },
  selectedRowsCount: { type: Number, default: 0 },
  bulkStatusOptions: { type: Array, required: true },
  isImporting: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  canImport: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canBulkUpdateStatus: { type: Boolean, default: false },
  canBulkDestroy: { type: Boolean, default: false },
  downloadTemplateHandler: { type: Function, default: null },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedStatus',
  'update:fromDate',
  'update:toDate',
  'bulk-change-status',
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

const selectedStatusModel = computed({
  get: () => props.selectedStatus,
  set: value => emit('update:selectedStatus', value),
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
const invalidDateRangeMessage = computed(() => t('user.user.list.messages.invalid_date_range'))
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
    <VCardItem :title="t('user.user.list.filter')" />

    <VCardText>
      <VRow class="align-center">
        <VCol cols="12" md="3">
          <AppTextField
            v-model="searchQueryModel"
            :label="t('common.common.actions.search')"
            :placeholder="t('user.user.list.search_placeholder')"
          />
        </VCol>

        <VCol cols="12" md="3">
          <AppSelect
            v-model="selectedStatusModel"
            :label="t('user.user.headers.status')"
            :items="statusOptions"
            item-title="title"
            item-value="value"
          />
        </VCol>

        <VCol cols="12" md="3">
          <DemoDateTimePickerDisabledRange
            v-model="fromDateModel"
            :label="t('user.user.list.from_date')"
            :placeholder="t('user.user.list.from_date')"
          />
        </VCol>

        <VCol cols="12" md="3">
          <DemoDateTimePickerDisabledRange
            v-model="toDateModel"
            :label="t('user.user.list.to_date')"
            :placeholder="t('user.user.list.to_date')"
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
          <template v-if="showBulkActions">
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
                <VListItem
                  v-for="status in bulkStatusOptions"
                  :key="status.value"
                  v-if="canBulkUpdateStatus"
                  @click="emit('bulk-change-status', status.value)"
                >
                  <template #prepend>
                    <VIcon :icon="status.value === 'active' ? 'tabler-check' : status.value === 'inactive' ? 'tabler-player-pause' : 'tabler-ban'" />
                  </template>
                  <VListItemTitle>{{ status.title }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkDestroy"
                  @click="emit('bulk-delete')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('user.user.list.bulk_delete') }}</VListItemTitle>
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
            {{ t('user.user.list.add_new') }}
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
    <VCard :title="t('user.user.list.import_dialog_title')">
      <VCardText>
        <div class="text-caption mb-5 text-disabled">
          {{ t('user.user.list.import_hint') }}
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
            {{ t('user.user.list.download_template') }}
          </VBtn>
        </div>

        <VFileInput
          v-model="importFile"
          :label="t('user.user.list.select_excel')"
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
          {{ t('user.user.list.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="isImporting"
          :disabled="!importFile"
          @click="handleImport"
        >
          {{ t('user.user.list.import') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
