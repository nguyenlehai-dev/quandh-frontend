<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

// Lấy dữ liệu từ meeting data
const participants = computed(() => props.meeting.participants || [])

// Danh sách đăng ký phát biểu - lấy từ participants có speech_request
const speechRequests = computed(() => {
  return participants.value
    .filter(p => p.speech_requested || p.want_to_speak)
    .map(p => ({
      id: p.id,
      name: p.user_name || p.user?.name || 'Đại biểu',
      role: p.position || p.role_title || p.user?.position || '',
      time: formatTime(p.speech_requested_at || p.updated_at || ''),
      initial: (p.user_name || p.user?.name || 'Đ')[0],
      color: resolveColor(p.id),
    }))
})

// Lịch sử phát biểu - lấy từ participants đã phát biểu
const speechHistory = computed(() => {
  return participants.value
    .filter(p => p.has_spoken || p.speech_completed)
    .map(p => ({
      id: p.id,
      name: p.user_name || p.user?.name || 'Đại biểu',
      role: p.position || p.role_title || p.user?.position || '',
      time: formatTime(p.spoken_at || p.updated_at || ''),
      initial: (p.user_name || p.user?.name || 'Đ')[0],
      color: resolveColor(p.id),
    }))
})

// Người được ủy quyền điều hành
const delegatedPerson = computed(() => {
  const delegated = participants.value.find(p => p.meeting_role === 'delegated_chair' || p.is_delegated)

  return delegated ? (delegated.user_name || delegated.user?.name) : null
})

const reqItemsPerPage = ref(10)
const reqPage = ref(1)
const histItemsPerPage = ref(10)
const histPage = ref(1)

const resolveColor = id => {
  const colors = ['primary', 'info', 'secondary', 'success', 'warning', 'error']

  return colors[id % colors.length]
}

