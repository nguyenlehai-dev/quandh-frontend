<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

// Lấy conclusions từ meeting API data
const conclusions = computed(() => {
  const rawConclusions = props.meeting.conclusions || []

  return rawConclusions.map(c => {
    // Detect file type from media
    const media = c.media?.[0] || {}
    const mimeType = media.mime_type || ''
    const fileType = mimeType.includes('pdf') ? 'pdf' : 'doc'

    return {
      id: c.id,
      title: c.title || c.content || 'Kết luận',
      author: c.assigned_to?.name || c.user?.name || c.created_by_name || '',
      time: formatDateTime(c.created_at || ''),
      fileType,
      downloadUrl: media.original_url || media.url || '#',
    }
  })
})

const filterOptions = ['Tất cả phiên thảo luận', 'Phiên sáng', 'Phiên chiều']
const selectedFilter = ref('Tất cả phiên thảo luận')
const signMethod = ref('token')

// Tài liệu đầu tiên để ký
const firstConclusion = computed(() => conclusions.value[0] || null)

const formatDateTime = raw => {
  if (!raw) return ''

  if (raw.includes('/')) {
    return raw
  }

  try {
    const d = new Date(raw)

    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' ' + d.toLocaleDateString('vi-VN')
  }
  catch {
    return raw
  }
}
</script>

