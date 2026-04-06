<script setup>
import '@/modules/meetings/assets/meeting-styles.css'
import { useMeetingEditPage } from '@/modules/meetings/composables/useMeetingEditPage'
import MeetingAttendeesTab from '@/modules/meetings/components/admin/tabs/MeetingAttendeesTab.vue'
import MeetingConclusionsTab from '@/modules/meetings/components/admin/tabs/MeetingConclusionsTab.vue'
import MeetingDocumentsTab from '@/modules/meetings/components/admin/tabs/MeetingDocumentsTab.vue'
import MeetingEditModeRequiredCard from '@/modules/meetings/components/admin/shared/MeetingEditModeRequiredCard.vue'
import MeetingQrPanel from '@/modules/meetings/components/admin/shared/MeetingQrPanel.vue'
import MeetingSpeechRequestsTab from '@/modules/meetings/components/admin/tabs/MeetingSpeechRequestsTab.vue'
import MeetingVotesTab from '@/modules/meetings/components/admin/tabs/MeetingVotesTab.vue'

const {
  activeTab,
  addAgendaItem,
  addAttendeeItem,
  attendeeGroupsForType,
  autoFillFromGroups,
  canEditMeeting,
  canSaveAndAdd,
  canSaveCurrentMeeting,
  dateTimeConfig,
  formData,
  isEditMode,
  isTabVisible,
  isTabDisabled,
  loading,
  loadingGroups,
  meetingTypeList,
  removeAgendaItem,
  removeAttendeeItem,
  route,
  selectedGroupIds,
  snackbar,
  submitForm,
  submittingAction,
  tabsConfig,
  visibleTabs,
  timeConfig,
  userList,
} = useMeetingEditPage()
</script>

