<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  bulkDeleteAttendeeGroups,
  bulkUpdateAttendeeGroups,
  changeAttendeeGroupStatus,
  createAttendeeGroup,
  deleteAttendeeGroup,
  exportAttendeeGroups,
  importAttendeeGroups,
  updateAttendeeGroup,
} from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref([])
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)

const confirmDialog = ref({
  title: '',
  message: '',
  confirmText: 'Xác nhận',
  confirmColor: 'primary',
  action: null,
})

const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const statusOptions = [
  { title: 'Hoạt động', value: 'active' },
  { title: 'Tạm khóa', value: 'inactive' },
]

const headers = [
  { title: 'Tên Nhóm', key: 'name' },
  { title: 'Loại cuộc họp', key: 'meeting_type_name' },
  { title: 'Thành viên', key: 'members_count' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// Fetch danh sách nhóm
const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meetings/attendee-groups', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => statusFilter.value || undefined),
    limit: itemsPerPage,
    page,
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

// Fetch danh sách Loại cuộc họp (cho dropdown)
const { data: meetingTypesData } = useApi('/meetings/meeting-types?limit=100')

const meetingTypeOptions = computed(() => {
  const types = meetingTypesData.value?.data ?? []
  
  return [{ title: '-- Không gắn --', value: null }, ...types.map(t => ({ title: t.name, value: t.id }))]
})

// Fetch danh sách User (cho chọn thành viên)
const { data: usersData } = useApi('/users?limit=200')

const userOptions = computed(() => {
  const users = usersData.value?.data ?? []
  
  return users.map(u => ({ title: `${u.name} (${u.email})`, value: u.id }))
})

// === Dialog CRUD ===
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

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = {
    name: item.name,
    description: item.description || '',
    status: item.status,
    meeting_type_id: item.meeting_type_id,
    member_ids: item.members?.map(m => m.id) || [],
  }
  isEditDialogVisible.value = true
}

const openConfirmDialog = options => {
  confirmDialog.value = {
    title: options.title,
    message: options.message,
    confirmText: options.confirmText ?? 'Xác nhận',
    confirmColor: options.confirmColor ?? 'primary',
    action: options.action ?? null,
  }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return

  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  } catch (err) {
    showError(err, 'Không thể thực hiện thao tác này.')
  } finally {
    isConfirming.value = false
  }
}

