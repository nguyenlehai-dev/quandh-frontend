<script setup>
import { fetchMyMeetings as apiFetchMyMeetings } from '@/modules/meetings/services/meetingService'
import { onMounted, ref } from 'vue'

const searchQuery = ref('')
const meetings = ref([])
const loading = ref(false)

const loadMyMeetings = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    const res = await apiFetchMyMeetings(params)
    meetings.value = res.data?.data || []
  } catch (error) {
    console.error('Lỗi khi tải Lịch họp của tôi', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMyMeetings()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Lịch họp của tôi">
        <VCardText class="d-flex align-center flex-wrap gap-4">
          <AppTextField
            v-model="searchQuery"
            placeholder="Tìm kiếm lịch họp..."
            density="compact"
            style="max-inline-size: 300px;"
            append-inner-icon="tabler-search"
            @keyup.enter="loadMyMeetings"
          />
          <VSpacer />
          <VBtn color="primary" @click="loadMyMeetings">Làm mới</VBtn>
        </VCardText>
        <VDivider />

        <VCardText v-if="loading" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </VCardText>

        <VCardText v-else-if="meetings.length === 0" class="text-center pa-10">
          <p class="text-body-1 text-disabled mb-0">Bạn hiện không có lịch họp nào.</p>
        </VCardText>

        <VCardText v-else>
          <VRow>
            <VCol v-for="meeting in meetings" :key="meeting.id" cols="12" md="6" lg="4">
              <VCard variant="outlined" class="h-100 hover-elevation shadow-sm">
                <VCardItem>
                  <template #title>
                    <div class="text-h6 text-primary text-truncate">{{ meeting.title }}</div>
                  </template>
                  <template #subtitle>
                    <div class="d-flex align-center mt-1 gap-2">
                      <VIcon icon="tabler-calendar" size="16" />
                      <span>{{ meeting.start_time || 'Chưa xác định' }}</span>
                    </div>
                  </template>
                </VCardItem>
                
                <VCardText class="pt-2">
                  <div class="d-flex align-center gap-2 mb-2">
                    <VIcon icon="tabler-map-pin" size="16" class="text-disabled" />
                    <span class="text-body-2">{{ meeting.room_name || 'Phòng trực tuyến' }}</span>
                  </div>
                  <div class="text-body-2 text-truncate line-clamp-2 text-medium-emphasis">
                    {{ meeting.description || 'Không có mô tả chi tiết.' }}
                  </div>
                </VCardText>
                
                <VCardActions class="justify-end px-4 pb-4 mt-auto">
                  <VBtn 
                    variant="elevated" 
                    color="primary" 
                    :to="{ name: 'meetings-participant-details', params: { id: meeting.id } }"
                  >
                    Vào phòng họp
                  </VBtn>
                </VCardActions>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.hover-elevation {
  transition: all 0.3s ease;
}
.hover-elevation:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
