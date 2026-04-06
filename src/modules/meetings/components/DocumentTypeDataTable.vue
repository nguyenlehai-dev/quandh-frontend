<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  totalItems: { type: Number, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  canRead: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:selectedRows',
  'update:options',
  'detail',
  'edit',
  'delete',
  'toggleStatus',
])

const getRowNumber = index => ((props.page - 1) * props.itemsPerPage) + index + 1
</script>

<template>
  <VDataTableServer
    :model-value="selectedRows"
    :items-per-page="itemsPerPage"
    :page="page"
    :items="items"
    :items-length="totalItems"
    :headers="headers"
    :loading="loading"
    class="text-no-wrap"
    show-select
    @update:model-value="emit('update:selectedRows', $event)"
    @update:options="emit('update:options', $event)"
  >
    <template #item.stt="{ index }">
      <span class="text-body-2 text-disabled">{{ getRowNumber(index) }}</span>
    </template>

    <template #item.name="{ item }">
      <span class="font-weight-medium">{{ item.name }}</span>
    </template>

    <template #item.description="{ item }">
      <span>{{ item.description || '---' }}</span>
    </template>

    <template #item.created_info="{ item }">
      <div class="d-flex flex-column">
        <span class="font-weight-medium">{{ item.created_by || 'N/A' }}</span>
        <span class="text-body-2 text-disabled">{{ item.created_at || '---' }}</span>
      </div>
    </template>

    <template #item.updated_info="{ item }">
      <div class="d-flex flex-column">
        <span class="font-weight-medium">{{ item.updated_by || 'N/A' }}</span>
        <span class="text-body-2 text-disabled">{{ item.updated_at || '---' }}</span>
      </div>
    </template>

    <template #item.status="{ item }">
      <div class="d-flex align-center justify-center">
        <VSwitch
          :model-value="item.status === 'active'"
          :disabled="!canUpdate"
          color="success"
          hide-details
          inset
          @update:model-value="emit('toggleStatus', item)"
        />
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
            <VList density="compact">
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
                <VListItemTitle>Xem chi tiết</VListItemTitle>
              </VListItem>

              <VDivider
                v-if="canRead && canDelete"
                class="my-1"
              />

              <VListItem
                v-if="canDelete"
                @click="emit('delete', item)"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-trash"
                    color="error"
                    size="18"
                  />
                </template>
                <VListItemTitle class="text-error">
                  Xóa
                </VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </div>
    </template>

    <template #bottom>
      <VDivider />
      <div class="d-flex align-center justify-space-between pa-4">
        <span class="text-body-2 text-disabled">
          Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} 
          đến {{ Math.min(page * itemsPerPage, totalItems) }} 
          trên tổng {{ totalItems }} bản ghi
        </span>
        <TablePagination
          :page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          @update:page="$emit('update:options', { page: $event, itemsPerPage })"
        />
      </div>
    </template>
  </VDataTableServer>
</template>
