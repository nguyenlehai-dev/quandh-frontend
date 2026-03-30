<script setup>
import { ref } from 'vue'

const recentDevices = ref([
  {
    type: 'Email',
    title: 'Nhận thông báo qua Email',
    description: 'Thư mời họp, cập nhật văn bản',
    email: true,
    browser: false,
    app: true,
  },
  {
    type: 'Nhắc nhở',
    title: 'Nhắc nhở Lịch họp',
    description: 'Trước 1 giờ và 15 phút',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'Biểu quyết',
    title: 'Kết quả Biểu quyết',
    description: 'Ngay khi cuộc họp công bố',
    email: false,
    browser: true,
    app: true,
  },
  {
    type: 'Hệ thống',
    title: 'Thông báo Hệ thống',
    description: 'Bảo trì, cập nhật tính năng',
    email: false,
    browser: false,
    app: true,
  },
])
</script>

<template>
  <VCard title="Cấu hình Thông báo">
    <VCardText>
      Bạn cần thông báo những gì để không bỏ lỡ các thông tin quan trọng.
    </VCardText>

    <VTable
      class="text-no-wrap border"
      style="border-radius: 6px; overflow: hidden;"
    >
      <thead>
        <tr>
          <th class="font-weight-medium">
            LOẠI THÔNG BÁO
          </th>
          <th class="font-weight-medium text-center">
            EMAIL
          </th>
          <th class="font-weight-medium text-center">
            TRÌNH DUYỆT
          </th>
          <th class="font-weight-medium text-center">
            ỨNG DỤNG (APP)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in recentDevices"
          :key="item.title"
        >
          <td class="pt-4 pb-4">
            <h6 class="text-subtitle-1 mb-1">
              {{ item.title }}
            </h6>
            <span class="text-body-2 text-disabled">{{ item.description }}</span>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox
                v-model="item.email"
                hide-details
              />
            </div>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox
                v-model="item.browser"
                hide-details
              />
            </div>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox
                v-model="item.app"
                hide-details
              />
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>

    <VCardText class="d-flex justify-end gap-3 mt-4">
      <VBtn
        variant="tonal"
        color="secondary"
      >
        Hủy
      </VBtn>
      <VBtn color="primary">
        Lưu thay đổi
      </VBtn>
    </VCardText>
  </VCard>
</template>
