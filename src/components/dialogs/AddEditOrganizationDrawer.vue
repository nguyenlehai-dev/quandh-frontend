<script setup>
/* eslint-disable camelcase */

import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  createOrganization,
  fetchOrganizationTree,
  updateOrganization,
} from '@/modules/auth/organizations/services/organizationService'

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

const defaultForm = () => ({
  name: '',
  slug: '',
  description: '',
  status: 'active',
  parent_id: null,
  sort_order: 0,
})

const form = ref(defaultForm())
const saving = ref(false)
const parentOptions = ref([])
const { snackbar, showSnackbar, showError } = useActionFeedback()

const selectedParentLabel = computed(() => {
  const selected = parentOptions.value.find(item => item.value === form.value.parent_id)

  return selected?.title?.replace(/^--\s*/g, '') || ''
})

const sortOrderLabel = computed(() => {
  return form.value.parent_id ? 'Thu tu trong to chuc cha' : 'Thu tu cap goc'
})

const sortOrderHint = computed(() => {
  if (form.value.parent_id)
    return `Neu da chon to chuc cap tren, so thu tu se duoc hieu la vi tri ben trong "${selectedParentLabel.value || 'to chuc cha'}".`

  return 'Neu khong chon to chuc cap tren, so thu tu se duoc hieu la vi tri ngoai cap goc.'
})

const flattenTreeOptions = (nodes, depth = 0, options = []) => {
  nodes.forEach(node => {
    options.push({
      title: `${'-- '.repeat(depth)}${node.name}`,
      value: node.id,
    })

    if (Array.isArray(node.children) && node.children.length)
      flattenTreeOptions(node.children, depth + 1, options)
  })

  return options
}

const fetchParentOptions = async () => {
  try {
    const response = await fetchOrganizationTree({ status: 'active' })
    const options = flattenTreeOptions(response.data || [])

    parentOptions.value = props.organization?.id
      ? options.filter(item => item.value !== props.organization.id)
      : options
  }
  catch (error) {
    console.error('Fetch parent organizations error:', error)
    parentOptions.value = []
  }
}

const resetForm = () => {
  form.value = defaultForm()
}

watch(() => props.isDrawerOpen, visible => {
  if (!visible)
    return

  fetchParentOptions()

  if (props.organization) {
    form.value = {
      name: props.organization.name || '',
      slug: props.organization.slug || '',
      description: props.organization.description || '',
      status: props.organization.status || 'active',
      parent_id: props.organization.parent_id || null,
      sort_order: props.organization.sort_order ?? 0,
    }
  }
  else {
    resetForm()
  }
})

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = async () => {
  if (!form.value.name?.trim()) {
    showSnackbar('Vui long nhap ten to chuc.', 'warning')

    return
  }

  saving.value = true
  try {
    const payload = {
      ...form.value,
      slug: form.value.slug || null,
      parent_id: form.value.parent_id || null,
      sort_order: Number(form.value.sort_order || 0),
    }

    if (props.organization?.id) {
      await updateOrganization(props.organization.id, payload)
    }
    else {
      await createOrganization(payload)
    }

    emit('saved', {
      message: props.organization?.id
        ? 'Cap nhat to chuc thanh cong.'
        : 'Them moi to chuc thanh cong.',
    })
    closeNavigationDrawer()
  }
  catch (error) {
    console.error('Save organization error:', error)
    showError(
      error,
      props.organization?.id
        ? 'Khong the cap nhat to chuc.'
        : 'Khong the them moi to chuc.',
    )
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDrawerOpen"
    temporary
    location="end"
    width="420"
    @update:model-value="val => emit('update:isDrawerOpen', val)"
  >
    <AppDrawerHeaderSection
      :title="props.organization?.id ? 'CHINH SUA TO CHUC' : 'THEM MOI TO CHUC'"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Ten to chuc"
                  placeholder="Nhap ten to chuc"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.slug"
                  label="Slug"
                  placeholder="De trong neu muon backend tu sinh"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  label="Mo ta"
                  placeholder="Nhap mo ta"
                />
              </VCol>

              <VCol cols="12">
                <AppAutocomplete
                  v-model="form.parent_id"
                  label="To chuc cap tren"
                  placeholder="Chon to chuc cap tren"
                  :items="parentOptions"
                  clearable
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  Chon to chuc cap tren neu muon to chuc nay nam ben trong mot to chuc cha.
                </div>
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="form.status"
                  label="Trang thai"
                  :items="[
                    { title: 'Dang hoat dong', value: 'active' },
                    { title: 'Ngung hoat dong', value: 'inactive' },
                  ]"
                  item-title="title"
                  item-value="value"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.sort_order"
                  :label="sortOrderLabel"
                  type="number"
                  min="0"
                  placeholder="0"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ sortOrderHint }}
                </div>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-start gap-4">
                  <VBtn
                    type="submit"
                    :loading="saving"
                    prepend-icon="tabler-device-floppy"
                    color="primary"
                  >
                    Luu
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="closeNavigationDrawer"
                  >
                    Huy
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
