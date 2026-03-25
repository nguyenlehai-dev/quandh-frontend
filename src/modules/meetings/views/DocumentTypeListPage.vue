<script setup>
import { deleteDocumentType, fetchDocumentTypes, createDocumentType, updateDocumentType } from '@/modules/meetings/services/meetingService'
import { computed, ref, watch } from 'vue'

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const headers = [
  { title: 'Tên Loại tài liệu', key: 'name' },
  { title: 'Mô tả', key: 'description' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const { data: requestData, execute: fetchItems, isFetching: isLoading } = useApi(createUrl('/document-types', {
  query: {
    search: computed(() => searchQuery.value || undefined),
    limit: itemsPerPage,
    page,
    sort_by: computed(() => sortBy.value || undefined),
    sort_order: computed(() => orderBy.value || undefined),
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

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

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
    alert('Vui lòng nhập tên loại tài liệu')
    return
  }
  isSubmitting.value = true
  try {
    if (isEditDialogVisible.value) {
      await updateDocumentType(selectedItemId.value, formData.value)
      isEditDialogVisible.value = false
    } else {
      await createDocumentType(formData.value)
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
  if (confirm('Bạn có chắc chắn muốn xóa Loại tài liệu này?')) {
    await deleteDocumentType(id)
    fetchItems()
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">Loại tài liệu</h5>
        <VSpacer />
        <AppTextField 
          v-model="searchQuery" 
          placeholder="Tìm kiếm..." 
          density="compact" 
          style="max-inline-size: 250px;" 
        />
        <VBtn prepend-icon="tabler-plus" @click="openAddDialog">
          Thêm mới
        </VBtn>
      </VCardText>
      <VDivider />
      
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[ { value: 10, title: '10' }, { value: 20, title: '20' } ]"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>
        
        <template #item.status="{ item }">
          <VChip size="small" :color="item.status === 'active' ? 'success' : 'secondary'">
            {{ item.status === 'active' ? 'Hoạt động' : 'Tạm khóa' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <IconBtn @click="openEditDialog(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="deleteItem(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog v-model="isAddDialogVisible" max-width="500">
      <VCard title="Thêm Loại tài liệu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField v-model="formData.name" label="Tên loại tài liệu" required />
            </VCol>
            <VCol cols="12">
              <AppTextarea v-model="formData.description" label="Mô tả" rows="3" />
            </VCol>
            <VCol cols="12">
              <VSwitch color="primary" v-model="formData.status" true-value="active" false-value="inactive" :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn color="secondary" variant="tonal" @click="isAddDialogVisible = false">Hủy</VBtn>
          <VBtn :loading="isSubmitting" @click="submitForm">Lưu</VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Dialog Cập nhật -->
    <VDialog v-model="isEditDialogVisible" max-width="500">
      <VCard title="Cập nhật Loại tài liệu">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField v-model="formData.name" label="Tên loại tài liệu" required />
            </VCol>
            <VCol cols="12">
              <AppTextarea v-model="formData.description" label="Mô tả" rows="3" />
            </VCol>
            <VCol cols="12">
              <VSwitch color="primary" v-model="formData.status" true-value="active" false-value="inactive" :label="formData.status === 'active' ? 'Hoạt động' : 'Tạm khóa'" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn color="secondary" variant="tonal" @click="isEditDialogVisible = false">Hủy</VBtn>
          <VBtn :loading="isSubmitting" @click="submitForm">Cập nhật</VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
