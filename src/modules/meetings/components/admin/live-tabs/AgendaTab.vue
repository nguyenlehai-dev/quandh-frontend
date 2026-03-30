<script setup>
import { computed } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

// ── Tính toán từ API data ──
const participants = computed(() => props.meeting.participants || [])

const attendanceStats = computed(() => {
  const total = participants.value.length
  const present = participants.value.filter(p => p.attendance_status === 'present').length
  const absent = participants.value.filter(p => p.attendance_status === 'absent').length
  const pending = total - present - absent

  return {
    total,
    present,
    absent,
    pending,
    presentPercent: total ? Math.round((present / total) * 100) : 0,
    absentPercent: total ? Math.round((absent / total) * 100) : 0,
    pendingPercent: total ? Math.round((pending / total) * 100) : 0,
  }
})

const agendas = computed(() => props.meeting.agendas || [])

// Formatting helpers
const formatTimeRange = () => {
  const start = props.meeting.start_at
  const end = props.meeting.end_at

  if (!start) return 'Chưa xác định'

  const formatStr = raw => {
    if (!raw) return ''

    // Handle format "HH:mm:ss DD/MM/YYYY"
    if (raw.includes('/')) {
      const parts = raw.split(' ')

      return parts[0]?.substring(0, 5) + ', Ngày ' + parts[1]
    }

    // Handle ISO format
    try {
      const d = new Date(raw)

      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ', Ngày ' + d.toLocaleDateString('vi-VN')
    }
    catch {
      return raw
    }
  }

  if (end) {
    return formatStr(start) + ' – ' + formatStr(end)
  }

  return formatStr(start)
}

const resolveChairperson = () => {
  const chair = participants.value.find(p => ['chairperson', 'chair'].includes(p.meeting_role))

  return chair?.user_name || chair?.user?.name || 'Chưa phân công'
}

const resolveSecretary = () => {
  const secretary = participants.value.find(p => p.meeting_role === 'secretary')

  return secretary?.user_name || secretary?.user?.name || 'Chưa phân công'
}
</script>

