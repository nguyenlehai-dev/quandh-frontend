<script setup>
import { ref } from 'vue'

const { t } = useI18n()

const recentDevices = ref([
  {
    type: 'invite',
    title: 'invite',
    description: 'invite',
    email: true,
    browser: false,
    app: true,
  },
  {
    type: 'reminder',
    title: 'reminder',
    description: 'reminder',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'voting',
    title: 'voting',
    description: 'voting',
    email: false,
    browser: true,
    app: true,
  },
  {
    type: 'system',
    title: 'system',
    description: 'system',
    email: false,
    browser: false,
    app: true,
  },
])
</script>

<template>
  <VCard :title="t('user.user.profile.notifications.title')">
    <VCardText>
      {{ t('user.user.profile.notifications.subtitle') }}
    </VCardText>

    <VTable class="text-no-wrap border" style="border-radius: 6px; overflow: hidden;">
      <thead>
        <tr>
          <th class="font-weight-medium">
            {{ t('user.user.profile.notifications.headers.type') }}
          </th>
          <th class="font-weight-medium text-center">
            {{ t('user.user.profile.notifications.headers.email') }}
          </th>
          <th class="font-weight-medium text-center">
            {{ t('user.user.profile.notifications.headers.browser') }}
          </th>
          <th class="font-weight-medium text-center">
            {{ t('user.user.profile.notifications.headers.app') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in recentDevices" :key="item.type">
          <td class="pt-4 pb-4">
            <h6 class="text-subtitle-1 mb-1">
              {{ t(`user.user.profile.notifications.items.${item.title}_title`) }}
            </h6>
            <span class="text-body-2 text-disabled">{{ t(`user.user.profile.notifications.items.${item.description}_description`) }}</span>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox v-model="item.email" hide-details />
            </div>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox v-model="item.browser" hide-details />
            </div>
          </td>
          <td>
            <div class="d-flex justify-center">
              <VCheckbox v-model="item.app" hide-details />
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>

    <VCardText class="d-flex justify-end gap-3 mt-4">
      <VBtn variant="tonal" color="secondary">
        {{ t('user.user.profile.notifications.actions.cancel') }}
      </VBtn>
      <VBtn color="primary">
        {{ t('user.user.profile.notifications.actions.save') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>