<template>
  <VRow>
    <!-- Left Column: Kết luận cuộc họp -->
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
          <div class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div
              class="d-flex align-center gap-2 font-weight-bold text-uppercase"
              style="color: #475569; font-size: 0.95rem;"
            >
              <VIcon
                icon="tabler-clipboard-text"
                size="20"
                color="#6366f1"
                class="rounded"
                style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
              />
              KẾT LUẬN CUỘC HỌP
            </div>
            <div style="inline-size: 200px;">
              <AppSelect
                v-model="selectedFilter"
                :items="filterOptions"
                density="compact"
                hide-details
                variant="outlined"
              />
            </div>
          </div>
        </VCardItem>
        <VCardText class="pt-5 px-5 d-flex flex-column gap-3">
          <!-- Empty state -->
          <div
            v-if="conclusions.length === 0"
            class="d-flex flex-column align-center py-10"
          >
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
              Chưa có kết luận cuộc họp
            </div>
          </div>

          <div
            v-for="item in conclusions"
            v-else
            :key="item.id"
            class="conclusion-card d-flex align-center justify-space-between pa-4 rounded-lg cursor-pointer"
            style="border: 1px solid #e2e8f0; background-color: #fff;"
          >
            <div class="d-flex align-center gap-4">
              <div
                class="file-icon-box"
                :class="item.fileType === 'pdf' ? 'pdf-box' : 'doc-box'"
              >
                <VIcon
                  :icon="item.fileType === 'pdf' ? 'tabler-file-type-pdf' : 'tabler-file-type-doc'"
                  size="28"
                />
              </div>
              <div>
                <div
                  class="font-weight-bold text-body-1 mb-1"
                  style="color: #334155;"
                >
                  {{ item.title }}
                </div>
                <div
                  class="d-flex align-center gap-2 text-caption font-weight-medium"
                  style="color: #64748b;"
                >
                  <span
                    v-if="item.author"
                  >Phụ trách: <span style="color: #475569;">{{ item.author }}</span></span>
                  <span
                    v-if="item.author && item.time"
                    style="color: #cbd5e1;"
                  >|</span>
                  <span v-if="item.time">
                    <VIcon
                      icon="tabler-clock"
                      size="14"
                      class="me-1"
                    />{{ item.time }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex align-center gap-1">
              <VBtn
                icon
                variant="text"
                size="small"
                color="#64748b"
              >
                <VIcon
                  icon="tabler-pencil"
                  size="18"
                />
              </VBtn>
              <VBtn
                icon
                variant="text"
                size="small"
                color="#64748b"
              >
                <VIcon
                  icon="tabler-printer"
                  size="18"
                />
              </VBtn>
              <VBtn
                icon
                variant="text"
                size="small"
                color="#64748b"
              >
                <VIcon
                  icon="tabler-download"
                  size="18"
                />
              </VBtn>
              <VBtn
                icon
                variant="text"
                size="small"
                color="#ef4444"
              >
                <VIcon
                  icon="tabler-trash"
                  size="18"
                />
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Right Column: Ký Phê Duyệt -->
    <VCol
      cols="12"
      lg="5"
    >
      <VCard
        class="h-100"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
          <div
            class="d-flex align-center gap-2 font-weight-bold text-uppercase"
            style="color: #475569; font-size: 0.95rem;"
          >
            <VIcon
              icon="tabler-signature"
              size="20"
              color="#6366f1"
              class="rounded"
              style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
            />
            KÝ PHÊ DUYỆT TÀI LIỆU
          </div>
        </VCardItem>
        <VCardText class="pt-6 px-5 flex-grow-1">
          <div
            class="text-body-2 mb-2 font-weight-medium"
            style="color: #475569;"
          >
            Tài liệu phê duyệt:
          </div>
          <div
            class="d-flex align-center gap-3 pa-3 rounded-lg border mb-6"
            style="background-color: #f8fafc; border-color: #e2e8f0;"
          >
            <div
              class="file-icon-box pdf-box flex-shrink-0"
              style="block-size: 36px; inline-size: 36px;"
            >
              <VIcon
                icon="tabler-file-type-pdf"
                size="20"
              />
            </div>
            <div
              class="font-weight-medium text-body-2 text-truncate"
              style="color: #334155;"
            >
              {{ firstConclusion?.title || 'Chưa chọn tài liệu' }}
            </div>
          </div>

          <div
            class="text-body-2 mb-3 font-weight-medium"
            style="color: #475569;"
          >
            Phương thức ký:
          </div>

          <VRadioGroup
            v-model="signMethod"
            class="mb-8 d-flex flex-column gap-3 sign-method-group"
          >
            <VRadio
              value="token"
              color="#6366f1"
              class="sign-method-radio pa-3 rounded-lg border w-100 mb-2"
              :class="{ 'active-method': signMethod === 'token' }"
            >
              <template #label>
                <div class="d-flex align-center gap-3 w-100">
                  <VIcon
                    icon="tabler-usb"
                    size="24"
                    :color="signMethod === 'token' ? '#6366f1' : '#64748b'"
                  />
                  <div>
                    <div
                      class="font-weight-bold text-body-2"
                      style="color: #334155;"
                    >
                      Chữ ký số (USB Token)
                    </div>
                    <div
                      class="text-caption"
                      style="color: #64748b;"
                    >
                      Yêu cầu cắm USB Token để xác thực
                    </div>
                  </div>
                </div>
              </template>
            </VRadio>
            <VRadio
              value="online"
              color="#6366f1"
              class="sign-method-radio pa-3 rounded-lg border w-100"
              :class="{ 'active-method': signMethod === 'online' }"
            >
              <template #label>
                <div class="d-flex align-center gap-3 w-100">
                  <VIcon
                    icon="tabler-cloud-lock"
                    size="24"
                    :color="signMethod === 'online' ? '#6366f1' : '#64748b'"
                  />
                  <div>
                    <div
                      class="font-weight-bold text-body-2"
                      style="color: #334155;"
                    >
                      Ký duyệt trực tuyến
                    </div>
                    <div
                      class="text-caption"
                      style="color: #64748b;"
                    >
                      Sử dụng chứng thư số cloud
                    </div>
                  </div>
                </div>
              </template>
            </VRadio>
          </VRadioGroup>

          <VBtn
            color="#6366f1"
            block
            size="large"
            prepend-icon="tabler-signature"
            style="color: white; border-radius: 8px; font-weight: 600; text-transform: none; letter-spacing: normal;"
          >
            Thực hiện ký số
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.conclusion-card {
  transition: all 0.2s ease;
}

.conclusion-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
}

.file-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  block-size: 48px;
  inline-size: 48px;
}

.pdf-box {
  background-color: #fee2e2;
  color: #ef4444;
}

.doc-box {
  background-color: #e0e7ff;
  color: #6366f1;
}

.sign-method-group :deep(.v-selection-control) {
  width: 100%;
}

.sign-method-radio {
  transition: all 0.2s ease;
  border-color: #e2e8f0;
  background-color: #fff;
}

.active-method {
  border-color: #6366f1 !important;
  background-color: #eef2ff !important;
}
</style>
