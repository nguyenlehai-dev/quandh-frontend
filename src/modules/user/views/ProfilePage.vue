<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfileInfoTab from './ProfileInfoTab.vue'
import ProfileTrendsTab from './ProfileTrendsTab.vue'
import ProfileActivityLogsTab from './ProfileActivityLogsTab.vue'
import ProfileNotificationsTab from './ProfileNotificationsTab.vue'

const activeTab = ref('info')
const router = useRouter()

const goBack = () => {
  router.back()
}

const tabs = [
  { title: 'Thông tin người dùng', icon: 'tabler-user', tab: 'info' },
  { title: 'Xu hướng hoạt động', icon: 'tabler-chart-line', tab: 'trends' },
  { title: 'Nhật ký hoạt động', icon: 'tabler-history', tab: 'activities' },
  { title: 'Các thông báo', icon: 'tabler-bell', tab: 'notifications' },
]
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center mb-6 gap-2">
      <IconBtn
        class="me-1"
        @click="goBack"
      >
        <VIcon
          icon="tabler-arrow-left"
          size="24"
        />
      </IconBtn>
      <h3 class="text-h4 font-weight-medium mb-0">
        Hồ sơ cá nhân
      </h3>
    </div>

    <!-- Tabs Header -->
    <div class="mb-6">
      <VTabs
        v-model="activeTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="item in tabs"
          :key="item.tab"
          :value="item.tab"
        >
          <VIcon
            size="20"
            start
            :icon="item.icon"
          />
          {{ item.title }}
        </VTab>
      </VTabs>
    </div>

    <!-- Tabs Content -->
    <VWindow
      v-model="activeTab"
      class="disable-tab-transition"
      :touch="false"
    >
      <VWindowItem value="info">
        <ProfileInfoTab />
      </VWindowItem>
      
      <VWindowItem value="trends">
        <ProfileTrendsTab />
      </VWindowItem>
      
      <VWindowItem value="activities">
        <ProfileActivityLogsTab />
      </VWindowItem>
      
      <VWindowItem value="notifications">
        <ProfileNotificationsTab />
      </VWindowItem>
    </VWindow>
  </div>
</template>
