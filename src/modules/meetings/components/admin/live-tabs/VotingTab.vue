<script setup>
import MeetingVotesTab from '@/modules/meetings/components/admin/tabs/MeetingVotesTab.vue'
import { computed } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

const votings = computed(() => props.meeting?.votings || props.meeting?.votes || [])

const summary = computed(() => ({
  total: votings.value.length,
  open: votings.value.filter(item => item.status === 'open').length,
  pending: votings.value.filter(item => item.status === 'pending').length,
  closed: votings.value.filter(item => item.status === 'closed').length,
}))
</script>

<template>
  <div class="d-flex flex-column gap-6">
    <VRow>
      <VCol
        cols="12"
        md="3"
      >
        <VCard
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px;"
        >
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">
              Tổng phiên biểu quyết
            </div>
            <div class="text-h4 font-weight-bold">
              {{ summary.total }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <VCard
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px;"
        >
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">
              Đang mở
            </div>
            <div class="text-h4 font-weight-bold text-success">
              {{ summary.open }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <VCard
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px;"
        >
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">
              Chờ mở
            </div>
            <div class="text-h4 font-weight-bold text-warning">
              {{ summary.pending }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <VCard
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px;"
        >
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">
              Đã đóng
            </div>
            <div class="text-h4 font-weight-bold text-error">
              {{ summary.closed }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <MeetingVotesTab
      v-if="meeting?.id"
      :meeting-id="meeting.id"
    />
  </div>
</template>
