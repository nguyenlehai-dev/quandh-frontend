<script setup>
import UserAssignmentsManager from './UserAssignmentsManager.vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const isFormValid = ref(false)
const refForm = ref()
const name = ref('')
const userName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const status = ref('active')
const assignments = ref([])

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
    assignments.value = []
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        name: name.value,
        user_name: userName.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
        status: status.value,
        assignments: assignments.value,
      })

      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
        assignments.value = []
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="600"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Thêm Cán bộ mới"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  :rules="[requiredValidator]"
                  label="Họ và Tên"
                  placeholder="Nguyễn Văn A"
                />
              </VCol>

              <!-- 👉 Username -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userName"
                  :rules="[requiredValidator]"
                  label="Tên đăng nhập"
                  placeholder="nguyenvana"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="email@example.com"
                />
              </VCol>

              <!-- 👉 Password -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="password"
                  :rules="[requiredValidator]"
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••"
                />
              </VCol>

              <!-- 👉 Password Confirmation -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="passwordConfirmation"
                  :rules="[requiredValidator]"
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="••••••"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="status"
                  label="Trạng thái"
                  :items="[
                    { title: 'Đang hoạt động', value: 'active' },
                    { title: 'Tạm khóa', value: 'inactive' },
                    { title: 'Cấm', value: 'banned' },
                  ]"
                />
              </VCol>

              <!-- 👉 Assignments -->
              <VCol cols="12">
                <VDivider class="mb-4" />
                <UserAssignmentsManager v-model="assignments" />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Lưu
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Hủy
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
