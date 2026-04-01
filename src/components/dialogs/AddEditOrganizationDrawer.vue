<script setup>
/* eslint-disable camelcase */

import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useActionFeedback } from '@/composables/useActionFeedback'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  organization: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'saved',
])

const form = ref({
  name: '',
  description: '',
  status: 'active',
  parent_id: null,
})

const saving = ref(false)
const parentOptions = ref([])
const { snackbar, showSnackbar, showError } = useActionFeedback()

// Fetch parent organizations for the dropdown
const fetchParentOptions = async () => {
  try {
    const res = await $api('/organizations', {
      params: { limit: 100, status: 'active' }, // get all active
    })
    
    // Convert to flat list with indented names for the dropdown
    // Simple mapping here, or just a flat list if the backend returns enough info
    const allOrgs = res.data || []
    
    // Filter out the organization itself to prevent circular reference
    const safeOrgs = props.organization?.id 
      ? allOrgs.filter(org => org.id !== props.organization.id) 
      : allOrgs

    parentOptions.value = safeOrgs.map(org => ({
      title: org.name,
      value: org.id,
    }))
  } catch (err) {
    console.error('Fetch parent orgs error:', err)
  }
}

watch(() => props.isDrawerOpen, visible => {
  if (visible) {
    fetchParentOptions()
    
    if (props.organization) {
      form.value = {
        name: props.organization.name || '',
        description: props.organization.description || '',
        status: props.organization.status || 'active',
        parent_id: props.organization.parent_id || null,
      }
    } else {
      form.value = { name: '', description: '', status: 'active', parent_id: null }
    }
  }
})

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = async () => {
  if (!form.value.name?.trim()) {
    showSnackbar('Vui lòng nhập tên tổ chức.', 'warning')

    return
  }

  saving.value = true
  try {
    if (props.organization?.id) {
      await $api(`/organizations/${props.organization.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $api('/organizations', {
        method: 'POST',
        body: form.value,
      })
    }

    emit('saved', {
      message: props.organization?.id ? 'Cập nhật tổ chức thành công.' : 'Thêm mới tổ chức thành công.',
    })
    closeNavigationDrawer()
  } catch (err) {
    console.error('Save organization error:', err)
    showError(err, props.organization?.id ? 'Không thể cập nhật tổ chức.' : 'Không thể thêm mới tổ chức.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDrawerOpen"
    temporary
    location="end"
    width="400"
    @update:model-value="val => emit('update:isDrawerOpen', val)"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      :title="props.organization?.id ? 'CHỈNH SỬA TỔ CHỨC' : 'THÊM MỚI TỔ CHỨC'"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm @submit.prevent="onSubmit">
            <VRow>
              <!-- Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Tên tổ chức"
                  placeholder="Nhập tên tổ chức"
                />
              </VCol>

              <!-- Description -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  label="Mô tả"
                  placeholder="Mô tả..."
                />
              </VCol>

              <!-- Parent Organization -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="form.parent_id"
                  label="Tổ chức cấp cao"
                  placeholder="Chọn tổ chức cấp cao"
                  :items="parentOptions"
                  clearable
                />
              </VCol>

              <!-- Submit and Cancel -->
              <VCol cols="12">
                <div class="d-flex justify-start gap-4">
                  <VBtn
                    type="submit"
                    :loading="saving"
                    prepend-icon="tabler-device-floppy"
                    color="info"
                  >
                    Lưu
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="closeNavigationDrawer"
                  >
                    Hủy
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>

  <ActionSnackbar
    v-model="snackbar.show"
    :message="snackbar.message"
    :color="snackbar.color"
  />
</template>
