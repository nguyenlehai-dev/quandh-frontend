<script setup>
import { createMeetingVote, deleteMeetingVote, fetchMeetingVotes } from '@/modules/meetings/services/meetingService'
import { ref, watch } from 'vue'

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
  type: 'agree_disagree',
  description: '',
})

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Loại', key: 'type' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

const votingTypeOptions = [
  { title: 'Đồng ý / Không đồng ý', value: 'agree_disagree' },
  { title: 'Trắc nghiệm nhiều lựa chọn', value: 'multiple_choice' },
  { title: 'Bỏ phiếu kín', value: 'secret_ballot' },
]

const votingTypeLabel = type => {
  const found = votingTypeOptions.find(o => o.value === type)

  return found ? found.title : type
}

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []

    return
  }
  isLoading.value = true
  try {
    const res = await fetchMeetingVotes(props.meetingId)

    items.value = res.data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

const deleteItem = async id => {
  if (confirm('Xóa biểu quyết này?')) {
    await deleteMeetingVote(props.meetingId, id)
    loadData()
  }
}

const submitAdd = async () => {
  if (!formData.value.title) return alert('Vui lòng nhập tiêu đề biểu quyết')

  isSubmitting.value = true
  try {
    await createMeetingVote(props.meetingId, formData.value)

    isAddDialogVisible.value = false
    formData.value = { title: '', type: 'agree_disagree', description: '' }
    loadData()
  }
  catch (err) {
    console.error('Lỗi khi thêm biểu quyết', err)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Danh sách Biểu quyết
        </h5>
        <VSpacer />
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
        <template #item.type="{ item }">
          <VChip
            size="small"
            variant="tonal"
          >
            {{ votingTypeLabel(item.type) }}
          </VChip>
        </template>
        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.status === 'open' ? 'success' : (item.status === 'closed' ? 'error' : 'secondary')"
          >
            {{ item.status === 'open' ? 'Đang mở' : (item.status === 'closed' ? 'Đã đóng' : item.status) }}
          </VChip>
        </template>
        <template #item.actions="{ item }">
          <IconBtn @click="deleteItem(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Không có dữ liệu biểu quyết
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Biểu quyết">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.title"
                label="Tiêu đề *"
                placeholder="Ví dụ: Biểu quyết thông qua dự thảo"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="formData.type"
                label="Loại biểu quyết"
                :items="votingTypeOptions"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formData.description"
                label="Mô tả"
                placeholder="Nhập mô tả chi tiết về nội dung biểu quyết..."
                rows="3"
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
