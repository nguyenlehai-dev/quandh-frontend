<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

// Lấy votings từ meeting API data
const votes = computed(() => {
  const rawVotes = props.meeting.votings || []

  return rawVotes.map(v => {
    const statusMap = {
      pending: { label: 'Chưa bắt đầu', bg: '#f1f5f9', text: '#64748b' },
      active: { label: 'Đang diễn ra', bg: '#dcfce7', text: '#16a34a' },
      in_progress: { label: 'Đang diễn ra', bg: '#dcfce7', text: '#16a34a' },
      completed: { label: 'Đã kết thúc', bg: '#fee2e2', text: '#ef4444' },
      closed: { label: 'Đã đóng', bg: '#f1f5f9', text: '#64748b' },
    }

    const st = statusMap[v.status] || statusMap.pending

    // API trả results_summary: { total, agree, disagree, abstain }
    const summary = v.results_summary || {}
    const totalVotes = summary.total || 0

    const results = []

    if (totalVotes > 0 || v.status !== 'pending') {
      results.push({
        label: 'Đồng ý',
        count: summary.agree || 0,
        percent: totalVotes > 0 ? Math.round(((summary.agree || 0) / totalVotes) * 100) : 0,
        color: '#10b981',
      })
      results.push({
        label: 'Không đồng ý',
        count: summary.disagree || 0,
        percent: totalVotes > 0 ? Math.round(((summary.disagree || 0) / totalVotes) * 100) : 0,
        color: '#ef4444',
      })
      results.push({
        label: 'Ý kiến khác',
        count: summary.abstain || 0,
        percent: totalVotes > 0 ? Math.round(((summary.abstain || 0) / totalVotes) * 100) : 0,
        color: '#f59e0b',
      })
    }

    const voted = (summary.agree || 0) + (summary.disagree || 0) + (summary.abstain || 0)

    return {
      id: v.id,
      title: v.title || 'Nội dung biểu quyết',
      time: v.created_at || '',
      options: v.type || 'Biểu quyết',
      status: st.label,
      statusVariant: { bg: st.bg, text: st.text },
      rawStatus: v.status,
      totalVotes: participants.value.length || totalVotes,
      voted,
      results,
    }
  })
})

const participants = computed(() => props.meeting.participants || [])
const activeCount = computed(() => votes.value.filter(v => ['active', 'in_progress'].includes(v.rawStatus)).length)

const selectedVoteId = ref(null)

const selectedVote = computed(() => {
  if (selectedVoteId.value) {
    return votes.value.find(v => v.id === selectedVoteId.value)
  }

  return votes.value[0] || null
})

