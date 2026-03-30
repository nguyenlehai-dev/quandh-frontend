<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({}),
  },
})

const searchDoc = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const notes = ref('')

// Lấy documents từ meeting API data
const documents = computed(() => {
  const docs = props.meeting.documents || []

  return docs.map((doc, idx) => {
    // Backend returns 'files' array from MeetingDocumentResource
    const file = doc.files?.[0] || {}
    const mimeType = file.mime_type || ''
    const fileType = mimeType.includes('pdf') ? 'pdf' : 'doc'

    return {
      id: doc.id,
      name: doc.title || `Tài liệu ${idx + 1}`,
      type: doc.document_type || doc.type || 'Tài liệu',
      code: doc.document_number || doc.code || '',
      fileType,
      downloadUrl: file.url || '#',
    }
  })
})

const resolveDocTypeVariant = type => {
  const map = {
    'Tờ trình': { bg: '#e0e7ff', text: '#6366f1' },
    'Báo cáo': { bg: '#dcfce7', text: '#16a34a' },
    'Dự thảo': { bg: '#ffedd5', text: '#ea580c' },
    'Biên bản': { bg: '#e0f2fe', text: '#0ea5e9' },
    'Quyết định': { bg: '#fee2e2', text: '#ef4444' },
    'Tài liệu khác': { bg: '#f1f5f9', text: '#64748b' },
    'Tài liệu': { bg: '#f1f5f9', text: '#64748b' },
  }

  return map[type] || { bg: '#f1f5f9', text: '#64748b' }
}

const headers = [
  { title: 'STT', key: 'index', sortable: false, align: 'center', width: '60px' },
  { title: 'TÊN TÀI LIỆU', key: 'name', sortable: false },
  { title: 'THAO TÁC', key: 'actions', sortable: false, align: 'center', width: '100px' },
]
</script>

