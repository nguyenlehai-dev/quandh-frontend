<script setup>
/* eslint-disable camelcase */

import { useActionFeedback } from '@/composables/useActionFeedback'
import { deleteMeetingParticipant, fetchMeetingParticipants } from '@/modules/meetings/services/meetingService'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isConfirming = ref(false)
const confirmDialog = ref({ title: '', message: '', confirmText: 'Xác nhận', confirmColor: 'primary', action: null })
const { snackbar, showSnackbar, showSuccess, showError } = useActionFeedback()

// Dialog Add
const isAddDialogVisible = ref(false)
const isSubmitting = ref(false)
const usersList = ref([])

const formData = ref({
  user_id: null,
  position: '',
  meeting_role: 'delegate',
  attendance_status: 'pending',
  absence_reason: '',
  delegated_to_id: null,
})

// Dialog Edit
const isEditDialogVisible = ref(false)
const isSubmittingEdit = ref(false)
const selectedParticipantId = ref(null)

const editFormData = ref({
  user_name: '',
  position: '',
  meeting_role: 'delegate',
  attendance_status: 'pending',
  absence_reason: '',
  delegated_to_id: null,
})

const headers = [
  { title: 'Thành viên', key: 'user_name' },
  { title: 'Chức vụ', key: 'position' },
  { title: 'Vai trò', key: 'meeting_role' },
  { title: 'Điểm danh', key: 'attendance_status' },
  { title: 'Hành động', key: 'actions', sortable: false },
]

// Removed loadMeetings

