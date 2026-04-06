<script setup>
import { formatAuthDateTime } from '../../shared/dateTime'

const props = defineProps({
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  itemsPerPageOptions: { type: Array, required: true },
  selectedRows: { type: Array, required: true },
  users: { type: Array, required: true },
  totalUsers: { type: Number, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  canRead: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  statusActionOptions: { type: Array, required: true },
  getRoleName: { type: Function, required: true },
  getOrgName: { type: Function, required: true },
  normalizeUserStatus: { type: Function, required: true },
  resolveUserStatusVariant: { type: Function, required: true },
  resolveStatusText: { type: Function, required: true },
})

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'selection-change',
  'options-change',
  'view',
  'edit',
  'delete',
  'change-status',
])

const { t } = useI18n()

const updatePage = value => emit('update:page', value)
const updateItemsPerPage = value => emit('update:itemsPerPage', value)
const getCreatedByLabel = item => item.created_by || t('user.user.list.system_admin')
const getUpdatedByLabel = item => item.updated_by || t('user.user.list.system_admin')
</script>

<template>
  <VDataTableServer
    :items-per-page="itemsPerPage"
    :page="page"
    class="user-table text-no-wrap"
    :model-value="selectedRows"
    :items="users"
    :items-length="totalUsers"
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
      <div class="d-flex align-center gap-x-4">
        <VAvatar
          size="34"
          variant="tonal"
          color="info"
        >
          <span>{{ avatarText(item.name) }}</span>
        </VAvatar>
        <div class="d-flex flex-column">
          <h6 class="text-base font-weight-medium text-high-emphasis">
            {{ item.name }}
          </h6>
          <div class="text-caption mt-1">
            <VChip
              size="x-small"
              color="info"
              variant="flat"
            >
              {{ item.user_name || t('user.user.list.empty') }}
            </VChip>
          </div>
        </div>
      </div>
    </template>

    <template #item.email="{ item }">
      <span class="text-body-2">{{ item.email || t('user.user.list.empty') }}</span>
    </template>

    <template #item.roles="{ item }">
      <div class="d-flex flex-column gap-3 py-2">
        <div
          v-for="assign in item.assignments || []"
          :key="assign.role_id"
          class="d-flex flex-column"
        >
          <div class="d-flex align-center gap-2 text-body-2 text-high-emphasis font-weight-medium">
            <VIcon
              icon="tabler-shield"
              size="18"
              color="success"
            />
            {{ getRoleName(assign.role_id) }}
          </div>
          <div
            class="d-flex gap-1 mt-1 flex-wrap"
            style="padding-inline-start: 24px;"
          >
            <VChip
              v-for="orgId in assign.organization_ids || []"
              :key="orgId"
              size="x-small"
              color="info"
              class="rounded"
            >
              {{ getOrgName(orgId) }}
            </VChip>
          </div>
        </div>
        <span
          v-if="!(item.assignments || []).length"
          class="text-caption text-disabled"
        >
          {{ t('user.user.list.empty') }}
        </span>
      </div>
    </template>

    <template #item.created_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getCreatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">
          {{ formatAuthDateTime(item.created_at, { fallback: t('user.user.list.no_update') }) }}
        </span>
      </div>
    </template>

    <template #item.updated_at="{ item }">
      <div class="d-flex flex-column gap-y-1 text-center">
        <span class="text-body-2 font-weight-medium text-primary">
          {{ getUpdatedByLabel(item) }}
        </span>
        <span class="text-caption text-disabled">
          {{ formatAuthDateTime(item.updated_at || item.created_at, { fallback: t('user.user.list.no_update') }) }}
        </span>
      </div>
    </template>

    <template #item.status="{ item }">
      <div class="d-flex justify-center">
        <VMenu v-if="canUpdate">
          <template #activator="{ props: menuProps }">
            <VChip
              v-bind="menuProps"
              :color="resolveUserStatusVariant(item.status)"
              size="small"
              label
              class="text-capitalize px-3"
              variant="tonal"
            >
              {{ resolveStatusText(item.status) }}
            </VChip>
          </template>
          <VList>
            <VListItem
              v-for="status in statusActionOptions.filter(option => option.value !== normalizeUserStatus(item.status))"
              :key="status.value"
              @click="emit('change-status', item, status.value)"
            >
              <VListItemTitle>{{ status.title }}</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
        <VChip
          v-else
          :color="resolveUserStatusVariant(item.status)"
          size="small"
          label
          class="text-capitalize px-3"
          variant="tonal"
        >
          {{ resolveStatusText(item.status) }}
        </VChip>
      </div>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex align-center justify-center">
        <IconBtn
          v-if="canUpdate"
          variant="text"
          color="default"
          size="small"
          @click="emit('edit', item.id)"
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
                @click="emit('view', item.id)"
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
        :total-items="totalUsers"
        :items-per-page-options="itemsPerPageOptions"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
      />
    </template>
  </VDataTableServer>
</template>

<style scoped>
.user-table :deep(.v-data-table-column--select-row),
.user-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.user-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
