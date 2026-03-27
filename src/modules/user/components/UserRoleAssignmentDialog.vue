<script setup>
import { ref, watch } from 'vue'

/* eslint-disable camelcase */

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: [Number, String],
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'saved'])

const isLoading = ref(false)
const isSaving = ref(false)
const userDetail = ref(null)

const roles = ref([])
const organizations = ref([])

const formAssignments = ref([])

// Fetch roles and organizations
const fetchReferences = async () => {
  try {
    const [rolesRes, orgsRes] = await Promise.all([
      $api('/roles?limit=100'),
      $api('/organizations?limit=100'),
    ])

    // Support potential variations in pagination responses
    const orgs = orgsRes.data?.data || orgsRes.data || []
    organizations.value = orgs

    roles.value = (rolesRes.data?.data || rolesRes.data || []).map(r => {
      let suffix = '(Hệ thống)'
      if (r.organization_id) {
        const org = orgs.find(o => o.id === r.organization_id)
        
        suffix = org ? `(${org.name})` : `(Tổ chức #${r.organization_id})`
      }

      return {
        ...r,
        displayName: `${r.name} ${suffix}`,
      }
    })
  } catch (err) {
    console.error('Failed to load references', err)
  }
}

// Fetch user detail
const fetchUserDetail = async () => {
  if (!props.userId) return
  isLoading.value = true

  try {
    const res = await $api(`/users/${props.userId}`)

    userDetail.value = res.data ?? res
    
    // Map existing assignments to form structure
    if (userDetail.value?.assignments && Array.isArray(userDetail.value.assignments)) {
      formAssignments.value = userDetail.value.assignments.map(a => ({
        role_id: a.role_id,
        organization_ids: a.organizations ? a.organizations.map(o => o.id) : [],
      }))
    } else {
      formAssignments.value = []
    }
  } catch (err) {
    console.error('Fetch user detail error:', err)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isDialogVisible,
  async isVisible => {
    if (isVisible && props.userId) {
      formAssignments.value = []
      await fetchReferences()
      await fetchUserDetail()
    } else {
      userDetail.value = null
      formAssignments.value = []
    }
  },
)

const addAssignment = () => {
  formAssignments.value.push({
    role_id: null,
    organization_ids: [],
  })
}

const removeAssignment = index => {
  formAssignments.value.splice(index, 1)
}

const isRoleOrganizationSpecific = roleId => {
  if (!roleId) return false
  const role = roles.value.find(r => r.id === roleId)

  return role && role.organization_id !== null
}

const onRoleChange = assignment => {
  if (!assignment.role_id) return
  const role = roles.value.find(r => r.id === assignment.role_id)
  
  if (role && role.organization_id !== null) {
    // If the role is organization-specific, force the organization_ids to only that organization
    assignment.organization_ids = [role.organization_id]
  }
}

const saveAssignments = async () => {
  // Validate basic
  const isValid = formAssignments.value.every(a => a.role_id)
  if (!isValid) return
  
  isSaving.value = true

  try {
    const payload = {
      name: userDetail.value.name,
      email: userDetail.value.email,
      user_name: userDetail.value.user_name,
      status: userDetail.value.status,
      assignments: formAssignments.value,
    }
    
    await $api(`/users/${props.userId}`, {
      method: 'PUT',
      body: payload,
    })
    
    emit('saved')
    onDialogChange(false)
  } catch (err) {
    console.error('Failed to save assignments', err)
  } finally {
    isSaving.value = false
  }
}

const onDialogChange = val => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="800"
    persistent
    @update:model-value="onDialogChange"
  >
    <DialogCloseBtn @click="onDialogChange(false)" />

    <VCard title="Phân Quyền Cán Bộ">
      <VCardText v-if="isLoading">
        <div class="text-center py-6">
          <VProgressCircular
            indeterminate
            color="primary"
          />
          <p class="mt-4 text-body-1">
            Đang tải thông tin...
          </p>
        </div>
      </VCardText>

      <VCardText v-else-if="userDetail">
        <VAlert
          color="info"
          variant="tonal"
          class="mb-6"
        >
          <p class="mb-1">
            <strong>Cán bộ:</strong> {{ userDetail.name }} (@{{ userDetail.user_name }})
          </p>
          <p class="mb-0 text-sm">
            Gán Vai trò và các Tổ chức tương ứng mà cán bộ này có quyền thao tác.
          </p>
        </VAlert>

        <VForm @submit.prevent="saveAssignments">
          <div v-if="formAssignments.length > 0">
            <template
              v-for="(assignment, index) in formAssignments"
              :key="index"
            >
              <VRow class="mb-2 align-center">
                <VCol
                  cols="12"
                  md="4"
                >
                  <VSelect
                    v-model="assignment.role_id"
                    :items="roles"
                    item-title="displayName"
                    item-value="id"
                    label="Vai trò"
                    placeholder="Chọn Vai trò"
                    :rules="[v => !!v || 'Vui lòng chọn vai trò']"
                    variant="outlined"
                    @update:model-value="onRoleChange(assignment)"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="7"
                >
                  <VSelect
                    v-model="assignment.organization_ids"
                    :items="organizations"
                    item-title="name"
                    item-value="id"
                    label="Tổ chức áp dụng"
                    placeholder="Tất cả hoặc chọn Tổ chức"
                    multiple
                    chips
                    closable-chips
                    variant="outlined"
                    :disabled="isRoleOrganizationSpecific(assignment.role_id)"
                    :hint="isRoleOrganizationSpecific(assignment.role_id) ? 'Vai trò này bị giới hạn riêng cho tổ chức' : 'Để trống nếu quyền áp dụng toàn hệ thống (Super Admin)'"
                    persistent-hint
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="text-center"
                >
                  <IconBtn
                    color="error"
                    @click="removeAssignment(index)"
                  >
                    <VIcon icon="tabler-trash" />
                  </IconBtn>
                </VCol>
              </VRow>
              <VDivider
                v-if="index < formAssignments.length - 1"
                class="my-4 border-dashed"
              />
            </template>
          </div>
          
          <div
            v-else
            class="text-center py-8 px-4 text-medium-emphasis mb-4 border rounded"
          >
            <VIcon
              icon="tabler-shield-off"
              size="48"
              class="mb-3"
            />
            <p class="text-body-1">
              Cán bộ này hiện chưa được gán vai trò nào.
            </p>
          </div>

          <div class="mt-4 mb-8">
            <VBtn
              color="secondary"
              variant="tonal"
              size="small"
              @click="addAssignment"
            >
              <VIcon
                icon="tabler-plus"
                start
              />
              Thêm dòng phân quyền
            </VBtn>
          </div>

          <div class="d-flex justify-end gap-3">
            <VBtn
              color="secondary"
              variant="tonal"
              :disabled="isSaving"
              @click="onDialogChange(false)"
            >
              Hủy
            </VBtn>
            <VBtn
              color="primary"
              type="submit"
              :loading="isSaving"
            >
              Lưu Thay Đổi
            </VBtn>
          </div>
        </VForm>
      </VCardText>
      
      <VCardText v-else>
        <div class="text-center py-6 text-error">
          <p class="text-h6">
            Không tìm thấy thông tin cán bộ
          </p>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