<template>
  <VRow>
    <!-- Left Column: Agenda Content -->
    <VCol
      cols="12"
      lg="8"
    >
      <VCard
        class="mb-4"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <!-- Card Header -->
        <VCardItem class="pb-3 border-b border-opacity-50">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div
              class="d-flex align-center gap-2 font-weight-bold text-uppercase"
              style="color: #475569; font-size: 0.95rem;"
            >
              <VIcon
                icon="tabler-list-details"
                size="20"
                color="#6366f1"
                class="rounded"
                style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
              />
              Chương trình cuộc họp
            </div>

            <div class="d-flex gap-2">
              <VChip
                size="small"
                variant="flat"
                style="background-color: #ede9fe; color: #6366f1; font-weight: 600;"
              >
                Điểm Danh
              </VChip>
              <VChip
                size="small"
                variant="flat"
                style="background-color: #dcfce7; color: #16a34a; font-weight: 600;"
              >
                Gán Tham Dự
              </VChip>
              <VChip
                size="small"
                variant="flat"
                style="background-color: #ffedd5; color: #ea580c; font-weight: 600;"
              >
                Gán Uỷ Quyền
              </VChip>
              <VChip
                size="small"
                variant="flat"
                style="background-color: #fee2e2; color: #dc2626; font-weight: 600;"
              >
                Báo Vắng
              </VChip>
            </div>
          </div>
        </VCardItem>

        <VCardText class="pt-5 pb-5">
          <!-- Time block -->
          <div
            class="mb-6 rounded-lg pa-4 d-flex align-center gap-4"
            style="background-color: #f8faff; border: 1px solid #bfdbfe;"
          >
            <VAvatar
              color="#e0e7ff"
              size="48"
              variant="flat"
            >
              <VIcon
                icon="tabler-clock"
                size="24"
                color="#6366f1"
              />
            </VAvatar>
            <div>
              <div
                class="text-caption font-weight-bold text-uppercase"
                style="color: #6366f1; letter-spacing: 0.5px;"
              >
                Thời gian cuộc họp
              </div>
              <div
                class="text-subtitle-1 font-weight-medium"
                style="color: #334155;"
              >
                {{ formatTimeRange() }}
              </div>
            </div>
          </div>

          <!-- Grid details -->
          <VRow class="mb-8 px-2">
            <VCol
              cols="12"
              md="6"
              class="pb-2"
            >
              <div class="d-flex align-start gap-3">
                <VIcon
                  icon="tabler-map-pin"
                  size="18"
                  color="#94a3b8"
                  class="mt-1"
                />
                <div>
                  <div
                    class="text-caption font-weight-bold text-uppercase"
                    style="color: #94a3b8; letter-spacing: 0.5px;"
                  >
                    Địa điểm
                  </div>
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: #475569;"
                  >
                    {{ meeting.location || 'Chưa xác định' }}
                  </div>
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="pb-2"
            >
              <div class="d-flex align-start gap-3">
                <VIcon
                  icon="tabler-user"
                  size="18"
                  color="#94a3b8"
                  class="mt-1"
                />
                <div>
                  <div
                    class="text-caption font-weight-bold text-uppercase"
                    style="color: #94a3b8; letter-spacing: 0.5px;"
                  >
                    Chủ trì
                  </div>
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: #475569;"
                  >
                    {{ resolveChairperson() }}
                  </div>
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="pt-2"
            >
              <div class="d-flex align-start gap-3">
                <VIcon
                  icon="tabler-users"
                  size="18"
                  color="#94a3b8"
                  class="mt-1"
                />
                <div>
                  <div
                    class="text-caption font-weight-bold text-uppercase"
                    style="color: #94a3b8; letter-spacing: 0.5px;"
                  >
                    Thư ký
                  </div>
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: #475569;"
                  >
                    {{ resolveSecretary() }}
                  </div>
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="pt-2"
            >
              <div class="d-flex align-start gap-3">
                <VIcon
                  icon="tabler-building"
                  size="18"
                  color="#94a3b8"
                  class="mt-1"
                />
                <div>
                  <div
                    class="text-caption font-weight-bold text-uppercase"
                    style="color: #94a3b8; letter-spacing: 0.5px;"
                  >
                    Đơn vị báo cáo
                  </div>
                  <div
                    class="text-body-2 font-weight-medium"
                    style="color: #475569;"
                  >
                    {{ meeting.description ? 'Theo nội dung cuộc họp' : 'Chưa xác định' }}
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>

          <!-- Divider -->
          <VDivider class="mb-5 border-opacity-50" />

          <!-- Nội Dung Chi Tiết -->
          <div
            class="d-flex align-center gap-2 mb-5 font-weight-bold text-uppercase"
            style="color: #475569; font-size: 0.95rem;"
          >
            <VIcon
              icon="tabler-clipboard-list"
              size="20"
              color="#6366f1"
              class="rounded"
              style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
            />
            Nội dung chi tiết
          </div>

          <!-- Agenda List -->
          <div class="agenda-timeline">
            <template v-if="agendas.length === 0">
              <div class="d-flex flex-column align-center py-10">
                <VIcon
                  icon="tabler-clipboard-off"
                  size="48"
                  color="#cbd5e1"
                  class="mb-3"
                />
                <div
                  class="text-body-1 font-weight-medium"
                  style="color: #94a3b8;"
                >
                  Chưa có chương trình nghị sự
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-for="(agenda, i) in agendas"
                :key="agenda.id"
                class="agenda-item"
                :class="{ 'pb-6': i < agendas.length - 1, 'pb-2': i === agendas.length - 1 }"
              >
                <div
                  class="agenda-num"
                  :class="{ active: agenda.is_active }"
                >
                  {{ i + 1 }}
                </div>
                <div class="agenda-info">
                  <div
                    class="text-body-1 font-weight-medium"
                    style="color: #334155;"
                  >
                    {{ agenda.title }}
                  </div>
                  <div
                    class="text-caption d-flex align-center gap-1 mt-1"
                    style="color: #64748b;"
                  >
                    <VIcon
                      icon="tabler-user-circle"
                      size="14"
                    />
                    {{ agenda.presenter_name || 'Chủ trì cuộc họp' }}
                  </div>
                </div>
                <div class="agenda-action">
                  <VChip
                    size="small"
                    variant="flat"
                    style="background-color: #e0e7ff; color: #6366f1; font-weight: 600;"
                  >
                    {{ agenda.duration || 10 }} phút
                  </VChip>
                </div>
              </div>
            </template>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Right Column: Sidebar Stats & Actions -->
    <VCol
      cols="12"
      lg="4"
    >
      <!-- Attendance Card -->
      <VCard
        class="mb-6"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 border-b border-opacity-50">
          <div class="d-flex align-center justify-space-between w-100">
            <div
              class="d-flex align-center gap-2 font-weight-bold text-uppercase"
              style="color: #475569; font-size: 0.95rem;"
            >
              <VIcon
                icon="tabler-users"
                size="20"
                color="#6366f1"
                class="rounded"
                style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
              />
              Thống kê tham dự
            </div>
            <VChip
              size="small"
              variant="flat"
              style="background-color: #e0e7ff; color: #6366f1; font-weight: 600;"
            >
              Tổng: {{ attendanceStats.total }} đại biểu
            </VChip>
          </div>
        </VCardItem>
        <VCardText class="pt-5 pb-5">
          <!-- Có mặt -->
          <div class="mb-5">
            <div
              class="d-flex justify-space-between text-body-2 font-weight-medium mb-2"
              style="color: #334155;"
            >
              <span>Có mặt</span>
              <span style="color: #64748b;">{{ attendanceStats.present }} ({{ attendanceStats.presentPercent }}%)</span>
            </div>
            <VProgressLinear
              :model-value="attendanceStats.presentPercent"
              color="#22c55e"
              bg-color="#dcfce7"
              height="8"
              opacity="1"
              rounded
            />
          </div>

          <!-- Vắng mặt -->
          <div class="mb-5">
            <div
              class="d-flex justify-space-between text-body-2 font-weight-medium mb-2"
              style="color: #334155;"
            >
              <span>Vắng mặt</span>
              <span style="color: #64748b;">{{ attendanceStats.absent }} ({{ attendanceStats.absentPercent }}%)</span>
            </div>
            <VProgressLinear
              :model-value="attendanceStats.absentPercent"
              color="#ef4444"
              bg-color="#fee2e2"
              height="8"
              opacity="1"
              rounded
            />
          </div>

          <!-- Chưa điểm danh -->
          <div>
            <div
              class="d-flex justify-space-between text-body-2 font-weight-medium mb-2"
              style="color: #334155;"
            >
              <span>Chưa điểm danh</span>
              <span style="color: #64748b;">{{ attendanceStats.pending }} ({{ attendanceStats.pendingPercent }}%)</span>
            </div>
            <VProgressLinear
              :model-value="attendanceStats.pendingPercent"
              color="#0ea5e9"
              bg-color="#e0f2fe"
              height="8"
              opacity="1"
              rounded
            />
          </div>
        </VCardText>
      </VCard>

      <!-- Quick Actions Card -->
      <VCard
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 border-b border-opacity-50">
          <div
            class="d-flex align-center gap-2 font-weight-bold text-uppercase"
            style="color: #475569; font-size: 0.95rem;"
          >
            <VIcon
              icon="tabler-bolt"
              size="20"
              color="#6366f1"
              class="rounded"
              style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
            />
            Thao tác nhanh
          </div>
        </VCardItem>
        <VCardText class="pt-5 pb-5 d-flex flex-column gap-3">
          <VBtn
            block
            variant="flat"
            prepend-icon="tabler-lock"
            class="justify-center rounded-lg text-none"
            style="background-color: #fee2e2; color: #ef4444; font-weight: 600;"
          >
            Khoá Danh Sách Điểm Danh
          </VBtn>
          <VBtn
            block
            variant="flat"
            prepend-icon="tabler-shield-check"
            class="justify-center rounded-lg text-none"
            style="background-color: #ffedd5; color: #f97316; font-weight: 600;"
          >
            Truy Cập Trang Quản Trị Điều Hành
          </VBtn>
          <VBtn
            block
            variant="flat"
            prepend-icon="tabler-file-export"
            class="justify-center rounded-lg text-none"
            style="background-color: #6366f1; color: white; font-weight: 600; box-shadow: 0 4px 12px rgb(99 102 241 / 40%) !important;"
          >
            Xuất Báo Cáo Nhanh
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.agenda-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Vertical line connecting nodes */
.agenda-timeline::before {
  position: absolute;
  z-index: 0;
  content: "";
  background-color: #e2e8f0;
  inset-block: 18px 30px;
  inset-inline-start: 17px;
  inline-size: 2px;
}

.agenda-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.agenda-num {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  background-color: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  block-size: 36px;
  inline-size: 36px;
}

.agenda-num.active {
  border: 1px solid #38bdf8;
  background-color: #f0f9ff;
  box-shadow: 0 0 0 4px rgb(56 189 248 / 10%);
  color: #0ea5e9;
}

.agenda-info {
  flex-grow: 1;
  padding-block-start: 6px;
}

.agenda-action {
  flex-shrink: 0;
  padding-block-start: 6px;
}
</style>
