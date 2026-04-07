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
  organization: {
    type: Object,
    default: null,
  },
  parentOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'organizationData',
  'update:isDrawerOpen',
])

const refForm = ref()
const isFormValid = ref(false)
const name = ref('')
const parentId = ref(null)
const description = ref('')
const status = ref(true)
const isViewMode = computed(() => props.mode === 'view')
const drawerTitle = computed(() => {
  if (props.mode === 'edit')
    return 'Chỉnh sửa tổ chức'

  if (props.mode === 'view')
    return 'Xem tổ chức'

  return 'Thêm tổ chức'
})

const resetForm = () => {
  name.value = ''
  parentId.value = null
  description.value = ''
  status.value = true
  refForm.value?.resetValidation()
}

const syncFormData = organization => {
  if (!organization) {
    resetForm()

    return
  }

  name.value = organization.name ?? ''
  parentId.value = organization.parentId ?? null
  description.value = organization.description ?? ''
  status.value = organization.status ?? true
  refForm.value?.resetValidation()
}

const closeNavigationDrawer = () => {
  refForm.value?.resetValidation()
  emit('update:isDrawerOpen', false)
  nextTick(resetForm)
}

const handleDrawerModelValueUpdate = value => {
  if (!value)
    refForm.value?.resetValidation()

  emit('update:isDrawerOpen', value)

  if (!value)
    nextTick(resetForm)
}

const onSubmit = () => {
  if (isViewMode.value) {
    closeNavigationDrawer()

    return
  }

  refForm.value?.validate().then(({ valid }) => {
    if (!valid)
      return

    emit('organizationData', {
      description: description.value.trim(),
      id: props.organization?.id ?? null,
      name: name.value.trim(),
      parentId: parentId.value,
      status: status.value,
    })
    emit('update:isDrawerOpen', false)
    nextTick(resetForm)
  })
}

watch(
  () => [props.isDrawerOpen, props.organization],
  ([isOpen, organization]) => {
    if (!isOpen)
      return

    syncFormData(organization)
  },
  { immediate: true },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    location="end"
    :width="420"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <AppDrawerHeaderSection
      :title="drawerTitle"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            validate-on="submit"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  label="Tên tổ chức"
                  placeholder="Nhập tên tổ chức"
                  :rules="[requiredValidator]"
                  :readonly="isViewMode"
                />
              </VCol>

              <VCol cols="12">
                <AppSelect
                  v-model="parentId"
                  label="Tổ chức cấp cao"
                  placeholder="Chọn tổ chức cấp cao"
                  :items="props.parentOptions"
                  :readonly="isViewMode"
                />
              </VCol>

              <VCol cols="12">
                <AppTextarea
                  v-model="description"
                  label="Mô tả"
                  placeholder="Nhập mô tả ngắn"
                  rows="3"
                  auto-grow
                  :readonly="isViewMode"
                />
              </VCol>

              <VCol cols="12">
                <AppSelect
                  v-model="status"
                  label="Trạng thái"
                  placeholder="Chọn trạng thái"
                  :items="[
                    { title: 'Hoạt động', value: true },
                    { title: 'Ngưng hoạt động', value: false },
                  ]"
                  :readonly="isViewMode"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex gap-3">
                  <VBtn
                    v-if="!isViewMode"
                    type="submit"
                  >
                    Lưu
                  </VBtn>

                  <VBtn
                    type="button"
                    :variant="isViewMode ? 'elevated' : 'tonal'"
                    :color="isViewMode ? 'primary' : 'secondary'"
                    @click="closeNavigationDrawer"
                  >
                    {{ isViewMode ? 'Đóng' : 'Hủy' }}
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
