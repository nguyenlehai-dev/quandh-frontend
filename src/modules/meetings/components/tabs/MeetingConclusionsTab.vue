<script setup>
import { deleteMeetingConclusion, fetchMeetingConclusions, fetchMeetings } from '@/modules/meetings/services/meetingService'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)

// Dialog Add
const isAddDialogVisible = ref(false)
const isSubmitting = ref(false)
const formData = ref({
  title: '',
  content: '',
})

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Nội dung', key: 'content' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// Removed loadMeetings

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []
    
    return
  }
  isLoading.value = true
  try {
    const res = await fetchMeetingConclusions(props.meetingId)
    items.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

const deleteItem = async id => {
  if (confirm('Xóa kết luận này khỏi cuộc họp?')) {
    await deleteMeetingConclusion(props.meetingId, id)
    loadData()
  }
}

const submitAdd = async () => {
  if (!formData.value.title || !formData.value.content) return alert('Vui lòng nhập đầy đủ tiêu đề và nội dung')
  
  isSubmitting.value = true
  try {
    const { createMeetingConclusion } = await import('@/modules/meetings/services/meetingService')
    await createMeetingConclusion(props.meetingId, formData.value)
    
    isAddDialogVisible.value = false
    formData.value = { title: '', content: '' }
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm kết luận', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Kết luận
        </h5>
        <VBtn
          prepend-icon="tabler-plus"
          @click="isAddDialogVisible = true"
        >
          Thêm mới
        </VBtn>
      </VCardText>
      <VDivider />
      
      <VDataTable
        :items="items"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.actions="{ item }">
          <IconBtn @click="deleteItem(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Không có kết luận nào trong cuộc họp này
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Kết luận">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề *"
                placeholder="Ví dụ: Thống nhất phương án A"
              />
            </VCol>
            
            <VCol cols="12">
              <AppTextarea
                v-model="formData.content"
                label="Nội dung kết luận *"
                placeholder="Nhập chi tiết nội dung kết luận..."
                rows="5"
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
            @click="submitAdd"
          >
            Lưu
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
