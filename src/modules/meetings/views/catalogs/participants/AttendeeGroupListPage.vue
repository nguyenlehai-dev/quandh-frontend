<script setup>
/* eslint-disable camelcase, padding-line-between-statements */

import { ability } from '@/plugins/casl/ability'
import { computed, ref, onMounted } from 'vue'

import { useAttendeeGroupListPage } from '@/modules/meetings/composables/useAttendeeGroupListPage'
import AttendeeGroupListToolbar from '@/modules/meetings/components/AttendeeGroupListToolbar.vue'
import AttendeeGroupDataTable from '@/modules/meetings/components/AttendeeGroupDataTable.vue'

// Import the userOptions fetching logic locally since it's just for the add/edit dialogs
const { data: usersData, execute: fetchUsers } = useApi('/users?limit=100')
const userOptions = computed(() => {
  const users = usersData.value?.data ?? []
  
  return users.map(u => ({ title: `${u.name} (${u.email})`, value: u.id }))
})

onMounted(() => {
  fetchUsers()
})

const {
  ITEMS_PER_PAGE_OPTIONS,
  snackbar,
  searchQuery,
  statusFilter,
  meetingTypeFilter,
  itemsPerPage,
  page,
  selectedRows,
  attendeeGroups,
  totalItems,
  loading,
  statusOptions,
  meetingTypeOptions,
  bulkStatusOptions,
  headers,
  isConfirmDialogVisible,
  isConfirming,
  confirmDialog,
  isExporting,
  isImporting,
  
  fetchItems,
  fetchAttendeeGroup,
  createAttendeeGroup,
  updateAttendeeGroup,
  updateOptions,
  handleSelectionChange,
  
  bulkDeleteGroups,
  bulkChangeStatus,
  deleteItem,
  toggleItemStatus,
  executeConfirmedAction,
  handleExport,
  handleImport,
  showSuccess, 
  showError,
} = useAttendeeGroupListPage()

// === Dialog CRUD Local ===
const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedItemId = ref(null)
const isBulkUpdateDialogVisible = ref(false)
const bulkUpdateStatusValue = ref('active')

const formData = ref({
  name: '',
  description: '',
  status: 'active',
  meeting_type_id: null,
  member_ids: [],
})

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active', meeting_type_id: null, member_ids: [] }
  isAddDialogVisible.value = true
}

const openEditDialog = async item => {
  isSubmitting.value = true
  try {
    const response = await fetchAttendeeGroup(item.id)
    const detail = response.data

    selectedItemId.value = item.id
    formData.value = {
      name: detail.name,
      description: detail.description || '',
      status: detail.status,
      meeting_type_id: detail.meeting_type_id,
      member_ids: detail.members?.map(member => member.id) || [],
    }
    isEditDialogVisible.value = true
  } catch (error) {
    showError(error, 'Không thể tải chi tiết nhóm người dự họp.')
  } finally {
    isSubmitting.value = false
  }
}