<template>
  <VRow>
    <!-- Left Column: Documents Table -->
    <VCol
      cols="12"
      lg="7"
    >
      <VCard
        class="mb-4 h-100"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <!-- Card Header -->
        <VCardItem class="pb-3 border-b border-opacity-50">
          <div class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div
              class="d-flex align-center gap-2 font-weight-bold text-uppercase"
              style="color: #475569; font-size: 0.95rem;"
            >
              <VIcon
                icon="tabler-files"
                size="20"
                color="#6366f1"
                class="rounded"
                style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
              />
              Tài liệu cuộc họp
              <VChip
                size="small"
                variant="flat"
                style="background-color: #e0e7ff; color: #6366f1; font-weight: 600;"
                class="ms-2"
              >
                {{ documents.length }} tài liệu
              </VChip>
            </div>

            <div style="inline-size: 250px;">
              <AppTextField
                v-model="searchDoc"
                placeholder="Tìm tài liệu..."
                prepend-inner-icon="tabler-search"
                density="compact"
                clearable
              />
            </div>
          </div>
        </VCardItem>

        <VCardText class="pa-0">
          <!-- Empty state -->
          <div
            v-if="documents.length === 0"
            class="d-flex flex-column align-center py-10"
          >
            <VIcon
              icon="tabler-file-off"
              size="48"
              color="#cbd5e1"
              class="mb-3"
            />
            <div
              class="text-body-1 font-weight-medium"
              style="color: #94a3b8;"
            >
              Chưa có tài liệu
            </div>
          </div>

          <VDataTable
            v-else
            v-model:page="page"
            :headers="headers"
            :items="documents"
            :items-per-page="itemsPerPage"
            :search="searchDoc"
            class="text-no-wrap document-table"
            hover
          >
            <!-- STT -->
            <template #item.index="{ index }">
              <div
                class="text-center font-weight-medium"
                style="color: #64748b;"
              >
                {{ index + 1 }}
              </div>
            </template>

            <!-- Name -->
            <template #item.name="{ item }">
              <div class="d-flex align-center gap-3 py-3">
                <div
                  class="file-icon-box"
                  :class="item.fileType === 'pdf' ? 'pdf-box' : 'doc-box'"
                >
                  <VIcon
                    :icon="item.fileType === 'pdf' ? 'tabler-file-type-pdf' : 'tabler-file-type-doc'"
                    size="24"
                  />
                </div>
                <div>
                  <div
                    class="text-body-1 font-weight-medium mb-1"
                    style="color: #334155;"
                  >
                    {{ item.name }}
                  </div>
                  <div class="d-flex align-center gap-2 mt-1">
                    <VChip
                      size="x-small"
                      variant="flat"
                      :style="`background-color: ${resolveDocTypeVariant(item.type).bg}; color: ${resolveDocTypeVariant(item.type).text}; font-weight: 600; padding: 0 8px;`"
                    >
                      {{ item.type }}
                    </VChip>
                    <span
                      v-if="item.code"
                      class="text-caption"
                      style="color: #94a3b8;"
                    >
                      <VIcon
                        icon="tabler-barcode"
                        size="14"
                        class="me-1"
                      />{{ item.code }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Actions -->
            <template #item.actions>
              <div class="d-flex justify-center w-100">
                <VBtn
                  icon
                  variant="flat"
                  size="small"
                  style="background-color: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;"
                >
                  <VIcon
                    icon="tabler-download"
                    size="18"
                  />
                </VBtn>
              </div>
            </template>

            <!-- Bottom Pagination -->
            <template #bottom>
              <div class="d-flex justify-space-between align-center px-4 py-3 border-t">
                <div class="d-flex align-center gap-2">
                  <span class="text-caption text-disabled">Tài liệu mỗi trang:</span>
                  <div style="inline-size: 70px;">
                    <AppSelect
                      v-model="itemsPerPage"
                      :items="[5, 10, 20]"
                      density="compact"
                    />
                  </div>
                </div>
                <VPagination
                  v-model="page"
                  :length="Math.ceil(documents.length / itemsPerPage)"
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

    <!-- Right Column: Personal Notes -->
    <VCol
      cols="12"
      lg="5"
    >
      <VCard
        class="h-100"
        elevation="0"
        style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgb(0 0 0 / 2%) !important;"
      >
        <VCardItem class="pb-3 border-b border-opacity-50">
          <div
            class="d-flex align-center gap-2 font-weight-bold text-uppercase"
            style="color: #475569; font-size: 0.95rem;"
          >
            <VIcon
              icon="tabler-notebook"
              size="20"
              color="#6366f1"
              class="rounded"
              style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
            />
            Ghi chú cá nhân
          </div>
        </VCardItem>
        <VCardText class="pt-5 pb-5 d-flex flex-column h-100">
          <!-- Mock toolbar -->
          <div
            class="d-flex gap-1 mb-4 editor-toolbar d-flex align-center justify-start flex-wrap pa-2 rounded-lg"
            style="background-color: #f8fafc; border: 1px solid #e2e8f0;"
          >
            <VBtn
              icon
              size="small"
              variant="text"
              rounded
              color="#64748b"
            >
              <VIcon
                icon="tabler-bold"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              rounded
              color="#64748b"
            >
              <VIcon
                icon="tabler-italic"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              rounded
              color="#64748b"
            >
              <VIcon
                icon="tabler-underline"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              rounded
              color="#64748b"
            >
              <VIcon
                icon="tabler-strikethrough"
                size="18"
              />
            </VBtn>
          </div>

          <textarea
            v-model="notes"
            class="note-textarea flex-grow-1 w-100 px-2"
            placeholder="Nhập ghi chú cá nhân trong quá trình tham dự cuộc họp..."
            style="min-block-size: 250px;"
          />

          <VDivider class="mt-4 mb-4 border-opacity-50" />

          <div class="d-flex justify-end mt-auto">
            <VBtn
              color="#6366f1"
              variant="flat"
              prepend-icon="tabler-device-floppy"
              style="color: white; border-radius: 8px; font-weight: 600; text-transform: none; letter-spacing: normal;"
            >
              Lưu Ghi Chú Cục Bộ
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.document-table {
  --v-table-header-height: 40px;
}

.document-table th {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #a1a1aa !important;
  letter-spacing: 0.5px;
}

.file-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  block-size: 40px;
  inline-size: 40px;
}

.pdf-box {
  background-color: #fee2e2;
  color: #ef4444;
}

.doc-box {
  background-color: #e0e7ff;
  color: #6366f1;
}

.editor-toolbar .v-btn {
  color: #71717a;
}

.note-textarea {
  border: none;
  outline: none;
  background-color: transparent;
  color: #3f3f46;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: none;
}

.note-textarea::placeholder {
  color: #a1a1aa;
}
</style>