<template>
  <div class="h-100 d-flex flex-column surface-ground">
    <VOverlay
      :model-value="loading && isEditMode"
      class="align-center justify-center"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="48"
      />
    </VOverlay>

    <template v-if="!loading || !isEditMode">
      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- Premium Header Card -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="px-4 pt-4 mb-4">
        <VCard
          elevation="0"
          style="border-radius: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);"
        >
          <div
            class="d-flex align-center justify-space-between w-100 flex-wrap gap-4"
            style="padding: 24px 32px;"
          >
            <!-- Left side Title -->
            <div
              class="d-flex flex-column gap-2"
              style="max-width: 60%"
            >
              <div class="d-flex align-center gap-3">
                <IconBtn
                  variant="outlined"
                  size="small"
                  color="primary"
                  style="background-color: white;"
                  :to="{ name: 'meetings-list' }"
                >
                  <VIcon
                    icon="tabler-arrow-left"
                    size="20"
                  />
                </IconBtn>
                <VChip
                  size="small"
                  variant="flat"
                  color="white"
                  style="color: #6366f1; border: 1px solid #c7d2fe; font-weight: 600;"
                >
                  <VIcon
                    start
                    size="16"
                    color="#6366f1"
                  >
                    tabler-calendar-plus
                  </VIcon> {{ isEditMode ? 'Quản lý cuộc họp' : 'Khởi tạo cuộc họp' }}
                </VChip>
              </div>
              <h2
                class="text-h4 font-weight-black mb-0 text-uppercase"
                style="color: #334155; line-height: 1.2;"
              >
                {{ isEditMode ? 'CHỈNH SỬA CUỘC HỌP' : 'THÊM MỚI CUỘC HỌP' }}
              </h2>
              <div
                class="text-body-1 mt-1"
                style="color: #475569; font-weight: 500;"
              >
                {{ isEditMode ? 'Cập nhật nội dung, lịch trình, tài liệu và danh sách đại biểu.' : 'Thiết lập thông tin chung, lịch trình ban đầu và thành phần tham dự.' }}
              </div>
            </div>

            <!-- Right side Actions -->
            <div class="d-flex gap-3 align-end flex-wrap">
              <VBtn
                v-if="canSaveAndAdd"
                variant="outlined"
                color="primary"
                prepend-icon="tabler-plus"
                style="background-color: white; border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;"
                :disabled="!!submittingAction && submittingAction !== 'save-add'"
                :loading="submittingAction === 'save-add'"
                @click="submitForm('save-add')"
              >
                Lưu & Thêm
              </VBtn>
              <VBtn
                v-if="canSaveCurrentMeeting"
                variant="outlined"
                color="warning"
                prepend-icon="tabler-edit"
                style="background-color: white; border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;"
                :disabled="!!submittingAction && submittingAction !== 'save-edit'"
                :loading="submittingAction === 'save-edit'"
                @click="submitForm('save-edit')"
              >
                Lưu & Sửa
              </VBtn>
              <VBtn
                v-if="canSaveCurrentMeeting"
                color="success"
                variant="flat"
                prepend-icon="tabler-check"
                style="border-radius: 20px; font-weight: 600; padding: 0 20px; text-transform: none; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;"
                :disabled="!!submittingAction && submittingAction !== 'save-exit'"
                :loading="submittingAction === 'save-exit'"
                @click="submitForm('save-exit')"
              >
                Lưu & Thoát
              </VBtn>
            </div>
          </div>
        </VCard>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- Tab Bar -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <VContainer
        fluid
        class="flex-grow-1 px-4 py-0"
        style="min-height: calc(100vh - 230px);"
      >
        <VCard
          class="mb-4"
          elevation="0"
          style="border-radius: 12px; border: 1px solid #f1f1f4; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
        >
          <VTabs
            v-model="activeTab"
            color="primary"
            bg-color="white"
            height="56"
            show-arrows
          >
            <VTab
              v-for="tab in visibleTabs"
              :key="tab.value"
              :value="tab.value"
              :disabled="isTabDisabled(tab.value)"
              class="text-subtitle-2 font-weight-bold text-none px-6"
              style="letter-spacing: normal;"
            >
              <VIcon
                start
                size="20"
              >
                {{ tab.icon }}
              </VIcon>
              {{ tab.label }}
              <VChip
                v-if="tab.editOnly && !isEditMode"
                size="x-small"
                variant="flat"
                style="background-color: #fef3c7; color: #d97706; font-weight: 600; margin-left: 6px;"
              >
                <VIcon
                  start
                  size="12"
                >
                  tabler-lock
                </VIcon>
                Lưu trước
              </VChip>
            </VTab>
          </VTabs>
        </VCard>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- Tab Content -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <VWindow
          v-model="activeTab"
          class="pb-10"
          style="overflow: visible;"
          transition="none"
          reverse-transition="none"
        >
          <!-- ────────────────────────────────────────────────── -->
          <!-- TAB 1: Thông tin & Lịch trình -->
          <!-- ────────────────────────────────────────────────── -->
          <VWindowItem
            v-if="isTabVisible('general')"
            value="general"
            transition="none"
            reverse-transition="none"
          >
            <VForm @submit.prevent="submitForm('save-edit')">
              <VRow>
                <!-- Left Column: Thông tin chung + Chương trình cuộc họp -->
                <VCol
                  cols="12"
                  lg="8"
                >
                  <!-- Card: Thông tin chung -->
                  <VCard
                    elevation="0"
                    class="mb-6"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-info-circle"
                          size="20"
                          color="#6366f1"
                          class="rounded"
                          style="background-color: #e0e7ff; padding: 4px; box-sizing: content-box;"
                        />
                        Thông tin chung
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <VRow>
                        <VCol cols="12">
                          <div
                            class="text-body-2 font-weight-medium mb-1"
                            style="color: #334155;"
                          >
                            Tên cuộc họp <span class="text-error">*</span>
                          </div>
                          <AppTextField
                            v-model="formData.title"
                            placeholder="Nhập tên cuộc họp"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="12"
                        >
                          <div
                            class="text-body-2 font-weight-medium mb-1"
                            style="color: #334155;"
                          >
                            Loại cuộc họp
                          </div>
                          <AppSelect
                            v-model="formData.meeting_type_id"
                            :items="meetingTypeList"
                            placeholder="Chọn loại cuộc họp"
                            clearable
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div
                            class="text-body-2 font-weight-medium mb-1"
                            style="color: #334155;"
                          >
                            Thời gian bắt đầu <span class="text-error">*</span>
                          </div>
                          <AppDateTimePicker
                            v-model="formData.start_at"
                            placeholder="Chọn ngày giờ"
                            :config="dateTimeConfig"
                          />
                        </VCol>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <div
                            class="text-body-2 font-weight-medium mb-1"
                            style="color: #334155;"
                          >
                            Thời gian kết thúc <span class="text-error">*</span>
                          </div>
                          <AppDateTimePicker
                            v-model="formData.end_at"
                            placeholder="Chọn ngày giờ"
                            :config="dateTimeConfig"
                          />
                        </VCol>
                        <VCol cols="12">
                          <div
                            class="text-body-2 font-weight-medium mb-1"
                            style="color: #334155;"
                          >
                            Nội dung tóm tắt
                          </div>
                          <AppTextarea
                            v-model="formData.description"
                            rows="3"
                            placeholder="Nội dung, mục đích chính của cuộc họp..."
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>

                  <!-- Card: Chương trình cuộc họp -->
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
                        <div
                          class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                          style="color: #475569; font-size: 0.95rem;"
                        >
                          <VIcon
                            icon="tabler-clipboard-list"
                            size="20"
                            color="#3b82f6"
                            class="rounded"
                            style="background-color: #dbeafe; padding: 4px; box-sizing: content-box;"
                          />
                          Chương trình cuộc họp
                          <VChip
                            v-if="formData.agendas.length > 0"
                            size="small"
                            variant="flat"
                            style="margin-left: 8px; background-color: #dbeafe; color: #3b82f6; font-weight: 600;"
                          >
                            {{ formData.agendas.length }} nội dung
                          </VChip>
                        </div>
                        <VBtn
                          v-if="canEditMeeting"
                          variant="flat"
                          size="small"
                          prepend-icon="tabler-plus"
                          style="background-color: #e0e7ff; color: #6366f1; border-radius: 20px; font-weight: 600; text-transform: none;"
                          @click="addAgendaItem"
                        >
                          Thêm Nội Dung
                        </VBtn>
                      </div>
                    </VCardItem>

                    <VCardText class="pa-5">
                      <template v-if="formData.agendas.length > 0">
                        <div
                          v-for="(agenda, index) in formData.agendas"
                          :key="index"
                          class="agenda-edit-row"
                        >
                          <div class="agenda-edit-number">
                            {{ index + 1 }}
                          </div>
                          <VRow
                            class="flex-grow-1 mx-0"
                            style="background: #f8fafc; border-radius: 8px; padding: 12px;"
                          >
                            <VCol
                              cols="12"
                              md="3"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Bắt đầu
                              </div>
                              <AppDateTimePicker
                                v-model="agenda.start_time"
                                density="compact"
                                placeholder="Giờ"
                                :config="timeConfig"
                              />
                            </VCol>
                            <VCol
                              cols="12"
                              md="3"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Kết thúc
                              </div>
                              <AppDateTimePicker
                                v-model="agenda.end_time"
                                density="compact"
                                placeholder="Giờ"
                                :config="timeConfig"
                              />
                            </VCol>
                            <VCol
                              cols="12"
                              md="3"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Nội dung, bài trình bày
                              </div>
                              <AppTextField
                                v-model="agenda.title"
                                density="compact"
                                placeholder="Nội dung..."
                              />
                            </VCol>
                            <VCol
                              cols="12"
                              md="3"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Người phụ trách
                              </div>
                              <AppAutocomplete
                                v-model="agenda.presenter_id"
                                :items="userList"
                                density="compact"
                                placeholder="Chọn người phụ trách"
                                clearable
                              />
                            </VCol>
                          </VRow>
                          <IconBtn
                            v-if="canEditMeeting"
                            color="error"
                            class="mt-4"
                            variant="tonal"
                            @click="removeAgendaItem(index)"
                          >
                            <VIcon
                              icon="tabler-trash"
                              size="20"
                            />
                          </IconBtn>
                        </div>
                      </template>

                      <div
                        v-else
                        class="empty-state-card d-flex flex-column align-center justify-center pa-8 rounded-lg"
                        style="background-color: #f8fafc; border: 2px dashed #e2e8f0;"
                      >
                        <VAvatar
                          color="#e0e7ff"
                          size="56"
                          variant="flat"
                          class="mb-4"
                        >
                          <VIcon
                            icon="tabler-clipboard-list"
                            size="28"
                            color="#6366f1"
                          />
                        </VAvatar>
                        <div
                          class="text-body-1 font-weight-bold mb-1"
                          style="color: #475569;"
                        >
                          Chưa có nội dung lịch trình
                        </div>
                        <div
                          class="text-body-2 mb-4"
                          style="color: #94a3b8;"
                        >
                          Bấm nút bên dưới để bắt đầu xếp lịch cuộc họp
                        </div>
                        <VBtn
                          v-if="canEditMeeting"
                          variant="flat"
                          size="small"
                          prepend-icon="tabler-plus"
                          style="background-color: #6366f1; color: white; border-radius: 20px; font-weight: 600; text-transform: none;"
                          @click="addAgendaItem"
                        >
                          Thêm Nội Dung Đầu Tiên
                        </VBtn>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Right Column: Địa điểm & Trạng thái + Tóm tắt -->
                <VCol
                  cols="12"
                  lg="4"
                >
                  <!-- Địa điểm & Trạng thái -->
                  <VCard
                    elevation="0"
                    class="mb-6"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-map-pin"
                          size="20"
                          color="#f97316"
                          class="rounded"
                          style="background-color: #ffedd5; padding: 4px; box-sizing: content-box;"
                        />
                        Địa điểm & Trạng thái
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <div
                        class="text-body-2 font-weight-medium mb-1"
                        style="color: #334155;"
                      >
                        Địa điểm họp <span class="text-error">*</span>
                      </div>
                      <AppTextField
                        v-model="formData.location"
                        placeholder="Ví dụ: Phòng họp 1"
                        class="mb-6"
                      />

                      <div
                        class="text-body-2 font-weight-medium mb-1"
                        style="color: #334155;"
                      >
                        Trạng thái
                      </div>
                      <AppSelect
                        v-model="formData.status"
                        :items="[
                          { title: 'Nháp (Draft)', value: 'draft' },
                          { title: 'Kích hoạt (Active)', value: 'active' },
                          { title: 'Đang họp (In Progress)', value: 'in_progress' },
                          { title: 'Kết thúc (Completed)', value: 'completed' },
                        ]"
                        placeholder="Chọn trạng thái"
                      />
                    </VCardText>
                  </VCard>

                  <MeetingQrPanel
                    v-if="isEditMode"
                    :meeting-id="route.params.id"
                  />

                  <!-- Hướng dẫn nhanh -->
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-info-square-rounded"
                          size="20"
                          color="#0ea5e9"
                          class="rounded"
                          style="background-color: #e0f2fe; padding: 4px; box-sizing: content-box;"
                        />
                        Hướng dẫn nhanh
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5 d-flex flex-column gap-4">
                      <div class="d-flex align-start gap-3">
                        <VAvatar
                          color="#dcfce7"
                          size="32"
                          variant="flat"
                          class="flex-shrink-0 mt-1"
                        >
                          <span
                            class="font-weight-bold text-caption"
                            style="color: #16a34a;"
                          >1</span>
                        </VAvatar>
                        <div>
                          <div
                            class="text-body-2 font-weight-bold"
                            style="color: #334155;"
                          >
                            Điền thông tin cơ bản
                          </div>
                          <div
                            class="text-caption"
                            style="color: #64748b;"
                          >
                            Nhập tên, thời gian, địa điểm cuộc họp
                          </div>
                        </div>
                      </div>
                      <div class="d-flex align-start gap-3">
                        <VAvatar
                          color="#dbeafe"
                          size="32"
                          variant="flat"
                          class="flex-shrink-0 mt-1"
                        >
                          <span
                            class="font-weight-bold text-caption"
                            style="color: #3b82f6;"
                          >2</span>
                        </VAvatar>
                        <div>
                          <div
                            class="text-body-2 font-weight-bold"
                            style="color: #334155;"
                          >
                            Xếp lịch trình
                          </div>
                          <div
                            class="text-caption"
                            style="color: #64748b;"
                          >
                            Thêm các nội dung trình bày và thời lượng
                          </div>
                        </div>
                      </div>
                      <div class="d-flex align-start gap-3">
                        <VAvatar
                          color="#ede9fe"
                          size="32"
                          variant="flat"
                          class="flex-shrink-0 mt-1"
                        >
                          <span
                            class="font-weight-bold text-caption"
                            style="color: #8b5cf6;"
                          >3</span>
                        </VAvatar>
                        <div>
                          <div
                            class="text-body-2 font-weight-bold"
                            style="color: #334155;"
                          >
                            Lưu & Bổ sung
                          </div>
                          <div
                            class="text-caption"
                            style="color: #64748b;"
                          >
                            Sau khi lưu, bạn có thể thêm tài liệu, đại biểu, biểu quyết
                          </div>
                        </div>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>

          <!-- ────────────────────────────────────────────────── -->
          <!-- TAB 2: Tài liệu đính kèm -->
          <!-- ────────────────────────────────────────────────── -->
          <VWindowItem
            v-if="isTabVisible('documents')"
            value="documents"
            transition="none"
            reverse-transition="none"
          >
            <template v-if="isEditMode">
              <VRow>
                <VCol cols="12">
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-paperclip"
                          size="20"
                          color="#10b981"
                          class="rounded"
                          style="background-color: #d1fae5; padding: 4px; box-sizing: content-box;"
                        />
                        Quản lý Tài liệu cuộc họp
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <MeetingDocumentsTab
                        :meeting-id="route.params.id"
                        :meeting-type-id="formData.meeting_type_id"
                      />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </template>
            <template v-else>
              <MeetingEditModeRequiredCard
                icon="tabler-file-text"
                title="Tài liệu đính kèm"
                description="Vui lòng lưu cuộc họp trước để có thể đính kèm tài liệu. Bấm nút 'Lưu & Sửa' ở phía trên để tiếp tục."
              />
            </template>
          </VWindowItem>

          <!-- ────────────────────────────────────────────────── -->
          <!-- TAB 3: Thành phần tham dự -->
          <!-- ────────────────────────────────────────────────── -->
          <VWindowItem
            v-if="isTabVisible('attendees')"
            value="attendees"
            transition="none"
            reverse-transition="none"
          >
            <VRow>
              <VCol cols="12">
                <VCard
                  elevation="0"
                  style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                >
                  <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                    <div class="d-flex align-center justify-space-between flex-wrap gap-4">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-users-group"
                          size="20"
                          color="#8b5cf6"
                          class="rounded"
                          style="background-color: #ede9fe; padding: 4px; box-sizing: content-box;"
                        />
                        Thành phần tham dự
                      </div>
                      <VBtn
                        v-if="canEditMeeting && !isEditMode"
                        variant="flat"
                        size="small"
                        prepend-icon="tabler-plus"
                        style="background-color: #ede9fe; color: #8b5cf6; border-radius: 20px; font-weight: 600; text-transform: none;"
                        @click="addAttendeeItem"
                      >
                        Thêm Người Dự
                      </VBtn>
                    </div>
                  </VCardItem>

                  <VCardText class="pa-5">
                    <!-- Thêm nhanh từ nhóm (khi có meeting_type_id) -->
                    <template v-if="!isEditMode && attendeeGroupsForType.length > 0">
                      <VCard
                        variant="outlined"
                        class="mb-5"
                        style="border-color: #c7d2fe; border-radius: 10px; overflow: hidden;"
                      >
                        <div
                          class="d-flex align-center gap-2 px-4 py-3"
                          style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);"
                        >
                          <VIcon
                            icon="tabler-bolt"
                            size="20"
                            color="#6366f1"
                          />
                          <span
                            class="font-weight-bold text-body-2"
                            style="color: #4338ca;"
                          >
                            Thêm nhanh từ nhóm người dự họp
                          </span>
                          <VSpacer />
                          <VChip
                            size="x-small"
                            variant="flat"
                            style="background: #6366f1; color: white;"
                          >
                            {{ attendeeGroupsForType.length }} nhóm
                          </VChip>
                        </div>
                        <div class="pa-4">
                          <div class="d-flex flex-wrap gap-3 mb-4">
                            <VCheckbox
                              v-for="group in attendeeGroupsForType"
                              :key="group.id"
                              v-model="selectedGroupIds"
                              :value="group.id"
                              density="compact"
                              hide-details
                            >
                              <template #label>
                                <div class="d-flex align-center gap-2">
                                  <span class="text-body-2 font-weight-medium">{{ group.name }}</span>
                                  <VChip
                                    size="x-small"
                                    color="info"
                                    variant="tonal"
                                  >
                                    {{ group.members?.length || 0 }} người
                                  </VChip>
                                </div>
                              </template>
                            </VCheckbox>
                          </div>
                          <VBtn
                            v-if="canEditMeeting"
                            variant="flat"
                            size="small"
                            color="primary"
                            prepend-icon="tabler-users-plus"
                            :disabled="selectedGroupIds.length === 0"
                            style="border-radius: 20px; text-transform: none; font-weight: 600;"
                            @click="autoFillFromGroups"
                          >
                            Thêm {{ selectedGroupIds.length }} nhóm vào danh sách
                          </VBtn>
                        </div>
                      </VCard>
                    </template>

                    <template v-if="!isEditMode && loadingGroups">
                      <div class="d-flex align-center justify-center pa-4 mb-4">
                        <VProgressCircular
                          indeterminate
                          size="24"
                          color="primary"
                          class="me-3"
                        />
                        <span class="text-body-2 text-disabled">Đang tải nhóm...</span>
                      </div>
                    </template>

                    <!-- Edit mode: Sử dụng MeetingAttendeesTab -->
                    <template v-if="isEditMode">
                      <MeetingAttendeesTab :meeting-id="route.params.id" />
                    </template>

                    <!-- Create mode: Form inline -->
                    <template v-else>
                      <template v-if="formData.attendees.length > 0">
                        <div
                          v-for="(attendee, index) in formData.attendees"
                          :key="index"
                          class="agenda-edit-row"
                        >
                          <div
                            class="agenda-edit-number"
                            style="color: #8b5cf6; background: #ede9fe;"
                          >
                            {{ index + 1 }}
                          </div>
                          <VRow
                            class="flex-grow-1 mx-0"
                            style="background: #f8fafc; border-radius: 8px; padding: 12px;"
                          >
                            <VCol
                              cols="12"
                              md="4"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Cán bộ
                              </div>
                              <AppSelect
                                v-model="attendee.user_id"
                                :items="userList"
                                density="compact"
                                placeholder="Chọn cán bộ"
                              />
                            </VCol>
                            <VCol
                              cols="12"
                              md="4"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Chức vụ / Vị trí họp
                              </div>
                              <AppSelect
                                v-model="attendee.position"
                                :items="[
                                  { title: 'Chủ tọa (Chairperson)', value: 'chairperson' },
                                  { title: 'Thư ký (Secretary)', value: 'secretary' },
                                  { title: 'Đại biểu (Member)', value: 'member' },
                                  { title: 'Khách mời (Guest)', value: 'guest' },
                                ]"
                                density="compact"
                              />
                            </VCol>
                            <VCol
                              cols="12"
                              md="4"
                              class="py-1"
                            >
                              <div class="text-caption text-disabled mb-1 font-weight-medium">
                                Vai trò cuộc họp
                              </div>
                              <AppSelect
                                v-model="attendee.meeting_role"
                                :items="[
                                  { title: 'Chủ tọa', value: 'chair' },
                                  { title: 'Thư ký', value: 'secretary' },
                                  { title: 'Đại biểu', value: 'delegate' },
                                ]"
                                density="compact"
                              />
                            </VCol>
                          </VRow>
                          <IconBtn
                            color="error"
                            class="mt-4"
                            variant="tonal"
                            @click="removeAttendeeItem(index)"
                          >
                            <VIcon
                              icon="tabler-trash"
                              size="20"
                            />
                          </IconBtn>
                        </div>
                      </template>
                      <div
                        v-else
                        class="empty-state-card d-flex flex-column align-center justify-center pa-8 rounded-lg"
                        style="background-color: #f8fafc; border: 2px dashed #e2e8f0;"
                      >
                        <VAvatar
                          color="#ede9fe"
                          size="56"
                          variant="flat"
                          class="mb-4"
                        >
                          <VIcon
                            icon="tabler-users-group"
                            size="28"
                            color="#8b5cf6"
                          />
                        </VAvatar>
                        <div
                          class="text-body-1 font-weight-bold mb-1"
                          style="color: #475569;"
                        >
                          Chưa có thành phần tham dự
                        </div>
                        <div
                          class="text-body-2 mb-4"
                          style="color: #94a3b8;"
                        >
                          Bấm nút bên dưới để bổ sung đại biểu
                        </div>
                        <VBtn
                          v-if="canEditMeeting"
                          variant="flat"
                          size="small"
                          prepend-icon="tabler-plus"
                          style="background-color: #8b5cf6; color: white; border-radius: 20px; font-weight: 600; text-transform: none;"
                          @click="addAttendeeItem"
                        >
                          Thêm Đại Biểu Đầu Tiên
                        </VBtn>
                      </div>
                    </template>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- ────────────────────────────────────────────────── -->
          <!-- TAB 4: Biểu quyết -->
          <!-- ────────────────────────────────────────────────── -->
          <VWindowItem
            v-if="isTabVisible('speechRequests')"
            value="speechRequests"
            transition="none"
            reverse-transition="none"
          >
            <template v-if="isEditMode">
              <VRow>
                <VCol cols="12">
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
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
                        Quan ly Dang ky Phat bieu
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <MeetingSpeechRequestsTab :meeting-id="route.params.id" />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </template>
            <template v-else>
              <MeetingEditModeRequiredCard
                icon="tabler-microphone"
                title="Dang ky phat bieu"
                description="Vui long luu cuoc hop truoc de co the quan ly dang ky phat bieu cua dai bieu."
              />
            </template>
          </VWindowItem>

          <VWindowItem
            v-if="isTabVisible('voting')"
            value="voting"
            transition="none"
            reverse-transition="none"
          >
            <template v-if="isEditMode">
              <VRow>
                <VCol cols="12">
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-checkbox"
                          size="20"
                          color="#f59e0b"
                          class="rounded"
                          style="background-color: #fef3c7; padding: 4px; box-sizing: content-box;"
                        />
                        Quản lý Biểu Quyết
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <MeetingVotesTab :meeting-id="route.params.id" />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </template>
            <template v-else>
              <MeetingEditModeRequiredCard
                icon="tabler-checkbox"
                title="Biểu quyết"
                description="Vui lòng lưu cuộc họp trước để có thể tạo biểu quyết. Bấm nút 'Lưu & Sửa' ở phía trên để tiếp tục."
              />
            </template>
          </VWindowItem>

          <!-- ────────────────────────────────────────────────── -->
          <!-- TAB 5: Kết luận cuộc họp -->
          <!-- ────────────────────────────────────────────────── -->
          <VWindowItem
            v-if="isTabVisible('conclusions')"
            value="conclusions"
            transition="none"
            reverse-transition="none"
          >
            <template v-if="isEditMode">
              <VRow>
                <VCol cols="12">
                  <VCard
                    elevation="0"
                    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
                  >
                    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
                      <div
                        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
                        style="color: #475569; font-size: 0.95rem;"
                      >
                        <VIcon
                          icon="tabler-file-check"
                          size="20"
                          color="#14b8a6"
                          class="rounded"
                          style="background-color: #ccfbf1; padding: 4px; box-sizing: content-box;"
                        />
                        Quản lý Kết Luận
                      </div>
                    </VCardItem>
                    <VCardText class="pa-5">
                      <MeetingConclusionsTab :meeting-id="route.params.id" />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </template>
            <template v-else>
              <MeetingEditModeRequiredCard
                icon="tabler-file-check"
                title="Kết luận cuộc họp"
                description="Vui lòng lưu cuộc họp trước để có thể ghi nhận kết luận. Bấm nút 'Lưu & Sửa' ở phía trên để tiếp tục."
              />
            </template>
          </VWindowItem>
        </VWindow>
      </VContainer>
    </template>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <VBtn
          variant="text"
          icon="tabler-x"
          @click="snackbar.show = false"
        />
      </template>
    </VSnackbar>
  </div>
