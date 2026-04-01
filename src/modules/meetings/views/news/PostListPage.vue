<script setup>
import { useActionFeedback } from '@/composables/useActionFeedback'
import { deletePost, createPost, updatePost, exportPosts, changePostStatus } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

const statusOptions = [
  { title: 'Đã xuất bản', value: 'published' },
  { title: 'Bản nháp', value: 'draft' },
  { title: 'Lưu trữ', value: 'archived' },
]

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Ngày tạo', key: 'created_at' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/posts', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    status: computed(() => statusFilter.value || undefined),
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

const formData = ref({ title: '', content: '', status: 'draft' })

const openAddDialog = () => {
  formData.value = { title: '', content: '', status: 'draft' }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = { title: item.title, content: item.content || '', status: item.status }
  isEditDialogVisible.value = true
}

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
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
  if (!formData.value.title) {
    showSnackbar('Vui lòng nhập tiêu đề bài viết.', 'warning')

    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updatePost(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
      showSuccess('Cập nhật bài viết thành công.')
    } else {
      await createPost(formData.value)
      isAddDialogVisible.value = false
      showSuccess('Tạo bài viết thành công.')
    }
    fetchItems()
  } catch (err) {
    showError(err, 'Không thể lưu bài viết.')
    console.error('Action failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa bài viết',
    message: `Bạn có chắc chắn muốn xóa "${item.title}" không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deletePost(item.id)
      showSuccess('Xóa bài viết thành công.')
      fetchItems()
    },
  })
}

const resolveStatusMeta = status => {
  if (status === 'published') return { label: 'Đã xuất bản', color: 'success' }
  if (status === 'archived') return { label: 'Lưu trữ', color: 'secondary' }

  return { label: 'Bản nháp', color: 'warning' }
}

const nextStatusMap = {
  draft: 'published',
  published: 'archived',
  archived: 'draft',
}

const toggleItemStatus = item => {
  const nextStatus = nextStatusMap[item.status] || 'draft'
  const nextLabel = resolveStatusMeta(nextStatus).label

  openConfirmDialog({
    title: 'Đổi trạng thái bài viết',
    message: `Bạn có chắc chắn muốn chuyển "${item.title}" sang trạng thái "${nextLabel}" không?`,
    confirmText: 'Đổi trạng thái',
    confirmColor: 'warning',
    action: async () => {
      await changePostStatus(item.id, nextStatus)
      showSuccess('Đổi trạng thái bài viết thành công.')
      fetchItems()
    },
  })
}

const formatDate = dateStr => {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString('vi-VN')
}

const isExporting = ref(false)

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportPosts({
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'bai-viet.xlsx')
  } catch (error) {
    showError(error, 'Không thể xuất dữ liệu bài viết.')
    console.error('Lỗi khi xuất dữ liệu:', error)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <section>
    <div class="meeting-section-card mb-6">
      <div class="meeting-section-header">
        <div class="meeting-section-title">
          <VIcon
            icon="tabler-news"
            class="section-icon"
          />
          Danh sách Bài viết
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
              placeholder="Tìm kiếm bài viết..."
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
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.title="{ item }">
          <span class="font-weight-medium">{{ item.title }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="resolveStatusMeta(item.status).color"
          >
            {{ resolveStatusMeta(item.status).label }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn @click="openEditDialog(item)">
              <VIcon icon="tabler-pencil" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Sửa
              </VTooltip>
            </IconBtn>
            <IconBtn @click="toggleItemStatus(item)">
              <VIcon
                icon="tabler-repeat"
                color="warning"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Đổi trạng thái
              </VTooltip>
            </IconBtn>
            <IconBtn @click="deleteItem(item)">
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
      max-width="600"
    >
      <VCard title="Thêm Bài viết">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.content"
                label="Nội dung"
                rows="5"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="published"
                false-value="draft"
                :label="formData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'"
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
      <VCard title="Cập nhật Bài viết">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                v-model="formData.content"
                label="Nội dung"
                rows="5"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                v-model="formData.status"
                color="primary"
                true-value="published"
                false-value="draft"
                :label="formData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'"
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

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </section>
</template>
