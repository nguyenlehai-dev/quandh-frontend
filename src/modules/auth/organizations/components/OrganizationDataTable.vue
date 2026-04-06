<script setup>
import { formatAuthDateTime } from '../../shared/dateTime'

const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  itemsPerPageOptions: {
    type: Array,
    required: true,
  },
  selectedRows: {
    type: Array,
    required: true,
  },
  organizations: {
    type: Array,
    required: true,
  },
  totalOrganizations: {
    type: Number,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canRead: {
    type: Boolean,
    default: false,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  getTreeIndentStyle: {
    type: Function,
    required: true,
  },
  getStatusToggleState: {
    type: Function,
    required: true,
  },
  isStatusUpdating: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'selection-change',
  'options-change',
  'change-status',
  'edit',
  'detail',
  'delete',
])

const { t } = useI18n()

const updatePage = value => emit('update:page', value)
const updateItemsPerPage = value => emit('update:itemsPerPage', value)
const getParentHint = item => item.parent?.name
  ? `Nam trong: ${item.parent.name}`
  : 'Nam trong: To chuc cha'

const getCreatedByLabel = item => item.created_by || t('organizations.organizations.list.system_admin')
const getUpdatedByLabel = item => item.updated_by || t('organizations.organizations.list.system_admin')
</script>

<template>
  <VDataTableServer
    :items-per-page="itemsPerPage"
    :page="page"
    class="organization-table text-no-wrap"
    :model-value="selectedRows"
    :items="organizations"
    :items-length="totalOrganizations"
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
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </div>
    </template>

    <template #item.name="{ item }">
      <div
        class="d-flex align-center"
        :style="getTreeIndentStyle(item)"
      >
        <VIcon
          v-if="item.parent_id"
          icon="tabler-arrow-back-up"
          size="16"
          class="me-2 text-disabled"
          style="transform: scaleX(-1);"
        />
        <VIcon
          v-else
          icon="tabler-building-bank"
          size="16"
          class="me-2 text-disabled"
        />
        <div class="d-flex flex-column gap-y-1">
          <span class="text-body-1 text-high-emphasis font-weight-medium">{{ item.name }}</span>
          <span
            v-if="!item.parent_id"
            class="text-caption text-disabled"
          >{{ t('organizations.organizations.list.root_tree') }}</span>
          <span
            v-else
            class="text-caption text-medium-emphasis"
          >{{ getParentHint(item) }}</span>
        </div>
      </div>
    </template>

    <template #item.parent="{ item }">
      <div class="text-body-2">
        {{ item.parent?.name || t('organizations.organizations.list.empty') }}
      </div>
    </template>

    <template #item.status="{ item }">
      <div class="d-flex justify-center">
        <VSwitch
          class="organization-status-switch"
          :model-value="item.status === 'active'"
          :disabled="getStatusToggleState(item).disabled || isStatusUpdating(item.id)"
          :loading="isStatusUpdating(item.id)"
          :label="undefined"
          hide-details
          inset
          :title="getStatusToggleState(item).title"
          @update:model-value="emit('change-status', item, $event ? 'active' : 'inactive')"
        />
      </div>
    </template>

    <template #item.created_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getCreatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">{{ formatAuthDateTime(item.created_at, { fallback: t('organizations.organizations.list.empty') }) }}</span>
      </div>
    </template>

    <template #item.updated_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getUpdatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">{{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('organizations.organizations.list.empty') }) }}</span>
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
            icon="tabler-edit"
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
                @click="emit('delete', item.id)"
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
        :total-items="totalOrganizations"
        :items-per-page-options="itemsPerPageOptions"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
      />
    </template>
  </VDataTableServer>
</template>

<style scoped>
.organization-table :deep(.v-data-table-column--select-row),
.organization-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.organization-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
