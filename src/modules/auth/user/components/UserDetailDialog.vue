<script setup>
import { useUserStore } from '../stores/useUserStore'

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

const emit = defineEmits(['update:isDialogVisible'])

const userStore = useUserStore()
const isLoading = ref(false)
const userDetail = ref(null)

const fetchUserDetail = async () => {
  if (!props.userId) return
  isLoading.value = true
  try {
    const res = await userStore.fetchOne(props.userId)

    userDetail.value = res.data ?? res
  }
  catch (err) {
    console.error('Fetch user detail error:', err)
  }
  finally {
    isLoading.value = false
  }
}

watch(
  () => props.isDialogVisible,
  isVisible => {
    if (isVisible && props.userId) {
      fetchUserDetail()
    }
    else {
      userDetail.value = null
    }
  },
)

const resolveUserStatusVariant = stat => {
  if (!stat) return 'primary'
  const s = stat.toLowerCase() === 'active' ? 'active' : 'inactive'

  if (s === 'active') return 'success'
  if (s === 'inactive') return 'warning'

  return 'primary'
}

const resolveStatusText = stat => {
  const s = stat?.toLowerCase() === 'active' ? 'active' : 'inactive'

  if (s === 'active') return 'Đang hoạt động'
  if (s === 'inactive') return 'Tạm khóa'

  return stat
}

const onDialogChange = val => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="850"
    @update:model-value="onDialogChange"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="onDialogChange(false)" />

    <VCard title="Chi tiết Cán bộ">
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
        <VRow>
          <!-- Left Column: User Profile -->
          <VCol
            cols="12"
            md="5"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardText class="d-flex flex-column align-center text-center">
                <!-- Avatar -->
                <VAvatar
                  size="100"
                  color="primary"
                  variant="tonal"
                  class="mb-4"
                >
                  <span class="text-h3">{{ avatarText(userDetail.name) }}</span>
                </VAvatar>

                <!-- Name & Username -->
                <h5 class="text-h5 mb-1">
                  {{ userDetail.name }}
                </h5>
                <VChip
                  label
                  size="small"
                  color="secondary"
                  class="mb-4 text-capitalize"
                >
                  @{{ userDetail.user_name }}
                </VChip>

                <!-- Status -->
                <VChip
                  label
                  :color="resolveUserStatusVariant(userDetail.status)"
                  class="mb-4 text-capitalize font-weight-bold"
                >
                  {{ resolveStatusText(userDetail.status) }}
                </VChip>
              </VCardText>

              <VDivider />

              <VCardText>
                <h6 class="text-h6 mb-3">
                  Thông tin cơ bản
                </h6>
                <VList class="card-list mt-2">
                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon
                        icon="tabler-mail"
                        size="20"
                        class="me-2 text-primary"
                      />
                    </template>
                    <VListItemTitle class="font-weight-medium">
                      Email:
                    </VListItemTitle>
                    <VListItemSubtitle class="text-body-1 mt-1">
                      {{ userDetail.email }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon
                        icon="tabler-clock"
                        size="20"
                        class="me-2 text-info"
                      />
                    </template>
                    <VListItemTitle class="font-weight-medium">
                      Ngày tạo:
                    </VListItemTitle>
                    <VListItemSubtitle class="text-body-1 mt-1">
                      {{ userDetail.created_at || 'N/A' }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem class="px-0">
                    <template #prepend>
                      <VIcon
                        icon="tabler-user-edit"
                        size="20"
                        class="me-2 text-warning"
                      />
                    </template>
                    <VListItemTitle class="font-weight-medium">
                      Tạo bởi:
                    </VListItemTitle>
                    <VListItemSubtitle class="text-body-1 mt-1">
                      {{ userDetail.created_by || 'N/A' }}
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Right Column: Roles & Organizations -->
          <VCol
            cols="12"
            md="7"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardItem>
                <VCardTitle class="text-h6 d-flex align-center">
                  <VIcon
                    icon="tabler-shield-lock"
                    size="24"
                    class="me-2 text-primary"
                  />
                  Phân quyền & Tổ chức
                </VCardTitle>
              </VCardItem>

              <VDivider />

              <VCardText class="pa-0">
                <template v-if="userDetail.assignments && userDetail.assignments.length > 0">
                  <VTable class="text-no-wrap">
                    <thead>
                      <tr>
                        <th class="text-uppercase text-body-2 font-weight-bold">
                          Vai trò
                        </th>
                        <th class="text-uppercase text-body-2 font-weight-bold">
                          Tổ chức tham gia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(assignment, index) in userDetail.assignments"
                        :key="index"
                      >
                        <td>
                          <VChip
                            color="info"
                            size="small"
                            label
                            class="font-weight-medium"
                          >
                            {{ assignment.role_name }}
                          </VChip>
                        </td>
                        <td class="py-3">
                          <div class="d-flex flex-column gap-1">
                            <span
                              v-for="org in assignment.organizations"
                              :key="org.id"
                              class="text-body-1"
                            >
                              • {{ org.name }}
                            </span>
                            <span
                              v-if="!assignment.organizations || assignment.organizations.length === 0"
                              class="text-body-2 text-disabled"
                            >
                              (Toàn hệ thống)
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </template>
                <template v-else>
                  <div class="text-center py-8 px-4 text-medium-emphasis">
                    <VIcon
                      icon="tabler-shield-off"
                      size="48"
                      class="mb-3"
                    />
                    <p class="text-body-1">
                      Cán bộ này chưa được gán vai trò nào.
                    </p>
                  </div>
                </template>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
      
      <VCardText v-else>
        <div class="text-center py-6 text-error">
          <p class="text-h6">
            Không tìm thấy thông tin cán bộ
          </p>
        </div>
      </VCardText>

      <VCardText class="d-flex justify-end mt-4">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="onDialogChange(false)"
        >
          Đóng
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}
</style>