const loadData = async () => {
  if (!props.meetingId) {
    items.value = []
    
    return
  }
  isLoading.value = true
  try {
    const res = await fetchMeetingParticipants(props.meetingId)

    items.value = res.data || []
  } catch (error) {
    console.error(error)
    showError(error, 'Không thể tải danh sách thành viên.')
  } finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

const openConfirmDialog = options => {
  confirmDialog.value = { ...confirmDialog.value, ...options }
  isConfirmDialogVisible.value = true
}

const executeConfirmedAction = async () => {
  if (!confirmDialog.value.action) return
  isConfirming.value = true
  try {
    await confirmDialog.value.action()
    isConfirmDialogVisible.value = false
  } catch (err) {
    showError(err, 'Không thể thực hiện thao tác này.')
  } finally {
    isConfirming.value = false
  }
}

const deleteItem = item => {
  openConfirmDialog({
    title: 'Xóa thành viên tham dự',
    message: `Bạn có chắc chắn muốn xóa "${item.user_name}" khỏi cuộc họp không?`,
    confirmText: 'Xóa',
    confirmColor: 'error',
    action: async () => {
      await deleteMeetingParticipant(props.meetingId, item.id)
      showSuccess('Xóa thành viên thành công.')
      loadData()
    },
  })
}

const loadUsers = async () => {
  try {
    const { fetchUsers } = await import('@/modules/auth/user/services/userService')
    const res = await fetchUsers({ limit: 100 })

    usersList.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Failed to load users for dropdown', error)
    showError(error, 'Không thể tải danh sách cán bộ.')
  }
}

const submitAdd = async () => {
  if (!formData.value.user_id) {
    showSnackbar('Vui lòng chọn một cán bộ.', 'warning')

    return
  }
  
  isSubmitting.value = true
  try {
    const { createMeetingParticipant } = await import('@/modules/meetings/services/meetingService')

    await createMeetingParticipant(props.meetingId, formData.value)

    isAddDialogVisible.value = false
    formData.value = { user_id: null, position: '', meeting_role: 'delegate', attendance_status: 'pending', absence_reason: '', delegated_to_id: null }
    showSuccess('Thêm cán bộ tham dự thành công.')
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm đại biểu', err)
    showError(err, 'Không thể thêm cán bộ tham dự.')
  } finally {
    isSubmitting.value = false
  }
}

const openEditDialog = item => {
  selectedParticipantId.value = item.id
  editFormData.value = {
    user_name: item.user_name || '',
    position: item.position || '',
    meeting_role: item.meeting_role || 'delegate',
    attendance_status: item.attendance_status || 'pending',
    absence_reason: item.absence_reason || '',
    delegated_to_id: item.delegated_to_id || null,
  }
  isEditDialogVisible.value = true
}

const submitEdit = async () => {
  isSubmittingEdit.value = true
  try {
    const { updateMeetingParticipant } = await import('@/modules/meetings/services/meetingService')

    await updateMeetingParticipant(props.meetingId, selectedParticipantId.value, {
      position: editFormData.value.position,
      meeting_role: editFormData.value.meeting_role,
      attendance_status: editFormData.value.attendance_status,
      absence_reason: editFormData.value.attendance_status === 'absent' ? editFormData.value.absence_reason : null,
      delegated_to_id: editFormData.value.attendance_status === 'delegated' ? editFormData.value.delegated_to_id : null,
    })
    isEditDialogVisible.value = false
    showSuccess('Cập nhật thành viên thành công.')
    loadData()
  } catch (err) {
    console.error('Lỗi khi cập nhật đại biểu', err)
    showError(err, 'Không thể cập nhật thành viên.')
  } finally {
    isSubmittingEdit.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          Người dự họp
        </h5>
        <VBtn
          v-if="$can('store', 'MeetingParticipant')"
          prepend-icon="tabler-plus"
          @click="isAddDialogVisible = true"
        >
          Thêm Cán bộ
        </VBtn>
      </VCardText>
      <VDivider />
      
      <VDataTable
        :items="items"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.meeting_role="{ item }">
          <VChip
            size="small"
            :color="['chairperson', 'chair'].includes(item.meeting_role) ? 'primary' : 'secondary'"
          >
            {{ ['chairperson', 'chair'].includes(item.meeting_role) ? 'Chủ tọa' : (item.meeting_role === 'secretary' ? 'Thư ký' : 'Đại biểu') }}
          </VChip>
        </template>
        <template #item.attendance_status="{ item }">
          <VChip
            size="small"
            :color="item.attendance_status === 'present' ? 'success' : item.attendance_status === 'absent' ? 'error' : item.attendance_status === 'delegated' ? 'warning' : 'secondary'"
          >
            {{ item.attendance_status === 'present' ? 'Có mặt' : item.attendance_status === 'absent' ? 'Vắng mặt' : item.attendance_status === 'delegated' ? 'Ủy quyền' : 'Chờ điểm danh' }}
          </VChip>
        </template>
        <template #item.actions="{ item }">
          <IconBtn
            v-if="$can('update', 'MeetingParticipant')"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn
            v-if="$can('destroy', 'MeetingParticipant')"
            @click="deleteItem(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="pa-5 text-center">
            Cuộc họp này chưa có thành viên
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Thêm mới -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="Thêm Cán bộ tham dự">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                v-model="formData.user_id"
                :items="usersList"
                item-title="name"
                item-value="id"
                label="Chọn Cán bộ *"
                placeholder="Tìm kiếm cán bộ..."
              />
            </VCol>
            
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formData.position"
                label="Chức vụ"
                placeholder="Nhập chức vụ trong cuộc họp"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.meeting_role"
                :items="[
                  { title: 'Chủ tọa', value: 'chair' },
                  { title: 'Thư ký', value: 'secretary' },
                  { title: 'Đại biểu', value: 'delegate' }
                ]"
                label="Vai trò cuộc họp"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formData.attendance_status"
                :items="[
                  { title: 'Chờ điểm danh', value: 'pending' },
                  { title: 'Có mặt', value: 'present' },
                  { title: 'Vắng mặt', value: 'absent' },
                  { title: 'Ủy quyền', value: 'delegated' }
                ]"
                label="Trạng thái"
              />
            </VCol>

            <VCol
              v-if="formData.attendance_status === 'absent'"
              cols="12"
            >
              <AppTextarea
                v-model="formData.absence_reason"
                label="Lý do vắng mặt"
                rows="2"
                placeholder="Nhập lý do vắng mặt"
              />
            </VCol>

            <VCol
              v-if="formData.attendance_status === 'delegated'"
              cols="12"
            >
              <AppAutocomplete
                v-model="formData.delegated_to_id"
                :items="usersList"
                item-title="name"
                item-value="id"
                label="Người được ủy quyền"
                placeholder="Chọn người được ủy quyền"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isAddDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmitting"
            @click="submitAdd"
          >
            Lưu
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Dialog Sửa -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="600"
    >
      <VCard title="Chỉnh sửa Cán bộ tham dự">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="editFormData.user_name"
                label="Thành viên"
                disabled
              />
            </VCol>
            
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="editFormData.position"
                label="Chức vụ"
                placeholder="Nhập chức vụ trong cuộc họp"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="editFormData.meeting_role"
                :items="[
                  { title: 'Chủ tọa', value: 'chair' },
                  { title: 'Thư ký', value: 'secretary' },
                  { title: 'Đại biểu', value: 'delegate' }
                ]"
                label="Vai trò cuộc họp"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="editFormData.attendance_status"
                :items="[
                  { title: 'Chờ điểm danh', value: 'pending' },
                  { title: 'Có mặt', value: 'present' },
                  { title: 'Vắng mặt', value: 'absent' },
                  { title: 'Ủy quyền', value: 'delegated' }
                ]"
                label="Trạng thái"
              />
            </VCol>

            <VCol
              v-if="editFormData.attendance_status === 'absent'"
              cols="12"
            >
              <AppTextarea
                v-model="editFormData.absence_reason"
                label="Lý do vắng mặt"
                rows="2"
                placeholder="Nhập lý do vắng mặt"
              />
            </VCol>

            <VCol
              v-if="editFormData.attendance_status === 'delegated'"
              cols="12"
            >
              <AppAutocomplete
                v-model="editFormData.delegated_to_id"
                :items="usersList"
                item-title="name"
                item-value="id"
                label="Người được ủy quyền"
                placeholder="Chọn người được ủy quyền"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isEditDialogVisible = false"
          >
            Hủy
          </VBtn>
          <VBtn
            :loading="isSubmittingEdit"
            @click="submitEdit"
          >
            Cập nhật
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <ActionConfirmDialog
      v-model="isConfirmDialogVisible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :confirm-color="confirmDialog.confirmColor"
      :loading="isConfirming"
      @confirm="executeConfirmedAction"
    />

    <ActionSnackbar
      v-model="snackbar.show"
      :message="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>