const submitForm = async () => {
  if (!formData.value.name) {
    showSnackbar('Vui lòng nhập tên nhóm.', 'warning')

    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateAttendeeGroup(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật nhóm người dự họp thành công.')
    } else {
      await createAttendeeGroup(formData.value) 
      isAddDialogVisible.value = false
      showSuccess('Tạo nhóm người dự họp thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu nhóm người dự họp.')
    console.error('Action failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa nhóm người dự họp',
    message: `Bạn có chắc chắn muốn xóa nhóm "${item.name}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteAttendeeGroup(item.id)
      showSuccess('Xóa nhóm người dự họp thành công.')
      fetchItems()
    },
  })
}

const bulkDelete = () => {
  if (!selectedRows.value.length) return

  openConfirmDialog({
    title: 'Xoa hang loat nhom',
    message: `Ban co chac chan muon xoa ${selectedRows.value.length} nhom da chon khong?`,
    confirmText: 'Xoa',
    confirmColor: 'error',
    action: async () => {
      await bulkDeleteAttendeeGroups({ ids: selectedRows.value })
      selectedRows.value = []
      showSuccess('Xoa hang loat nhom nguoi du hop thanh cong.')
      fetchItems()
    },
  })
}

const bulkUpdateStatus = () => {
  if (!selectedRows.value.length) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  try {
    await bulkUpdateAttendeeGroups({ ids: selectedRows.value, status: bulkUpdateStatusValue.value })
    selectedRows.value = []
    isBulkUpdateDialogVisible.value = false
    showSuccess('Cap nhat trang thai hang loat nhom nguoi du hop thanh cong.')
    fetchItems()
  } catch (err) {
    showError(err, 'Khong the cap nhat trang thai hang loat.')
    console.error('Bulk update attendee groups failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const toggleItemStatus = item => {
  const nextStatus = item.status === 'active' ? 'inactive' : 'active'
  const nextLabel = nextStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'

  openConfirmDialog({
    title: 'Đổi trạng thái nhóm người dự họp',
    message: `Bạn có chắc chắn muốn chuyển "${item.name}" sang trạng thái "${nextLabel}" không?`,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await changeAttendeeGroupStatus(item.id, nextStatus)
      showSuccess('Đổi trạng thái nhóm người dự họp thành công.')
      fetchItems()
    },
  })
}

// === Dialog Xem chi tiết thành viên ===
const isMembersDialogVisible = ref(false)
const selectedGroup = ref(null)

const openMembersDialog = item => {
  selectedGroup.value = item
  isMembersDialogVisible.value = true
}

const isExporting = ref(false)
const isImportDialogVisible = ref(false)
const importFile = ref([])

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportAttendeeGroups({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'nhom-thanh-phan-tham-du.xlsx')
  } catch (error) {
    showError(error, 'Không thể xuất dữ liệu nhóm người dự họp.')
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}

const importData = async () => {
  if (!importFile.value || (Array.isArray(importFile.value) && importFile.value.length === 0)) {
    showSnackbar('Vui long chon file import.', 'warning')

    return
  }

  isSubmitting.value = true
  try {
    const payload = new FormData()
    const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

    payload.append('file', file)
    await importAttendeeGroups(payload)
    isImportDialogVisible.value = false
    importFile.value = []
    showSuccess('Import nhom nguoi du hop thanh cong.')
    fetchItems()
  } catch (error) {
    showError(error, 'Khong the import nhom nguoi du hop.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <!-- Filter Section -->
    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-users-group"
            class="section-icon"
          />
          Nhóm người dự họp
        </div>
      </div>
      <div class="pa-5">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Tìm kiếm
            </div>
            <AppTextField
              v-model="searchQuery"
              placeholder="Tìm kiếm nhóm..."
              density="compact"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 font-weight-medium mb-1">
              Trạng thái
            </div>
            <AppSelect
              v-model="statusFilter"
              :items="[{ title: 'Tất cả trạng thái', value: '' }, ...statusOptions]"
              placeholder="Lọc theo trạng thái"
              density="compact"
            />
          </VCol>
        </VRow>
      </div>
    </div>

    <!-- Table Actions Bar -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-4">
      <div class="d-flex align-center gap-3">
        <AppSelect
          v-model="itemsPerPage"
          :items="[
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 },
          ]"
          density="compact"
          style="max-inline-size: 80px;"
        />
        <VBtn
          v-if="selectedRows.length > 0"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="bulkDelete"
        >
          Xoa ({{ selectedRows.length }})
        </VBtn>
        <VBtn
          v-if="selectedRows.length > 0"
          color="warning"
          variant="tonal"
          prepend-icon="tabler-exchange"
          @click="bulkUpdateStatus"
        >
          Doi trang thai
        </VBtn>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          prepend-icon="tabler-upload"
          @click="isImportDialogVisible = true"
        >
          Nhap Du Lieu
        </VBtn>
        <VBtn
          variant="outlined"
          prepend-icon="tabler-download"
          :loading="isExporting"
          @click="exportData"
        >
          Xuất Dữ Liệu
        </VBtn>
        <VBtn
          v-if="$can('create', 'AttendeeGroup')"
          color="primary"
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Thêm Mới
        </VBtn>
      </div>
    </div>

    <!-- Data Table -->
    <div class="meeting-section-card mb-6">
      <VDataTableServer
        v-model="selectedRows"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
      >
        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <template #item.meeting_type_name="{ item }">
          <VChip
            v-if="item.meeting_type_name"
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ item.meeting_type_name }}
          </VChip>
          <span
            v-else
            class="text-disabled"
          >Chưa gắn</span>
        </template>

        <template #item.members_count="{ item }">
          <VChip
            size="small"
            :color="item.members_count > 0 ? 'info' : 'secondary'"
            variant="tonal"
            class="cursor-pointer"
            @click="openMembersDialog(item)"
          >
            <VIcon
              start
              icon="tabler-users"
              size="14"
            />
            {{ item.members_count || 0 }} người
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.status === 'active' ? 'success' : 'secondary'"
          >
            {{ item.status === 'active' ? 'Hoạt động' : 'Tạm khóa' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="$can('update', 'AttendeeGroup')"
              @click="openEditDialog(item)"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Sửa
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('update', 'AttendeeGroup')"
              @click="toggleItemStatus(item)"
            >
              <VIcon
                :icon="item.status === 'active' ? 'tabler-toggle-right' : 'tabler-toggle-left'"
                :color="item.status === 'active' ? 'success' : 'warning'"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Đổi trạng thái
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('delete', 'AttendeeGroup')"
              @click="deleteItem(item)"
            >
              <VIcon
                icon="tabler-trash"
                color="error"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Xóa
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between pa-4">
            <span class="text-body-2 text-disabled">
              Hiển thị {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} đến {{ Math.min(page * itemsPerPage, totalItems) }} trên tổng {{ totalItems }} bản ghi
            </span>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalItems"
            />
          </div>
        </template>
      </VDataTableServer>
    </div>

    <!-- Dialog Thêm/Sửa -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Nhóm người dự họp">
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
                label="Thành viên trong nhóm"
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
    </VDialog>

    <!-- Dialog Cập nhật -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="600"
    >
      <VCard title="Cập nhật Nhóm người dự họp">
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
                label="Thành viên trong nhóm"
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
    </VDialog>

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

    <VDialog
      v-model="isImportDialogVisible"
      max-width="480"
    >
      <VCard title="Nhap nhom nguoi du hop">
        <VCardText>
          <VFileInput
            v-model="importFile"
            label="Chon file Excel / CSV"
            accept=".xlsx,.xls,.csv"
            prepend-icon="tabler-upload"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isImportDialogVisible = false"
          >
            Huy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="importData"
          >
            Import
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

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
      <VCard title="Cap nhat trang thai hang loat">
        <VCardText>
          <AppSelect
            v-model="bulkUpdateStatusValue"
            :items="statusOptions"
            label="Trang thai moi"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isBulkUpdateDialogVisible = false"
          >
            Huy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            color="warning"
            @click="confirmBulkUpdateStatus"
          >
            Cap nhat
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
