<script setup>
import { deleteMeetingVote, fetchMeetings, fetchMeetingVotes } from '@/modules/meetings/services/meetingService'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)

const headers = [
  { title: 'Tiêu đề', key: 'title' },
  { title: 'Loại', key: 'voting_type' },
  { title: 'Trạng thái', key: 'status' },
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
    const res = await fetchMeetingVotes(props.meetingId)
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
  if (confirm('Xóa biểu quyết này?')) {
    await deleteMeetingVote(props.meetingId, id)
    loadData()
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
        <VBtn
          prepend-icon="tabler-plus"
          @click="() => alert('Cần chuyển hướng sang trang chi tiết họp để tạo biểu quyết')"
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
        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="item.status === 'open' ? 'success' : (item.status === 'closed' ? 'error' : 'secondary')"
          >
            {{ item.status }}
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
  </div>
</template>
