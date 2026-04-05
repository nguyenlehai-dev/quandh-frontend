<script setup>
import { computed } from 'vue'
const { t } = useI18n()

const props = defineProps({
  searchQuery: { type: String, required: true },
  selectedMethod: { type: String, default: null },
  selectedStatus: { type: [Number, String], default: null },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  methodOptions: { type: Array, required: true },
  statusOptions: { type: Array, required: true },
  selectedRowsCount: { type: Number, default: 0 },
  isExporting: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  canManageLogCleanup: { type: Boolean, default: false },
  canBulkDeleteLogs: { type: Boolean, default: false },
  hasInvalidDateRange: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedMethod',
  'update:selectedStatus',
  'update:fromDate',
  'update:toDate',
  'reset',
  'bulk-delete',
  'delete-by-date',
  'clear-all',
  'export',
])

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: value => emit('update:searchQuery', value),
})

const selectedMethodModel = computed({
  get: () => props.selectedMethod,
  set: value => emit('update:selectedMethod', value),
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
</script>

<template>
  <div>
    <VCardItem :title="t('auth.auth.activity_logs.toolbar.filter')" />

    <VCardText>
      <VRow class="align-center">
        <VCol cols="12" md="3">
          <AppTextField
            v-model="searchQueryModel"
            :label="t('auth.auth.activity_logs.toolbar.search')"
            :placeholder="t('auth.auth.activity_logs.toolbar.search_placeholder')"
          />
        </VCol>

        <VCol cols="12" md="3">
          <AppSelect
            v-model="selectedMethodModel"
            :label="t('auth.auth.activity_logs.toolbar.method')"
            :items="methodOptions"
            item-title="title"
            item-value="value"
          />
        </VCol>

        <VCol cols="12" md="2">
          <AppSelect
            v-model="selectedStatusModel"
            :label="t('auth.auth.activity_logs.toolbar.status_code')"
            :items="statusOptions"
            item-title="title"
            item-value="value"
          />
        </VCol>

        <VCol cols="12" md="2">
          <AppDateTimePicker
            v-model="fromDateModel"
            :label="t('auth.auth.activity_logs.toolbar.from_date')"
            :placeholder="t('auth.auth.activity_logs.toolbar.from_date')"
            :config="{ dateFormat: 'Y-m-d' }"
          />
        </VCol>

        <VCol cols="12" md="2">
          <AppDateTimePicker
            v-model="toDateModel"
            :label="t('auth.auth.activity_logs.toolbar.to_date')"
            :placeholder="t('auth.auth.activity_logs.toolbar.to_date')"
            :config="{ dateFormat: 'Y-m-d' }"
          />
          <div
            v-if="hasInvalidDateRange"
            class="text-error text-caption mt-1"
          >
            {{ t('auth.auth.activity_logs.toolbar.invalid_date_range') }}
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
                  {{ t('auth.auth.activity_logs.toolbar.actions') }}
                </VBtn>
              </template>

              <VList>
                <VListItem
                  v-if="canBulkDeleteLogs"
                  @click="emit('bulk-delete')"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>{{ t('auth.auth.activity_logs.toolbar.bulk_delete') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-rotate-clockwise"
            @click="emit('reset')"
          >
            {{ t('auth.auth.activity_logs.toolbar.reset') }}
          </VBtn>
        </div>

        <div class="d-flex gap-x-4 align-center flex-wrap">
          <VBtn
            v-if="canManageLogCleanup"
            variant="tonal"
            color="error"
            prepend-icon="tabler-calendar-off"
            @click="emit('delete-by-date')"
          >
            {{ t('auth.auth.activity_logs.toolbar.delete_by_date') }}
          </VBtn>
          <VBtn
            v-if="canManageLogCleanup"
            variant="tonal"
            color="error"
            prepend-icon="tabler-trash-x"
            @click="emit('clear-all')"
          >
            {{ t('auth.auth.activity_logs.toolbar.clear_all') }}
          </VBtn>
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-file-download"
            :loading="isExporting"
            :disabled="!canExport"
            @click="emit('export')"
          >
            {{ t('auth.auth.activity_logs.toolbar.export') }}
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VDivider />
  </div>
</template>
