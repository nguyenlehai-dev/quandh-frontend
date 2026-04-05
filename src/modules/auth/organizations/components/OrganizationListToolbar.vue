<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  selectedStatus: {
    type: String,
    default: null,
  },
  fromDate: {
    type: String,
    required: true,
  },
  toDate: {
    type: String,
    required: true,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
  hasInvalidDateRange: {
    type: Boolean,
    default: false,
  },
  selectedRowsCount: {
    type: Number,
    default: 0,
  },
  bulkStatusOptions: {
    type: Array,
    required: true,
  },
  isImporting: {
    type: Boolean,
    default: false,
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
  canImport: {
    type: Boolean,
    default: false,
  },
  canExport: {
    type: Boolean,
    default: false,
  },
  canCreate: {
    type: Boolean,
    default: false,
  },
  canBulkUpdateStatus: {
    type: Boolean,
    default: false,
  },
  canBulkDestroy: {
    type: Boolean,
    default: false,
  },
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
const canActivateSelected = computed(() => props.bulkStatusOptions.some(item => item.value === 'active'))
const canDeactivateSelected = computed(() => props.bulkStatusOptions.some(item => item.value === 'inactive'))
const invalidDateRangeMessage = computed(() => 'Den ngay phai lon hon hoac bang tu ngay.')

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
  <VCard
    :title="t('organizations.organizations.list.filter')"
    class="mb-6"
  >
    <VCardText>
      <VRow class="align-center">
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="searchQueryModel"
            :label="t('common.common.actions.search')"
            :placeholder="t('organizations.organizations.list.search_placeholder')"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppSelect
            v-model="selectedStatusModel"
            :label="t('organizations.organizations.headers.status')"
            :items="statusOptions"
            item-title="title"
            item-value="value"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <DemoDateTimePickerDisabledRange
            v-model="fromDateModel"
            :label="t('organizations.organizations.list.from_date')"
            :placeholder="t('organizations.organizations.list.from_date')"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <DemoDateTimePickerDisabledRange
            v-model="toDateModel"
            :label="t('organizations.organizations.list.to_date')"
            :placeholder="t('organizations.organizations.list.to_date')"
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
                  v-if="canBulkUpdateStatus"
                  :disabled="!canActivateSelected"
                  @click="emit('bulk-change-status', 'active')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-check" />
                  </template>
                  <VListItemTitle>{{ t('organizations.organizations.status.active') }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkUpdateStatus"
                  :disabled="!canDeactivateSelected"
                  @click="emit('bulk-change-status', 'inactive')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-x" />
                  </template>
                  <VListItemTitle>{{ t('organizations.organizations.status.inactive') }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="canBulkDestroy"
                  @click="emit('bulk-delete')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('organizations.organizations.list.bulk_delete') }}</VListItemTitle>
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
            {{ t('organizations.organizations.list.add_new') }}
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VDivider />
  </VCard>

  <VDialog
    v-model="isImportDialogVisible"
    max-width="500"
  >
    <VCard :title="t('organizations.organizations.list.import_dialog_title')">
      <VCardText>
        <div class="text-caption mb-5 text-disabled">
          {{ t('organizations.organizations.list.import_hint') }}
        </div>

        <VFileInput
          v-model="importFile"
          :label="t('organizations.organizations.list.select_excel')"
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
          {{ t('organizations.organizations.list.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="isImporting"
          :disabled="!importFile"
          @click="handleImport"
        >
          {{ t('organizations.organizations.list.import') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
