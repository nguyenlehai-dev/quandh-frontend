<script setup>
import { computed } from 'vue'

const { t } = useI18n()

const timelineLogs = computed(() => ([
  {
    title: t('user.user.profile.activities.items.login_title'),
    time: t('user.user.profile.activities.items.login_time'),
    color: 'success',
    icon: 'tabler-login',
    description: t('user.user.profile.activities.items.login_description'),
  },
  {
    title: t('user.user.profile.activities.items.upload_title'),
    time: t('user.user.profile.activities.items.upload_time'),
    color: 'info',
    icon: 'tabler-file-upload',
    description: t('user.user.profile.activities.items.upload_description'),
  },
  {
    title: t('user.user.profile.activities.items.vote_title'),
    time: t('user.user.profile.activities.items.vote_time'),
    color: 'warning',
    icon: 'tabler-checkbox',
    description: t('user.user.profile.activities.items.vote_description'),
  },
  {
    title: t('user.user.profile.activities.items.note_delete_title'),
    time: t('user.user.profile.activities.items.note_delete_time'),
    color: 'error',
    icon: 'tabler-trash',
    description: t('user.user.profile.activities.items.note_delete_description'),
  },
]))
</script>

<template>
  <VCard :title="t('user.user.profile.activities.title')">
    <VCardText>
      <VTimeline density="compact" align="start" truncate-line="both" class="v-timeline--variant-outlined">
        <VTimelineItem
          v-for="item in timelineLogs"
          :key="item.title"
          :dot-color="item.color"
          size="x-small"
        >
          <template #icon>
            <VIcon :icon="item.icon" size="18" class="text-white" />
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
