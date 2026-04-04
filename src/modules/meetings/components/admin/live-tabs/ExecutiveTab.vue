<script setup>
import MeetingSpeechRequestsTab from '@/modules/meetings/components/admin/tabs/MeetingSpeechRequestsTab.vue'
import { computed } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

// Lấy dữ liệu từ meeting data
const participants = computed(() => props.meeting.participants || [])

const delegatedParticipants = computed(() =>
  participants.value.filter(item => item.attendance_status === 'delegated' && item.delegated_user),
)

const chairperson = computed(() =>
  participants.value.find(item => item.meeting_role === 'chair'),
)

const secretary = computed(() =>
  participants.value.find(item => item.meeting_role === 'secretary'),
)
</script>

<template>
  <div class="d-flex flex-column gap-6">
    <VRow>
      <VCol
        cols="12"
        lg="4"
      >
        <VCard
          elevation="0"
          class="h-100"
          style="border: 1px solid #f1f1f4; border-radius: 12px; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
        >
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
              >
                <VIcon icon="tabler-crown" />
              </VAvatar>
            </template>
            <VCardTitle>Điều hành cuộc họp</VCardTitle>
            <VCardSubtitle>Thông tin chủ trì và thư ký hiện tại</VCardSubtitle>
          </VCardItem>

          <VCardText class="d-flex flex-column gap-4">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Chủ trì
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ chairperson?.user?.name || chairperson?.user_name || 'Chưa cấu hình' }}
              </div>
            </div>

            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Thư ký
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ secretary?.user?.name || secretary?.user_name || 'Chưa cấu hình' }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        lg="8"
      >
        <VCard
          class="h-100"
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
        >
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
              >
                <VIcon icon="tabler-user-share" />
              </VAvatar>
            </template>
            <VCardTitle>Ủy quyền tham dự</VCardTitle>
            <VCardSubtitle>Các trường hợp đại biểu đã ủy quyền cho người khác tham dự</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VAlert
              v-if="delegatedParticipants.length === 0"
              type="info"
              variant="tonal"
            >
              Chưa có trường hợp ủy quyền tham dự trong cuộc họp này.
            </VAlert>

            <div
              v-else
              class="d-flex flex-column gap-3"
            >
              <div
                v-for="participant in delegatedParticipants"
                :key="participant.id"
                class="d-flex align-center justify-space-between flex-wrap gap-2 rounded px-4 py-3"
                style="background-color: #f8fafc; border: 1px solid #e2e8f0;"
              >
                <div>
                  <div class="text-body-1 font-weight-medium">
                    {{ participant.user?.name || participant.user_name || 'Đại biểu' }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ participant.position || 'Không có chức vụ' }}
                  </div>
                </div>

                <VChip
                  color="success"
                  variant="tonal"
                >
                  {{ participant.delegated_user?.name || participant.delegated_user_name || 'Người nhận ủy quyền' }}
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <MeetingSpeechRequestsTab
      v-if="meeting?.id"
      :meeting-id="meeting.id"
    />
  </div>
</template>
