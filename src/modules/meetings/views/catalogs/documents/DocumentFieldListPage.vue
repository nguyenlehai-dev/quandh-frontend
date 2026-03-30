<script setup>
import { deleteDocumentField, createDocumentField, updateDocumentField, exportDocumentFields } from '@/modules/meetings/services/meetingService'
import { downloadBlob } from '@/utils/downloadHelper'
import { computed, ref } from 'vue'

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const headers = [
  { title: 'Tên Lĩnh vực', key: 'name' },
  { title: 'Mô tả', key: 'description' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/document-fields', {
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

const openAddDialog = () => {
  formData.value = { name: '', description: '', status: 'active' }
  isAddDialogVisible.value = true
}

const openEditDialog = item => {
  selectedItemId.value = item.id
  formData.value = { name: item.name, description: item.description || '', status: item.status }
  isEditDialogVisible.value = true
}

const submitForm = async () => {
  if (!formData.value.name) {
    alert('Vui lòng nhập tên lĩnh vực')

    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateDocumentField(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
    } else {
      await createDocumentField(formData.value)
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
  if (confirm('Xóa lĩnh vực này?')) {
    await deleteDocumentField(id)
    fetchItems()
  }
}

const isExporting = ref(false)

const exportData = async () => {
  isExporting.value = true
  try {
    const res = await exportDocumentFields({
      search: searchQuery.value || undefined,
      limit: itemsPerPage.value,
      page: page.value,
    })

    downloadBlob(res, 'linh-vuc-tai-lieu.xlsx')
  } catch (error) {
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
            icon="tabler-category"
            class="section-icon"
          />
          Lĩnh vực
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
              placeholder="Tìm kiếm lĩnh vực..."
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
        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
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
            <IconBtn @click="openEditDialog(item)">
              <VIcon icon="tabler-pencil" />
              <VTooltip
                activator="parent"
                location="top"
              >
                Sửa
              </VTooltip>
            </IconBtn>
            <IconBtn @click="deleteItem(item.id)">
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

    <VDialog
      v-model="isAddDialogVisible"
      max-width="500"
    >
      <VCard title="Thêm Lĩnh vực">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên lĩnh vực"
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
            :loading="isSubmitting"
            @click="submitForm"
          >
            Lưu
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog
      v-model="isEditDialogVisible"
      max-width="500"
    >
      <VCard title="Cập nhật Lĩnh vực">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                label="Tên lĩnh vực"
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
            :loading="isSubmitting"
            @click="submitForm"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
