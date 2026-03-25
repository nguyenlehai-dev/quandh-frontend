<script setup>
import girlUsingMobile from '@images/pages/girl-using-mobile.png'

const roles = ref([])
const loading = ref(false)

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await $api('/roles', { params: { limit: 100 } })

    roles.value = (res.data ?? res ?? []).map(role => ({
      id: role.id,
      role: role.name,
      totalUsers: role.users_count ?? 0,
      permissions: role.permissions ?? [],
    }))
  }
  catch (err) {
    console.error('Fetch roles error:', err)
    roles.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(() => fetchRoles())

const isRoleDialogVisible = ref(false)
const roleDetail = ref({ id: null, name: '', permissions: [] })
const isAddRoleDialogVisible = ref(false)

const editPermission = item => {
  isRoleDialogVisible.value = true
  roleDetail.value = {
    id: item.id,
    name: item.role,
    permissions: item.permissions,
  }
}

const onRoleSaved = () => {
  fetchRoles()
}
</script>

<template>
  <VRow>
    <!-- Loading -->
    <VCol
      v-if="loading"
      cols="12"
      class="text-center"
    >
      <VProgressCircular indeterminate />
    </VCol>

    <!-- 👉 Roles -->
    <VCol
      v-for="item in roles"
      :key="item.role"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardText class="d-flex align-center pb-4">
          <div class="text-body-1">
            Tổng {{ item.totalUsers }} người dùng
          </div>

          <VSpacer />
        </VCardText>

        <VCardText>
          <div class="d-flex justify-space-between align-center">
            <div>
              <h5 class="text-h5">
                {{ item.role }}
              </h5>
              <div class="d-flex align-center">
                <a
                  href="javascript:void(0)"
                  @click="editPermission(item)"
                >
                  Chỉnh sửa vai trò
                </a>
              </div>
            </div>
            <IconBtn>
              <VIcon
                icon="tabler-copy"
                class="text-high-emphasis"
              />
            </IconBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Add New Role -->
    <VCol
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard
        class="h-100"
        :ripple="false"
      >
        <VRow
          no-gutters
          class="h-100"
        >
          <VCol
            cols="5"
            class="d-flex flex-column justify-end align-center mt-5"
          >
            <img
              width="85"
              :src="girlUsingMobile"
            >
          </VCol>

          <VCol cols="7">
            <VCardText class="d-flex flex-column align-end justify-end gap-4">
              <VBtn
                size="small"
                @click="isAddRoleDialogVisible = true"
              >
                Thêm vai trò
              </VBtn>
              <div class="text-end">
                Thêm vai trò mới,<br> nếu chưa tồn tại.
              </div>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
      <AddEditRoleDialog
        v-model:is-dialog-visible="isAddRoleDialogVisible"
        @saved="onRoleSaved"
      />
    </VCol>
  </VRow>

  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDialogVisible"
    v-model:role-permissions="roleDetail"
    @saved="onRoleSaved"
  />
</template>