</template>

<!-- Inline functional component: Edit-only state -->
<script>
const EditModeRequired = {
  props: {
    icon: { type: String, default: 'tabler-lock' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  template: `
    <VCard
      elevation="0"
      style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
    >
      <VCardText class="pa-10">
        <div class="d-flex flex-column align-center justify-center text-center" style="min-height: 280px;">
          <VAvatar color="#fef3c7" size="72" variant="flat" class="mb-5">
            <VIcon :icon="icon" size="36" color="#d97706" />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-2" style="color: #334155;">
            {{ title }}
          </div>
          <div class="text-body-1 mb-6" style="color: #64748b; max-width: 420px;">
            {{ description }}
          </div>
          <VChip variant="flat" style="background-color: #fef3c7; color: #92400e; font-weight: 600;">
            <VIcon start size="16">tabler-info-circle</VIcon>
            Tính năng này cần cuộc họp đã được lưu
          </VChip>
        </div>
      </VCardText>
    </VCard>
  `,
}
</script>

<style scoped>
.surface-ground {
  background-color: rgb(var(--v-theme-background));
}

.agenda-edit-row {
  display: flex;
  align-items: flex-start;
  border-block-end: 1px dashed #e2e8f0;
  gap: 16px;
  padding-block: 12px;
  padding-inline: 0;
}

.agenda-edit-row:last-child {
  border-block-end: none;
}

.agenda-edit-number {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e0e7ff;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 5%);
  color: #6366f1;
  font-size: 0.9rem;
  font-weight: 700;
  block-size: 32px;
  inline-size: 32px;
  margin-block-start: 18px;
}
</style>
