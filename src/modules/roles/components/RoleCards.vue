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
      scope: role.scope ?? 'admin',
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
    scope: item.scope,
    permissions: item.permissions,
  }
}

const onRoleSaved = () => {
  fetchRoles()
}

const deleteRole = async item => {
  if (confirm(`Bạn có chắc chắn muốn xóa vai trò "${item.role}" không?`)) {
    try {
      await $api(`/roles/${item.id}`, { method: 'DELETE' })
      fetchRoles()
    } catch (err) {
      console.error('Delete role error:', err)
      alert(err.message || 'Có lỗi xảy ra khi xóa vai trò.')
    }
  }
}
</script>

<template>
  <div>
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
        <VCard class="h-100">
          <VCardText class="pb-3">
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-body-2 text-disabled">Tổng cộng {{ item.totalUsers }} người dùng</span>
              <IconBtn
                size="small"
                variant="text"
                color="secondary"
              >
                <VIcon
                  icon="tabler-copy"
                  size="20"
                />
              </IconBtn>
            </div>
            <h4 class="text-h4 mb-4 font-weight-bold">
              {{ item.role }}
            </h4>
            <div class="d-flex align-center gap-2">
              <a
                href="javascript:void(0)"
                class="text-info font-weight-medium text-body-2 text-decoration-none"
                @click="editPermission(item)"
              >
                Chỉnh sửa vai trò
              </a>
              <IconBtn
                size="small"
                variant="text"
                color="error"
                @click="deleteRole(item)"
              >
                <VIcon
                  icon="tabler-trash"
                  size="18"
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
              cols="4"
              class="d-flex flex-column justify-end align-center mt-3"
            >
              <img
                width="85"
                :src="girlUsingMobile"
              >
            </VCol>

            <VCol
              cols="8"
              class="d-flex flex-column align-end justify-center pe-5"
            >
              <VBtn
                size="small"
                variant="outlined"
                color="info"
                class="mb-2"
                @click="isAddRoleDialogVisible = true"
              >
                + Tạo Mới Vai Trò
              </VBtn>
              <span
                class="text-caption text-end text-disabled"
                style="line-height: 1.2; max-inline-size: 150px;"
              >
                Tạo mới vai trò, chưa có trong hệ thống.
              </span>
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
  </div>
</template>
