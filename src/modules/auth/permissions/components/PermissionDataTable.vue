<script setup>
import { formatAuthDateTime } from '../../shared/dateTime'

const props = defineProps({
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  itemsPerPageOptions: { type: Array, required: true },
  selectedRows: { type: Array, required: true },
  permissions: { type: Array, required: true },
  totalItems: { type: Number, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  canRead: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  isGroupRow: { type: Function, required: true },
  getGroupName: { type: Function, required: true },
  getDisplayName: { type: Function, required: true },
})

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'selection-change',
  'options-change',
  'detail',
  'edit',
  'delete',
])

const { t } = useI18n()
const updatePage = value => emit('update:page', value)
const updateItemsPerPage = value => emit('update:itemsPerPage', value)
const getCreatedByLabel = item => item.created_by || t('permissions.permissions.page.system_admin')
const getUpdatedByLabel = item => item.updated_by || t('permissions.permissions.page.system_admin')
</script>

<template>
  <VDataTableServer
    :items-per-page="itemsPerPage"
    :page="page"
    class="permission-table text-no-wrap"
    :model-value="selectedRows"
    :items="permissions"
    :items-length="totalItems"
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
        <span class="text-body-2 text-disabled">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
      </div>
    </template>

    <template #item.name="{ item }">
      <div
        v-if="isGroupRow(item)"
        class="d-flex align-center"
      >
        <h6 class="text-h6 font-weight-bold">
          {{ getDisplayName(item) }}
        </h6>
      </div>
      <div
        v-else
        class="d-flex align-center gap-2 ps-4"
      >
        <VIcon
          icon="tabler-corner-down-right"
          size="16"
          class="text-disabled"
        />
        <span class="text-body-1 font-weight-medium">{{ getDisplayName(item) }}</span>
      </div>
    </template>

    <template #item.group="{ item }">
      <span class="text-body-2 text-disabled">{{ getGroupName(item) }}</span>
    </template>

    <template #item.guard_name="{ item }">
      <div class="d-flex justify-center">
        <VChip
          size="small"
          color="info"
          variant="tonal"
          label
        >
          {{ item.guard_name || 'web' }}
        </VChip>
      </div>
    </template>

    <template #item.description="{ item }">
      <span class="text-body-2 text-disabled">{{ item.description || t('permissions.permissions.page.dash') }}</span>
    </template>

    <template #item.sort_order="{ item }">
      <div class="d-flex justify-center">
        <span class="text-body-2">{{ item.sort_order ?? 0 }}</span>
      </div>
    </template>

    <template #item.created_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getCreatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">{{ formatAuthDateTime(item.created_at, { fallback: t('permissions.permissions.page.dash') }) }}</span>
      </div>
    </template>

    <template #item.updated_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getUpdatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">{{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('permissions.permissions.page.dash') }) }}</span>
      </div>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex align-center justify-center">
        <IconBtn
          v-if="canUpdate"
          variant="text"
          color="default"
          size="small"
          @click="emit('edit', item)"
        >
          <VIcon
            icon="tabler-pencil"
            size="20"
          />
        </IconBtn>
        <IconBtn
          v-if="canRead || canDelete"
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
                v-if="canRead"
                @click="emit('detail', item)"
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
                v-if="canDelete"
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
        :total-items="totalItems"
        :items-per-page-options="itemsPerPageOptions"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
      />
    </template>
  </VDataTableServer>
</template>

<style scoped>
.permission-table :deep(.v-data-table-column--select-row),
.permission-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.permission-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
