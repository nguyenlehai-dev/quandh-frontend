<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  itemsPerPageOptions: { type: Array, required: true },
  
  selectedRows: { type: Array, required: true },
  meetings: { type: Array, required: true },
  totalMeetings: { type: Number, required: true },
  
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  
  canRead: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  
  resolveStatusLabel: { type: Function, required: true },
  resolveStatusColor: { type: Function, required: true },
  
  meetingStatusOptions: { type: Array, required: true },
})

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'selectionChange',
  'optionsChange',
  'changeStatus',
  'detail',
  'edit',
  'delete',
  'live-control',
])
</script>

<template>
  <VDataTableServer
    :items-per-page="itemsPerPage"
    :model-value="selectedRows"
    :page="page"
    :items="meetings"
    :items-length="totalMeetings"
    :headers="headers"
    :loading="loading"
    class="meeting-table text-no-wrap"
    show-select
    hover
    @update:items-per-page="emit('update:itemsPerPage', $event)"
    @update:model-value="emit('selectionChange', $event)"
    @update:page="emit('update:page', $event)"
    @update:options="emit('optionsChange', $event)"
  >
    <template #item.index="{ index }">
      <div class="d-flex justify-center">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </div>
    </template>

    <template #item.title="{ item }">
      <div class="font-weight-bold text-uppercase">
        {{ item.title }}
      </div>
    </template>

    <template #item.start_at="{ item }">
      <div>
        <div class="d-flex align-center gap-1">
          <VIcon
            icon="tabler-clock"
            size="14"
            color="primary"
          />
          <span class="font-weight-medium">{{ item.start_at || 'Chưa xác định' }}</span>
        </div>
        <div class="d-flex align-center gap-1 mt-1">
          <VIcon
            icon="tabler-map-pin"
            size="14"
            color="secondary"
          />
          <span class="text-caption text-disabled">{{ item.location || 'Phòng họp trực tuyến' }}</span>
        </div>
      </div>
    </template>

    <template #item.meeting_type_name="{ item }">
      {{ item.meeting_type?.name || item.meeting_type_name || 'N/A' }}
    </template>

    <template #item.created_by="{ item }">
      <div class="d-flex align-center gap-2">
        <VAvatar
          size="28"
          color="primary"
          variant="tonal"
        >
          <span class="text-caption font-weight-bold">{{ (item.created_by || 'N').charAt(0).toUpperCase() }}</span>
        </VAvatar>
        <span class="font-weight-medium">{{ item.created_by || 'N/A' }}</span>
      </div>
    </template>

    <template #item.status="{ item }">
      <div class="d-flex align-center gap-2">
        <VSwitch
          :model-value="['active', 'in_progress'].includes(item.status)"
          color="success"
          density="compact"
          readonly
          hide-details
        />
        <VChip
          size="small"
          :color="resolveStatusColor(item.status)"
          variant="tonal"
        >
          {{ resolveStatusLabel(item.status) }}
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
          :to="{ name: 'meetings-edit', params: { id: item.id } }"
        >
          <VIcon
            icon="tabler-edit"
            size="20"
          />
          <VTooltip
            activator="parent"
            location="top"
          >
            Chỉnh sửa
          </VTooltip>
        </IconBtn>

        <IconBtn
          v-if="canRead || canDelete || canUpdate"
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
                v-if="canUpdate"
                :to="{ name: 'meetings-live-controller', params: { id: item.id } }"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-player-play"
                    size="18"
                  />
                </template>
                <VListItemTitle>Điều hành</VListItemTitle>
              </VListItem>
              
              <VListItem
                v-else-if="canRead"
                :to="{ name: 'meetings-participant-details', params: { id: item.id } }"
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
                v-if="canUpdate || canRead"
                class="my-1"
              />
              
              <VListSubheader>Đổi trạng thái</VListSubheader>
              <VListItem
                v-for="statusOption in meetingStatusOptions.filter(option => option.value !== item.status)"
                :key="statusOption.value"
                @click="emit('changeStatus', item, statusOption.value)"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-refresh"
                    size="18"
                    color="warning"
                  />
                </template>
                <VListItemTitle>{{ statusOption.title }}</VListItemTitle>
              </VListItem>
              
              <VDivider
                v-if="canDelete"
                class="my-1"
              />
              
              <VListItem
                v-if="canDelete"
                @click="emit('delete', item.id)"
              >
                <template #prepend>
                  <VIcon
                    icon="tabler-trash"
                    size="18"
                    color="error"
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
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalMeetings"
        :items-per-page-options="itemsPerPageOptions"
        @update:page="emit('update:page', $event)"
        @update:items-per-page="emit('update:itemsPerPage', $event)"
      />
    </template>
  </VDataTableServer>
</template>

<style scoped>
.meeting-table :deep(.v-data-table-column--select-row),
.meeting-table :deep(.v-data-table__td--select-row) {
  inline-size: 56px;
  text-align: center;
}

.meeting-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