// Format time
const formatTime = raw => {
  if (!raw) return '--:--'

  if (raw.includes('/')) {
    return raw.split(' ')[0]?.substring(0, 5) + ' ' + (raw.includes('AM') || raw.includes('PM') ? '' : 'PM')
  }

  try {
    const d = new Date(raw)

    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  catch {
    return raw
  }
}
</script>

<template>
  <VRow>
    <!-- Left Column: Nội Dung Biểu Quyết -->
    <VCol
      cols="12"
      lg="7"
    >
      <VCard
        class="h-100"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div
              class="d-flex align-center gap-2 font-weight-bold text-uppercase"
              style="color: #475569; font-size: 0.95rem;"
            >
              <VIcon
                icon="tabler-clipboard-check"
                size="20"
                color="#6366f1"
                class="rounded"
                style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
              />
              NỘI DUNG BIỂU QUYẾT
            </div>
            <VChip
              v-if="activeCount > 0"
              size="small"
              variant="flat"
              style="background-color: #d1fae5; color: #10b981; font-weight: 600;"
            >
              {{ activeCount }} Đang diễn ra
            </VChip>
          </div>
        </VCardItem>
        <VCardText class="pt-5 px-5 d-flex flex-column gap-4">
          <!-- Empty state -->
          <div
            v-if="votes.length === 0"
            class="d-flex flex-column align-center py-10"
          >
            <VIcon
              icon="tabler-checkbox"
              size="48"
              color="#cbd5e1"
              class="mb-3"
            />
            <div
              class="text-body-1 font-weight-medium"
              style="color: #94a3b8;"
            >
              Chưa có nội dung biểu quyết
            </div>
          </div>

          <div
            v-for="vote in votes"
            v-else
            :key="vote.id"
            class="vote-card d-flex flex-column pa-4 rounded-lg cursor-pointer transition-all"
            :class="{ 'active-vote': (selectedVoteId || votes[0]?.id) === vote.id }"
            style="border: 1px solid #f1f5f9; background-color: #f8fafc;"
            @click="selectedVoteId = vote.id"
          >
            <div class="d-flex justify-space-between align-start gap-4">
              <div class="flex-grow-1">
                <div
                  class="font-weight-bold text-body-1 mb-2"
                  style="color: #334155; line-height: 1.4;"
                >
                  {{ vote.title }}
                </div>
                <div
                  class="d-flex align-center gap-4 text-caption font-weight-medium mb-3"
                  style="color: #64748b;"
                >
                  <span class="d-flex align-center gap-1">
                    <VIcon
                      icon="tabler-clock"
                      size="14"
                    /> {{ formatTime(vote.time) }}
                  </span>
                  <span class="d-flex align-center gap-1">
                    <VIcon
                      icon="tabler-list-check"
                      size="14"
                    /> {{ vote.options }}
                  </span>
                </div>
                <VChip
                  size="small"
                  variant="flat"
                  :style="`background-color: ${vote.statusVariant.bg}; color: ${vote.statusVariant.text}; font-weight: 600;`"
                >
                  {{ vote.status }}
                </VChip>
              </div>
              <div class="d-flex flex-column align-end flex-shrink-0">
                <VBtn
                  v-if="vote.rawStatus === 'active' || vote.rawStatus === 'in_progress'"
                  color="#ef4444"
                  variant="flat"
                  size="small"
                  style="color: white; border-radius: 8px; font-weight: 600; text-transform: none; letter-spacing: normal;"
                >
                  Kết thúc
                </VBtn>
                <VBtn
                  v-else-if="vote.rawStatus === 'pending'"
                  icon
                  variant="flat"
                  size="small"
                  style="background-color: #e2e8f0; color: #64748b; border-radius: 8px;"
                >
                  <VIcon
                    icon="tabler-player-play-filled"
                    size="14"
                  />
                </VBtn>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Right Column: Thông Tin Biểu Quyết -->
    <VCol
      cols="12"
      lg="5"
    >
      <VCard
        class="h-100 d-flex flex-column"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
          <div
            class="d-flex align-center gap-2 font-weight-bold text-uppercase"
            style="color: #475569; font-size: 0.95rem;"
          >
            <VIcon
              icon="tabler-chart-pie"
              size="20"
              color="#6366f1"
              class="rounded"
              style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
            />
            THÔNG TIN BIỂU QUYẾT
          </div>
        </VCardItem>
        <VCardText class="pt-6 px-5 flex-grow-1">
          <div
            v-if="!selectedVote"
            class="d-flex flex-column align-center justify-center h-100 py-10"
          >
            <VIcon
              icon="tabler-chart-pie-off"
              size="48"
              color="#cbd5e1"
              class="mb-3"
            />
            <div
              class="text-body-1 font-weight-medium"
              style="color: #94a3b8;"
            >
              Chọn nội dung biểu quyết để xem chi tiết
            </div>
          </div>

          <div
            v-else
            class="d-flex flex-column h-100"
          >
            <div
              class="font-weight-bold text-h6 mb-6"
              style="color: #1e293b; line-height: 1.4;"
            >
              {{ selectedVote.title }}
            </div>

            <div
              class="d-flex flex-column gap-3 mb-6 pa-4 rounded-lg"
              style="background-color: #f8fafc; border: 1px solid #f1f5f9;"
            >
              <div class="d-flex align-center justify-space-between text-body-2">
                <span
                  class="font-weight-medium"
                  style="color: #64748b;"
                >Tình trạng:</span>
                <span
                  class="font-weight-bold"
                  :style="`color: ${selectedVote.statusVariant.text}`"
                >{{ selectedVote.status }}</span>
              </div>
              <div class="d-flex align-center justify-space-between text-body-2">
                <span
                  class="font-weight-medium"
                  style="color: #64748b;"
                >Thời gian:</span>
                <span
                  class="font-weight-bold"
                  style="color: #334155;"
                >{{ formatTime(selectedVote.time) }}</span>
              </div>
              <VDivider
                class="border-opacity-100"
                style="border-color: #e2e8f0; margin-block: 4px;"
              />
              <div class="d-flex align-center justify-space-between text-body-2">
                <span
                  class="font-weight-medium"
                  style="color: #64748b;"
                >Tổng số phiếu:</span>
                <span
                  class="font-weight-bold"
                  style="color: #6366f1;"
                >
                  {{ selectedVote.voted }}/{{ selectedVote.totalVotes }} phiếu ({{ selectedVote.totalVotes ? Math.round((selectedVote.voted / selectedVote.totalVotes) * 100) : 0 }}%)
                </span>
              </div>
            </div>

            <div class="d-flex flex-column gap-5">
              <div
                v-for="res in selectedVote.results"
                :key="res.label"
              >
                <div class="d-flex justify-space-between align-end mb-2">
                  <span
                    class="text-body-2 font-weight-medium"
                    style="color: #475569;"
                  >{{ res.label }}</span>
                  <div class="text-right">
                    <span
                      class="text-body-1 font-weight-bold"
                      :style="`color: ${res.color};`"
                    >{{ res.percent }}%</span>
                    <span
                      class="text-caption font-weight-medium ms-1"
                      style="color: #94a3b8;"
                    >({{ res.count }})</span>
                  </div>
                </div>
                <VProgressLinear
                  :model-value="res.percent"
                  :color="res.color"
                  height="8"
                  rounded
                  bg-color="#f1f5f9"
                  bg-opacity="1"
                />
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.vote-card {
  transition: all 0.2s ease;
}

.vote-card:hover,
.active-vote {
  border-color: #c7d2fe !important;
  background-color: #e0e7ff !important;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
