<script setup>
/**
 * AddEmployeeDrawer Component
 *
 * Drawer dùng để thêm/sửa nhân viên.
 * Sử dụng useEmployee composable cho form logic.
 */
import { useEmployee } from '../composables/useEmployee'
import { DEPARTMENTS } from '../configs'
import { employeeStatuses } from '../models/Employee'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  employeeData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:isDrawerOpen', 'submitted'])

const { employee, isSubmitting, errors, isEditMode, resetForm, setEmployee, submitForm } = useEmployee()

// Khi mở drawer với data → set edit mode
watch(() => props.employeeData, val => {
  if (val) setEmployee(val)
  else resetForm()
})

const handleClose = () => {
  resetForm()
  emit('update:isDrawerOpen', false)
}

const handleSubmit = async () => {
  try {
    await submitForm()
    emit('submitted')
    handleClose()
  }
  catch {
    // Errors đã được handle trong composable
  }
}
</script>

<template>
  <VNavigationDrawer
    :model-value="isDrawerOpen"
    temporary
    location="end"
    width="400"
    @update:model-value="handleClose"
  >
    <!-- Header -->
    <AppDrawerHeaderSection>
      <template #title>
        {{ isEditMode ? 'Sửa nhân viên' : 'Thêm nhân viên' }}
      </template>
      <template #beforeClose>
        <IconBtn @click="handleClose">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </template>
    </AppDrawerHeaderSection>

    <VDivider />

    <!-- Form -->
    <VCardText>
      <VForm @submit.prevent="handleSubmit">
        <VRow>
          <!-- Họ tên -->
          <VCol cols="12">
            <VTextField
              v-model="employee.fullName"
              label="Họ và tên"
              :error-messages="errors.fullName"
              placeholder="Nguyễn Văn A"
            />
          </VCol>

          <!-- Email -->
          <VCol cols="12">
            <VTextField
              v-model="employee.email"
              label="Email"
              type="email"
              :error-messages="errors.email"
              placeholder="email@company.com"
            />
          </VCol>

          <!-- Số điện thoại -->
          <VCol cols="12">
            <VTextField
              v-model="employee.phone"
              label="Số điện thoại"
              :error-messages="errors.phone"
              placeholder="0912 345 678"
            />
          </VCol>

          <!-- Phòng ban -->
          <VCol cols="12">
            <VSelect
              v-model="employee.department"
              label="Phòng ban"
              :items="DEPARTMENTS"
              :error-messages="errors.department"
            />
          </VCol>

          <!-- Chức vụ -->
          <VCol cols="12">
            <VTextField
              v-model="employee.position"
              label="Chức vụ"
              :error-messages="errors.position"
              placeholder="Senior Developer"
            />
          </VCol>

          <!-- Trạng thái -->
          <VCol cols="12">
            <VSelect
              v-model="employee.status"
              label="Trạng thái"
              :items="employeeStatuses"
              item-title="title"
              item-value="value"
            />
          </VCol>

          <!-- Actions -->
          <VCol cols="12">
            <VBtn
              type="submit"
              class="me-3"
              :loading="isSubmitting"
            >
              {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </VBtn>
            <VBtn
              variant="tonal"
              color="secondary"
              @click="handleClose"
            >
              Hủy
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VNavigationDrawer>
</template>
