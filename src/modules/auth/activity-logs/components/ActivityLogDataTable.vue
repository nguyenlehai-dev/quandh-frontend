<script setup>
import { formatAuthDateTime } from '../../shared/dateTime'
const { t } = useI18n()

const props = defineProps({
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  itemsPerPageOptions: { type: Array, required: true },
  selectedRows: { type: Array, required: true },
  logs: { type: Array, required: true },
  totalLogs: { type: Number, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  canViewLogDetail: { type: Boolean, default: false },
  canDeleteLog: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'selection-change',
  'options-change',
  'view',
  'delete',
])

const updatePage = value => emit('update:page', value)
const updateItemsPerPage = value => emit('update:itemsPerPage', value)
const getActorLabel = item => item.user_name || t('auth.auth.activity_logs.table.guest')
</script>

<template>
  <VDataTableServer
    :items-per-page="itemsPerPage"
    :page="page"
    class="activity-log-table text-no-wrap"
    :model-value="selectedRows"
    :items="logs"
    :items-length="totalLogs"
    :headers="headers"
    :loading="loading"
    item-value="id"
    show-select
    hover
    @update:model-value="emit('selection-change', $event)"
    @update:options="emit('options-change', $event)"
  >
    <template #item.index="{ index }">
      <div class="d-flex justify-center">
        <span class="text-body-2 text-disabled">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </span>
      </div>
    </template>

    <template #item.description="{ item }">
      <div class="d-flex flex-column gap-y-1 py-2">
        <span class="font-weight-medium text-high-emphasis">
          {{ item.description || item.route || t('auth.auth.activity_logs.table.empty') }}
        </span>
        <span class="text-caption text-disabled">
          {{ item.route || t('auth.auth.activity_logs.table.empty') }}
        </span>
      </div>
    </template>

    <template #item.user_name="{ item }">
      <div class="d-flex flex-column gap-y-1 py-2">
        <span class="text-body-2 font-weight-medium text-high-emphasis">
          {{ item.user_name || t('auth.auth.activity_logs.table.guest') }}
        </span>
        <span class="text-caption text-disabled">
          {{ item.user_type || t('auth.auth.activity_logs.table.empty') }}
        </span>
      </div>
    </template>

    <template #item.ip_address="{ item }">
      <div class="d-flex flex-column gap-y-1 py-2 text-center">
        <span class="text-body-2">{{ item.ip_address || t('auth.auth.activity_logs.table.empty') }}</span>
        <span class="text-caption text-disabled">{{ item.country || t('auth.auth.activity_logs.table.empty') }}</span>
      </div>
    </template>

    <template #item.status_code="{ item }">
      <div class="d-flex justify-center">
        <VChip
          size="small"
          :color="item.status_code >= 200 && item.status_code < 300 ? 'success' : item.status_code >= 500 ? 'error' : 'warning'"
          variant="tonal"
          label
        >
          {{ item.status_code ?? t('auth.auth.activity_logs.table.empty') }}
        </VChip>
      </div>
    </template>

    <template #item.created_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getActorLabel(item) }}
        </span>
        <span class="text-caption text-disabled">
          {{ formatAuthDateTime(item.created_at, { fallback: t('auth.auth.activity_logs.table.empty'), includeSeconds: true }) }}
        </span>
      </div>
    </template>

    <template #item.updated_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getActorLabel(item) }}
        </span>
        <span class="text-caption text-disabled">
          {{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('auth.auth.activity_logs.table.empty'), includeSeconds: true }) }}
        </span>
      </div>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex align-center justify-center">
        <IconBtn
          v-if="canViewLogDetail || canDeleteLog"
          variant="text"
          color="default"
          size="small"
        >
          <VIcon
            icon="tabler-dots-vertical"
            size="20"
          />
          <VMenu activator="parent">
            <VList>
              <VListItem
                v-if="canViewLogDetail"
                @click="emit('view', item)"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-eye"
                    size="18"
                  />
                </template>
                <VListItemTitle>{{ t('common.common.actions.view') }}</VListItemTitle>
              </VListItem>
              <VListItem
                v-if="canDeleteLog"
                @click="emit('delete', item)"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-trash"
                    size="18"
                  />
                </template>
                <VListItemTitle>{{ t('common.common.actions.delete') }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </div>
    </template>

    <template #bottom>
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalLogs"
        :items-per-page-options="itemsPerPageOptions"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
      />
    </template>
  </VDataTableServer>
</template>

<style scoped>
.activity-log-table :deep(.v-data-table-column--select-row),
.activity-log-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.activity-log-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