const formatTime = raw => {
  if (!raw) return '--:--'

  if (raw.includes('/')) {
    return raw.split(' ')[0]?.substring(0, 5) + ' ' + (raw.includes('AM') || raw.includes('PM') ? '' : '')
  }

  try {
    const d = new Date(raw)

    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  catch {
    return raw
  }
}

const reqHeaders = [
  { title: 'STT', key: 'index', sortable: false, width: '60px' },
  { title: 'ĐẠI BIỂU', key: 'name', sortable: false },
  { title: 'CHỨC VỤ', key: 'role', sortable: false },
  { title: 'THỜI ĐIỂM', key: 'time', sortable: false, width: '100px' },
]
</script>

<template>
  <div>
    <!-- Top Action Card: Chuyển quyền điều hành -->
    <VCard
      class="mb-6 mx-auto"
      elevation="0"
      style="border: 1px solid #f1f1f4; border-radius: 12px; max-inline-size: 100%; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
    >
      <VCardText class="d-flex align-center justify-space-between py-4">
        <div class="d-flex align-center gap-4">
          <VAvatar
            color="#fef08a"
            variant="tonal"
            size="48"
            style="color: #ca8a04;"
          >
            <VIcon
              icon="tabler-crown"
              size="24"
            />
          </VAvatar>
          <div>
            <div
              class="text-caption font-weight-bold text-uppercase"
              style="color: #64748b; letter-spacing: 0.5px;"
            >
              CHUYỂN QUYỀN ĐIỀU HÀNH
            </div>
            <div class="text-body-2 font-weight-medium mt-1">
              Người được chuyển quyền:
              <VChip
                size="small"
                variant="flat"
                :style="delegatedPerson
                  ? 'background-color: #dcfce7; color: #16a34a;'
                  : 'background-color: #f1f5f9; color: #64748b;'"
                class="ms-1 font-weight-bold"
              >
                {{ delegatedPerson || 'Chưa phân công' }}
              </VChip>
            </div>
          </div>
        </div>
        <VBtn
          color="#6366f1"
          variant="flat"
          prepend-icon="tabler-user-plus"
          style="border-radius: 20px; color: white; font-weight: 600; text-transform: none;"
        >
          Uỷ quyền điều hành
        </VBtn>
      </VCardText>
    </VCard>

    <VRow>
      <!-- Left Column: Danh sách đăng ký phát biểu -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard
          class="h-100"
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
        >
          <VCardItem class="pb-3 pt-5 px-5">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <div
                class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                style="color: #475569; font-size: 0.95rem;"
              >
                <VIcon
                  icon="tabler-microphone"
                  size="20"
                  color="#6366f1"
                  class="rounded"
                  style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
                />
                DANH SÁCH ĐĂNG KÝ PHÁT BIỂU
                <VChip
                  size="small"
                  variant="flat"
                  style="background-color: #e0e7ff; color: #6366f1; font-weight: 600;"
                  class="ms-2"
                >
                  {{ speechRequests.length }} lượt
                </VChip>
              </div>
              <VBtn
                variant="flat"
                size="small"
                prepend-icon="tabler-hand-raise"
                style="background-color: #e0e7ff; color: #6366f1; border-radius: 20px; font-weight: 600; text-transform: none;"
              >
                Đăng Ký Phát Biểu
              </VBtn>
            </div>
          </VCardItem>
          <VCardText class="pa-0">
            <!-- Empty state -->
            <div
              v-if="speechRequests.length === 0"
              class="d-flex flex-column align-center py-10"
            >
              <VIcon
                icon="tabler-microphone-off"
                size="48"
                color="#cbd5e1"
                class="mb-3"
              />
              <div
                class="text-body-1 font-weight-medium"
                style="color: #94a3b8;"
              >
                Chưa có đại biểu đăng ký phát biểu
              </div>
            </div>

            <VDataTable
              v-else
              v-model:page="reqPage"
              :headers="reqHeaders"
              :items="speechRequests"
              :items-per-page="reqItemsPerPage"
              class="text-no-wrap custom-header-table"
              hover
            >
              <template #item.index="{ index }">
                <div
                  class="text-center font-weight-medium"
                  style="color: #64748b;"
                >
                  {{ index + 1 }}
                </div>
              </template>
              <template #item.name="{ item }">
                <div class="d-flex align-center gap-3 py-3">
                  <VAvatar
                    :color="item.color"
                    variant="tonal"
                    size="32"
                  >
                    <span class="font-weight-bold text-caption">{{ item.initial }}</span>
                  </VAvatar>
                  <span
                    class="font-weight-medium"
                    style="color: #334155;"
                  >{{ item.name }}</span>
                </div>
              </template>
              <template #item.role="{ item }">
                <span
                  class="text-body-2"
                  style="color: #475569;"
                >{{ item.role }}</span>
              </template>
              <template #item.time="{ item }">
                <span
                  class="text-body-2 font-weight-medium text-no-wrap"
                  style="color: #334155;"
                >{{ item.time }}</span>
              </template>

              <template #bottom>
                <div class="d-flex justify-space-between align-center px-4 py-3 border-t">
                  <div>
                    <span class="text-caption text-disabled d-block mb-1">Đại biểu mỗi trang:</span>
                    <div style="inline-size: 70px;">
                      <AppSelect
                        v-model="reqItemsPerPage"
                        :items="[5, 10, 20]"
                        density="compact"
                      />
                    </div>
                  </div>
                  <VPagination
                    v-model="reqPage"
                    :length="Math.ceil(speechRequests.length / reqItemsPerPage)"
                    :total-visible="3"
                    density="compact"
                    variant="outlined"
                    active-color="primary"
                  />
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Right Column: Lịch sử phát biểu -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard
          class="h-100"
          elevation="0"
          style="border: 1px solid #f1f1f4; border-radius: 12px; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
        >
          <VCardItem class="pb-3 pt-5 px-5">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <div
                class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                style="color: #475569; font-size: 0.95rem;"
              >
                <VIcon
                  icon="tabler-history"
                  size="20"
                  color="#10b981"
                  class="rounded"
                  style="background-color: #d1fae5; padding: 4px; box-sizing: content-box;"
                />
                LỊCH SỬ PHÁT BIỂU
                <VChip
                  size="small"
                  variant="flat"
                  style="background-color: #d1fae5; color: #10b981; font-weight: 600;"
                  class="ms-2"
                >
                  {{ speechHistory.length }} lượt
                </VChip>
              </div>
              <div
                class="text-body-2 font-weight-bold cursor-pointer d-flex align-center gap-1"
                style="color: #10b981;"
              >
                <VIcon
                  icon="tabler-file-export"
                  size="16"
                />
                Xuất Danh Sách
              </div>
            </div>
          </VCardItem>
          <VCardText class="pa-0">
            <!-- Empty state -->
            <div
              v-if="speechHistory.length === 0"
              class="d-flex flex-column align-center py-10"
            >
              <VIcon
                icon="tabler-history"
                size="48"
                color="#cbd5e1"
                class="mb-3"
              />
              <div
                class="text-body-1 font-weight-medium"
                style="color: #94a3b8;"
              >
                Chưa có lịch sử phát biểu
              </div>
            </div>

            <VDataTable
              v-else
              v-model:page="histPage"
              :headers="reqHeaders"
              :items="speechHistory"
              :items-per-page="histItemsPerPage"
              class="text-no-wrap custom-header-table"
              hover
            >
              <template #item.index="{ index }">
                <div
                  class="text-center font-weight-medium"
                  style="color: #64748b;"
                >
                  {{ index + 1 }}
                </div>
              </template>
              <template #item.name="{ item }">
                <div class="d-flex align-center gap-3 py-3">
                  <VAvatar
                    :color="item.color"
                    variant="tonal"
                    size="32"
                  >
                    <span class="font-weight-bold text-caption">{{ item.initial }}</span>
                  </VAvatar>
                  <span
                    class="font-weight-medium"
                    style="color: #334155;"
                  >{{ item.name }}</span>
                </div>
              </template>
              <template #item.role="{ item }">
                <span
                  class="text-body-2"
                  style="color: #475569;"
                >{{ item.role }}</span>
              </template>
              <template #item.time="{ item }">
                <span
                  class="text-body-2 font-weight-medium text-no-wrap"
                  style="color: #334155;"
                >{{ item.time }}</span>
              </template>

              <template #bottom>
                <div class="d-flex justify-space-between align-center px-4 py-3 border-t">
                  <div>
                    <span class="text-caption text-disabled d-block mb-1">Đại biểu mỗi trang:</span>
                    <div style="inline-size: 70px;">
                      <AppSelect
                        v-model="histItemsPerPage"
                        :items="[5, 10, 20]"
                        density="compact"
                      />
                    </div>
                  </div>
                  <VPagination
                    v-model="histPage"
                    :length="Math.ceil(speechHistory.length / histItemsPerPage)"
                    :total-visible="3"
                    density="compact"
                    variant="outlined"
                    active-color="primary"
                  />
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.custom-header-table {
  --v-table-header-height: 48px;
}

:deep(.custom-header-table th) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px;
  background-color: #fafafa !important;
  border-block-end: 1px solid #f1f1f4 !important;
  border-block-start: 1px solid #f1f1f4 !important;
  color: #a1a1aa !important;
}

:deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
  border-block-end: 1px solid rgb(0 0 0 / 4%);
}
</style>
