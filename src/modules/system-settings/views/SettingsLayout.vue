<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Lấy active tab từ tên route
const activeTab = computed({
  get: () => route.name,
  set: val => router.push({ name: val }),
})

const tabsData = [
  { value: 'system-settings-general', icon: 'tabler-settings', title: 'Cấu hình chung', disabled: false },
  { value: 'admin', icon: 'tabler-device-desktop', title: 'Trang quản trị', disabled: true },
  { value: 'org', icon: 'tabler-building', title: 'Trang chọn tổ chức', disabled: true },
  { value: 'user', icon: 'tabler-users', title: 'Trang người dùng', disabled: true },
  { value: 'social', icon: 'tabler-share', title: 'Mạng xã hội', disabled: true },
  { value: 'api', icon: 'tabler-api', title: 'Kết nối API ngoài', disabled: true },
  { value: 'shortcut', icon: 'tabler-keyboard', title: 'Phím tắt', disabled: true },
  { value: 'system-settings-notifications', icon: 'tabler-file-text', title: 'Cấu hình Nhật ký', disabled: false },
]
</script>

<template>
  <div>
    <!-- Back Header -->
    <div
      class="d-flex align-center mb-6 cursor-pointer"
      @click="$router.push('/system/dashboard')"
    >
      <VIcon
        icon="tabler-arrow-left"
        class="me-2 text-disabled"
      />
      <span class="text-h5 text-disabled">Cấu hình hệ thống</span>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="3"
      >
        <VTabs
          v-model="activeTab"
          direction="vertical"
          class="v-tabs-pill disable-tab-transition"
        >
          <VTab
            v-for="tab in tabsData"
            :key="tab.value"
            :value="tab.value"
            :disabled="tab.disabled"
          >
            <VIcon
              start
              :icon="tab.icon"
            />
            {{ tab.title }}
          </VTab>
        </VTabs>
      </VCol>

      <VCol
        cols="12"
        md="9"
      >
        <slot />
      </VCol>
    </VRow>
  </div>
</template>
