<script setup>
import { ref } from 'vue'

const timelineLogs = ref([
  {
    title: 'Đăng nhập hệ thống thành công',
    time: '12 ngày trước',
    color: 'success',
    icon: 'tabler-login',
    description: 'IP: 192.168.1.1 - Thiết bị: Chrome trên Windows',
  },
  {
    title: 'Tải lên tài liệu',
    time: '15 ngày trước',
    color: 'info',
    icon: 'tabler-file-upload',
    description: 'Đã tải lên "Báo cáo thường niên 2023.pdf" vào cuộc họp Giao ban tháng 10',
  },
  {
    title: 'Thay đổi trạng thái biểu quyết',
    time: '20 ngày trước',
    color: 'warning',
    icon: 'tabler-checkbox',
    description: 'Đã biểu quyết TÁN THÀNH cho đề xuất 1 của cuộc họp Hội đồng',
  },
  {
    title: 'Xóa ghi chú cá nhân',
    time: '1 tháng trước',
    color: 'error',
    icon: 'tabler-trash',
    description: 'Xóa 1 ghi chú riêng tư khỏi cuộc họp Giao ban tháng 9',
  },
])
</script>

<template>
  <VCard title="Lịch sử hoạt động gần đây">
    <VCardText>
      <VTimeline
        density="compact"
        align="start"
        truncate-line="both"
        class="v-timeline--variant-outlined"
      >
        <VTimelineItem
          v-for="item in timelineLogs"
          :key="item.title"
          :dot-color="item.color"
          size="x-small"
        >
          <template #icon>
            <VIcon
              :icon="item.icon"
              size="18"
              class="text-white"
            />
          </template>
          
          <div class="d-flex justify-space-between align-center flex-wrap">
            <h6 class="text-h6 font-weight-medium mb-1">
              {{ item.title }}
            </h6>
            <span class="text-caption text-disabled">{{ item.time }}</span>
          </div>
          <p class="mb-0 text-body-2">
            {{ item.description }}
          </p>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
