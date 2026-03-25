<script setup>
import { deleteMeetingParticipant, fetchMeetingParticipants, fetchMeetings } from '@/modules/meetings/services/meetingService'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const items = ref([])
const isLoading = ref(false)

// Dialog Add
const isAddDialogVisible = ref(false)
const isSubmitting = ref(false)
const usersList = ref([])

const formData = ref({
  user_id: null,
  position: '',
  meeting_role: 'delegate',
})

// Dialog Edit
const isEditDialogVisible = ref(false)
const isSubmittingEdit = ref(false)
const selectedParticipantId = ref(null)
const editFormData = ref({
  user_name: '',
  position: '',
  meeting_role: 'delegate',
})

const headers = [
  { title: 'Thành viên', key: 'user_name' },
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
  } finally {
    isLoading.value = false
  }
}

watch(() => props.meetingId, () => {
  loadData()
}, { immediate: true })

const deleteItem = async id => {
  if (confirm('Xóa thành viên này khỏi cuộc họp?')) {
    await deleteMeetingParticipant(props.meetingId, id)
    loadData()
  }
}

const loadUsers = async () => {
  try {
    const { fetchUsers } = await import('@/modules/user/services/userService')
    const res = await fetchUsers({ limit: 100 })
    usersList.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Failed to load users for dropdown', error)
  }
}

const submitAdd = async () => {
  if (!formData.value.user_id) return alert('Vui lòng chọn một cán bộ')
  
  isSubmitting.value = true
  try {
    const { createMeetingParticipant } = await import('@/modules/meetings/services/meetingService')
    await createMeetingParticipant(props.meetingId, formData.value)
    
    isAddDialogVisible.value = false
    formData.value = { user_id: null, position: '', meeting_role: 'delegate' }
    loadData()
  } catch (err) {
    console.error('Lỗi khi thêm đại biểu', err)
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
    })
    isEditDialogVisible.value = false
    loadData()
  } catch (err) {
    console.error('Lỗi khi cập nhật đại biểu', err)
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
          <VChip size="small" :color="['chairperson', 'chair'].includes(item.meeting_role) ? 'primary' : 'secondary'">
            {{ ['chairperson', 'chair'].includes(item.meeting_role) ? 'Chủ tọa' : (item.meeting_role === 'secretary' ? 'Thư ký' : 'Đại biểu') }}
          </VChip>
        </template>
        <template #item.attendance_status="{ item }">
          <VChip size="small" :color="item.attendance_status === 'present' ? 'success' : 'error'">
            {{ item.attendance_status === 'present' ? 'Có mặt' : 'Vắng mặt' }}
          </VChip>
        </template>
        <template #item.actions="{ item }">
          <IconBtn @click="openEditDialog(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="deleteItem(item.id)">
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
            
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.position"
                label="Chức vụ"
                placeholder="Nhập chức vụ trong cuộc họp"
              />
            </VCol>

            <VCol cols="12" md="6">
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
            
            <VCol cols="12" md="6">
              <AppTextField
                v-model="editFormData.position"
                label="Chức vụ"
                placeholder="Nhập chức vụ trong cuộc họp"
              />
            </VCol>

            <VCol cols="12" md="6">
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
  </div>
</template>
