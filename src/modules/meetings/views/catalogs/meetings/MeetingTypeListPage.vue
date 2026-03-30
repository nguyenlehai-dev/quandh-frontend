<script setup>
import { deleteMeetingType, createMeetingType, updateMeetingType, bulkDeleteMeetingTypes, bulkUpdateMeetingTypes, exportMeetingTypes } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref([])

const headers = [
  { title: 'Loại cuộc họp', key: 'name' },
  { title: 'Mô tả', key: 'description' },
  { title: 'Nhóm dự họp', key: 'attendee_groups_count', sortable: false },
  { title: 'Loại TL', key: 'document_types_count', sortable: false },
  { title: 'Cuộc họp', key: 'meetings_count', sortable: false },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/meetings/meeting-types', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    limit: itemsPerPage,
    page,
  },
}))

const items = computed(() => requestData.value?.data ?? [])
const totalItems = computed(() => requestData.value?.meta?.total ?? 0)

const isAddDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const isSubmitting = ref(false)
const selectedItemId = ref(null)

const formData = ref({
  name: '',
  description: '',
  status: 'active',
})

const isBulkUpdateDialogVisible = ref(false)
const bulkUpdateStatusValue = ref('active')

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active' }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = { name: item.name, description: item.description || '', status: item.status }
  isEditDialogVisible.value = true
}

const refFormAdd = ref()
const refFormEdit = ref()

const rules = {
  required: value => !!value || 'Trường này là bắt buộc',
}

const submitForm = async (type = 'add') => {
  const form = type === 'add' ? refFormAdd.value : refFormEdit.value
  const { valid } = await form.validate()

  if (!valid) return

  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateMeetingType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
    } else {
      await createMeetingType(formData.value)
      isAddDialogVisible.value = false
    }
    fetchItems()
  } catch (err) {
    console.error('Action failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = async id => {
  if (confirm('Xóa loại cuộc họp này?')) {
    await deleteMeetingType(id)
    fetchItems()
  }
}

const bulkDelete = async () => {
  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.value.length} mục đã chọn?`)) {
    try {
      await bulkDeleteMeetingTypes({ ids: selectedRows.value })
      selectedRows.value = []
      fetchItems()
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa hàng loạt')
    }
  }
}

const bulkUpdateStatus = async () => {
  if (selectedRows.value.length === 0) return
  isBulkUpdateDialogVisible.value = true
}

const confirmBulkUpdateStatus = async () => {
  isSubmitting.value = true
  try {
    await bulkUpdateMeetingTypes({ ids: selectedRows.value, status: bulkUpdateStatusValue.value })
    selectedRows.value = []
    isBulkUpdateDialogVisible.value = false
    fetchItems()
  } catch (err) {
    console.error('Có lỗi xảy ra khi cập nhật hàng loạt', err)
  } finally {
    isSubmitting.value = false
  }
}

const isExporting = ref(false)
const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportMeetingTypes({
      search: searchQuery.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'loai-cuoc-hop.xlsx')
  } catch (error) {
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
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
            icon="tabler-video"
            class="section-icon"
          />
          Loại cuộc họp
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
              placeholder="Tìm kiếm loại cuộc họp..."
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
        <!-- Bulk Actions -->
        <VBtn
          v-if="selectedRows.length > 0"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="bulkDelete"
        >
          Xóa ({{ selectedRows.length }})
        </VBtn>
        <VBtn
          v-if="selectedRows.length > 0"
          color="warning"
          variant="tonal"
          prepend-icon="tabler-exchange"
          @click="bulkUpdateStatus"
        >
          Đổi trạng thái
        </VBtn>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          prepend-icon="tabler-download"
          :loading="isExporting"
          @click="exportData"
        >
          Xuất Dữ Liệu
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Thêm Mới
        </VBtn>
      </div>
    </div>

    <div class="meeting-section-card mb-6">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model="selectedRows"
        show-select
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        item-value="id"
        class="text-no-wrap"
      >
        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <template #item.attendee_groups_count="{ item }">
          <VChip
            size="small"
            color="primary"
            variant="tonal"
          >
            <VIcon
              start
              icon="tabler-users-group"
              size="14"
            />
            {{ item.attendee_groups_count || 0 }}
          </VChip>
        </template>

        <template #item.document_types_count="{ item }">
          <VChip
            size="small"
            color="info"
            variant="tonal"
          >
            <VIcon
              start
              icon="tabler-category"
              size="14"
            />
            {{ item.document_types_count || 0 }}
          </VChip>
        </template>

        <template #item.meetings_count="{ item }">
          <VChip
            size="small"
            color="warning"
            variant="tonal"
          >
            <VIcon
              start
              icon="tabler-calendar-event"
              size="14"
            />
            {{ item.meetings_count || 0 }}
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
              v-if="$can('update', 'MeetingType')"
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
              v-if="$can('delete', 'MeetingType')"
              @click="deleteItem(item.id)"
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

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="500"
    >
      <VCard title="Thêm Loại cuộc họp">
        <VForm
          ref="refFormAdd"
          @submit.prevent="() => submitForm('add')"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  label="Tên loại cuộc họp"
                  :rules="[rules.required]"
                  required
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
              type="submit"
              :loading="isSubmitting"
            >
              Lưu
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>

    <!-- Dialog Cập nhật -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="500"
    >
      <VCard title="Cập nhật Loại cuộc họp">
        <VForm
          ref="refFormEdit"
          @submit.prevent="() => submitForm('edit')"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  label="Tên loại cuộc họp"
                  :rules="[rules.required]"
                  required
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
              type="submit"
              :loading="isSubmitting"
            >
              Cập nhật
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>

    <!-- Dialog Đổi Trạng Thái Hàng Loạt -->
    <VDialog
      v-model="isBulkUpdateDialogVisible"
      max-width="400"
    >
      <VCard title="Cập nhật trạng thái hàng loạt">
        <VCardText>
          <p class="mb-4">
            Bạn đang thay đổi trạng thái cho <strong class="text-primary">{{ selectedRows.length }}</strong> loại cuộc họp đã chọn.
          </p>
          <AppSelect
            v-model="bulkUpdateStatusValue"
            label="Trạng thái áp dụng"
            :items="[
              { title: 'Hoạt động', value: 'active' },
              { title: 'Tạm khóa', value: 'inactive' },
            ]"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="isSubmitting"
            @click="isBulkUpdateDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            color="warning"
            prepend-icon="tabler-check"
            :loading="isSubmitting"
            @click="confirmBulkUpdateStatus"
          >
            Áp dụng thay đổi
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
