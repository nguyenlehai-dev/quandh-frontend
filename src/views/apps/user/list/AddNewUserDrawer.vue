<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  mode: {
    type: String,
    default: 'create',
  },
  userData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const isFormValid = ref(false)
const refForm = ref()
const fullName = ref('')
const userName = ref('')
const email = ref('')
const company = ref('')
const country = ref()
const contact = ref('')
const role = ref()
const plan = ref()
const status = ref()
const roleOptions = [
  { title: 'Admin', value: 'admin' },
  { title: 'Author', value: 'author' },
  { title: 'Editor', value: 'editor' },
  { title: 'Maintainer', value: 'maintainer' },
  { title: 'Subscriber', value: 'subscriber' },
]
const planOptions = [
  { title: 'Basic', value: 'basic' },
  { title: 'Company', value: 'company' },
  { title: 'Enterprise', value: 'enterprise' },
  { title: 'Team', value: 'team' },
]
const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Pending', value: 'pending' },
]
const drawerTitle = computed(() => props.mode === 'edit' ? 'Edit User' : 'Add New User')

const resetFormFields = () => {
  fullName.value = ''
  userName.value = ''
  email.value = ''
  company.value = ''
  country.value = undefined
  contact.value = ''
  role.value = undefined
  plan.value = undefined
  status.value = undefined
}

const syncFormData = userData => {
  if (!userData) {
    resetFormFields()
    refForm.value?.resetValidation()

    return
  }

  fullName.value = userData.fullName ?? ''
  userName.value = userData.username ?? ''
  email.value = userData.email ?? ''
  company.value = userData.company ?? ''
  country.value = userData.country ?? undefined
  contact.value = userData.contact ?? ''
  role.value = userData.role?.toLowerCase?.() ?? undefined
  plan.value = userData.currentPlan?.toLowerCase?.() ?? undefined
  status.value = userData.status?.toLowerCase?.() ?? undefined
  refForm.value?.resetValidation()
}

// 👉 drawer close
const closeNavigationDrawer = () => {
  refForm.value?.resetValidation()
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    resetFormFields()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        id: props.userData?.id ?? 0,
        fullName: fullName.value,
        company: company.value,
        role: role.value,
        username: userName.value,
        country: country.value,
        contact: contact.value,
        email: email.value,
        currentPlan: plan.value,
        status: status.value,
        avatar: props.userData?.avatar ?? '',
        billing: props.userData?.billing ?? 'Auto Debit',
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        resetFormFields()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  if (!val)
    refForm.value?.resetValidation()

  emit('update:isDrawerOpen', val)
}

watch(
  () => [props.isDrawerOpen, props.userData, props.mode],
  ([isOpen, userData]) => {
    if (!isOpen)
      return

    syncFormData(userData)
  },
  { immediate: true },
)
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="drawerTitle"
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
            validate-on="submit"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="fullName"
                  :rules="[requiredValidator]"
                  label="Full Name"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="userName"
                  :rules="[requiredValidator]"
                  label="Username"
                  placeholder="Johndoe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 company -->
              <VCol cols="12">
                <AppTextField
                  v-model="company"
                  :rules="[requiredValidator]"
                  label="Company"
                  placeholder="PixInvent"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12">
                <AppSelect
                  v-model="country"
                  label="Select Country"
                  placeholder="Select Country"
                  :rules="[requiredValidator]"
                  :items="['USA', 'UK', 'India', 'Australia']"
                />
              </VCol>

              <!-- 👉 Contact -->
              <VCol cols="12">
                <AppTextField
                  v-model="contact"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Contact"
                  placeholder="+1-541-754-3010"
                />
              </VCol>

              <!-- 👉 Role -->
              <VCol cols="12">
                <AppSelect
                  v-model="role"
                  label="Select Role"
                  placeholder="Select Role"
                  :rules="[requiredValidator]"
                  :items="roleOptions"
                />
              </VCol>

              <!-- 👉 Plan -->
              <VCol cols="12">
                <AppSelect
                  v-model="plan"
                  label="Select Plan"
                  placeholder="Select Plan"
                  :rules="[requiredValidator]"
                  :items="planOptions"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="status"
                  label="Select Status"
                  placeholder="Select Status"
                  :rules="[requiredValidator]"
                  :items="statusOptions"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