const submitForm = async () => {
  if (!formData.value.name) {
    showError(new Error('Validation'), 'Vui lòng nhập tên nhóm.')
    
    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateAttendeeGroup(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật nhóm thành phần thành công.')
    } else {
      await createAttendeeGroup(formData.value) 
      isAddDialogVisible.value = false
      showSuccess('Tạo nhóm thành phần thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu nhóm.')
  } finally {
    isSubmitting.value = false
  }
}

const openBulkUpdateStatusDialog = () => {
  if (!selectedRows.value.length) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  await bulkChangeStatus(bulkUpdateStatusValue.value)
  isBulkUpdateDialogVisible.value = false
  isSubmitting.value = false
}

// === Dialog Xem chi tiết thành viên ===
const isMembersDialogVisible = ref(false)
const selectedGroup = ref(null)

const openMembersDialog = async item => {
  isSubmitting.value = true
  try {
    const response = await fetchAttendeeGroup(item.id)
    selectedGroup.value = response.data
    isMembersDialogVisible.value = true
  } catch (error) {
    showError(error, 'Không thể tải danh sách thành viên.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <!-- Header -->
    <div class="d-flex align-center gap-4 mb-6">
      <VAvatar
        color="primary"
        variant="tonal"
        rounded
        size="48"
      >
        <VIcon icon="tabler-users-group" />
      </VAvatar>
      <div>
        <h2 class="text-h4 mb-1">
          Nhóm thành phần tham dự
        </h2>
        <div class="text-body-1 text-disabled">
          Quản lý danh sách các nhóm thành viên mặc định cho các loại cuộc họp
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <VCard>
      <AttendeeGroupListToolbar
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:meeting-type-filter="meetingTypeFilter"
        :status-options="statusOptions"
        :meeting-type-options="meetingTypeOptions"
        :selected-rows-count="selectedRows.length"
        :bulk-status-options="bulkStatusOptions"
        :is-importing="isImporting"
        :is-exporting="isExporting"
        :can-import="$can('import', 'AttendeeGroup')"
        :can-export="$can('export', 'AttendeeGroup')"
        :can-create="$can('store', 'AttendeeGroup')"
        :can-bulk-update-status="$can('update', 'AttendeeGroup')"
        :can-bulk-destroy="$can('destroy', 'AttendeeGroup')"
        @bulk-change-status="openBulkUpdateStatusDialog"
        @bulk-delete="bulkDeleteGroups"
        @import="handleImport"
        @export="handleExport"
        @add="openAddDialog"
      />

      <AttendeeGroupDataTable
        :selected-rows="selectedRows"
        :items="attendeeGroups"
        :total-items="totalItems"
        :headers="headers"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
        :can-update="$can('update', 'AttendeeGroup')"
        :can-delete="$can('delete', 'AttendeeGroup')"
        @update:selected-rows="handleSelectionChange"
        @update:options="updateOptions"
        @show-members="openMembersDialog"
        @edit="openEditDialog"
        @delete="deleteItem"
        @toggle-status="toggleItemStatus"
      />
    </VCard>

    <!-- Dialog Thêm mới -->
    <VNavigationDrawer
      v-model="isAddDialogVisible"
      temporary
      location="end"
      width="520"
    >
      <VCard
        title="Thêm nhóm thành phần tham dự"
        flat
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên nhóm *"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>
            <VCol cols="12">
              <AppAutocomplete
                v-model="formData.member_ids"
                :items="userOptions"
                label="Danh sách thành viên"
                multiple
                chips
                closable-chips
                placeholder="Chọn thành viên..."
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                rows="3"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="active"
                false-value="inactive"
                :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isAddDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitForm"
          >
            Lưu
          </VBtn>
        </VCardText>
      </VCard>
    </VNavigationDrawer>

    <!-- Dialog Cập nhật -->
    <VNavigationDrawer
      v-model="isEditDialogVisible"
      temporary
      location="end"
      width="520"
    >
      <VCard
        title="Cập nhật nhóm thành phần tham dự"
        flat
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên nhóm *"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.meeting_type_id"
                :items="meetingTypeOptions"
                label="Thuộc Loại cuộc họp"
                clearable
              />
            </VCol>
            <VCol cols="12">
              <AppAutocomplete
                v-model="formData.member_ids"
                :items="userOptions"
                label="Danh sách thành viên"
                multiple
                chips
                closable-chips
                placeholder="Chọn thành viên..."
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                rows="3"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="active"
                false-value="inactive"
                :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isEditDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitForm"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VNavigationDrawer>

    <!-- Dialog Xem thành viên -->
    <VDialog
      v-model="isMembersDialogVisible"
      max-width="500"
    >
      <VCard v-if="selectedGroup">
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-users"
            color="primary"
          />
          Thành viên: {{ selectedGroup.name }}
        </VCardTitle>
        <VCardText>
          <div
            v-if="selectedGroup.members?.length"
            class="d-flex flex-column gap-3"
          >
            <div
              v-for="member in selectedGroup.members"
              :key="member.id"
              class="d-flex align-center gap-3 pa-3 rounded"
              style="background: rgba(var(--v-theme-on-surface), 0.04);"
            >
              <VAvatar
                size="36"
                color="primary"
                variant="tonal"
              >
                {{ member.name?.charAt(0)?.toUpperCase() }}
              </VAvatar>
              <div>
                <div class="font-weight-medium">
                  {{ member.name }}
                </div>
                <div class="text-body-2 text-disabled">
                  {{ member.email }}
                </div>
              </div>
              <VSpacer />
              <VChip
                v-if="member.position"
                size="x-small"
                variant="tonal"
              >
                {{ member.position }}
              </VChip>
            </div>
          </div>
          <div
            v-else
            class="text-center text-disabled py-6"
          >
            <VIcon
              icon="tabler-users-minus"
              size="48"
              class="mb-2"
            />
            <div>Chưa có thành viên nào trong nhóm.</div>
          </div>
        </VCardText>
        <VCardText class="d-flex justify-end">
          <VBtn
            variant="tonal"
            @click="isMembersDialogVisible = false"
          >
            Đóng
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Generic Dialogs -->
    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <VDialog
      v-model="isBulkUpdateDialogVisible"
      max-width="420"
    >
      <VCard title="Cập nhật trạng thái hàng loạt">
        <VCardText>
          <AppSelect
            v-model="bulkUpdateStatusValue"
            :items="statusOptions"
            label="Trạng thái mới"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isBulkUpdateDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            color="warning"
            @click="confirmBulkUpdateStatus"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </section>
</template>
