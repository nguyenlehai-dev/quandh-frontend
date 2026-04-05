<script setup>
/* eslint-disable camelcase */

import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useActionFeedback } from '@/composables/useActionFeedback'
import {
  createOrganization,
  fetchPublicOrganizationOptions,
  updateOrganization,
} from '@/modules/auth/organizations/services/organizationService'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
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
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      form: {
        detailTitle: 'ORGANIZATION DETAILS',
        editTitle: 'EDIT ORGANIZATION',
        createTitle: 'ADD NEW ORGANIZATION',
        name: 'Organization name',
        namePlaceholder: 'Enter organization name',
        slugPlaceholder: 'Leave blank to let backend generate it',
        description: 'Description',
        descriptionPlaceholder: 'Enter description',
        parent: 'Parent organization',
        parentPlaceholder: 'Select parent organization',
        parentHint: 'Select a parent organization if you want this organization to belong to a parent.',
        status: 'Status',
        sortOrderParent: 'Order within parent organization',
        sortOrderRoot: 'Root order',
        sortOrderParentHint: 'If a parent organization is selected, the order is understood as the position inside "{name}".',
        sortOrderRootHint: 'If no parent organization is selected, the order is understood as the root-level position.',
        parentFallback: 'parent organization',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        validationName: 'Please enter organization name.',
        updateSuccess: 'Organization updated successfully.',
        createSuccess: 'Organization created successfully.',
        updateError: 'Unable to update organization.',
        createError: 'Unable to create organization.',
      },
    },
    vi: {
      form: {
        detailTitle: 'CHI TIẾT TỔ CHỨC',
        editTitle: 'CHỈNH SỬA TỔ CHỨC',
        createTitle: 'THÊM MỚI TỔ CHỨC',
        name: 'Tên tổ chức',
        namePlaceholder: 'Nhập tên tổ chức',
        slugPlaceholder: 'Để trống nếu muốn backend tự sinh',
        description: 'Mô tả',
        descriptionPlaceholder: 'Nhập mô tả',
        parent: 'Tổ chức cấp trên',
        parentPlaceholder: 'Chọn tổ chức cấp trên',
        parentHint: 'Chọn tổ chức cấp trên nếu muốn tổ chức này nằm bên trong một tổ chức cha.',
        status: 'Trạng thái',
        sortOrderParent: 'Thứ tự trong tổ chức cha',
        sortOrderRoot: 'Thứ tự cấp gốc',
        sortOrderParentHint: 'Nếu đã chọn tổ chức cấp trên, số thứ tự sẽ được hiểu là vị trí bên trong "{name}".',
        sortOrderRootHint: 'Nếu không chọn tổ chức cấp trên, số thứ tự sẽ được hiểu là vị trí ngoài cấp gốc.',
        parentFallback: 'tổ chức cha',
        save: 'Lưu',
        cancel: 'Hủy',
        close: 'Đóng',
        validationName: 'Vui lòng nhập tên tổ chức.',
        updateSuccess: 'Cập nhật tổ chức thành công.',
        createSuccess: 'Thêm mới tổ chức thành công.',
        updateError: 'Không thể cập nhật tổ chức.',
        createError: 'Không thể thêm mới tổ chức.',
      },
    },
  },
})

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
const parentOptionsLoading = ref(false)
const parentOptions = ref([])
const parentSearch = ref('')
const { snackbar, showSnackbar, showError } = useActionFeedback()

const selectedParentLabel = computed(() => {
  const selected = parentOptions.value.find(item => item.value === form.value.parent_id)

  return selected?.title?.replace(/^--\s*/g, '') || ''
})

const sortOrderLabel = computed(() => {
  return form.value.parent_id ? t('form.sortOrderParent') : t('form.sortOrderRoot')
})

const sortOrderHint = computed(() => {
  if (form.value.parent_id)
    return t('form.sortOrderParentHint', { name: selectedParentLabel.value || t('form.parentFallback') })

  return t('form.sortOrderRootHint')
})

const normalizeParentOptions = items => {
  const options = (items || []).map(item => ({
    title: item.name,
    value: item.id,
  }))

  if (props.organization?.parent?.id && !options.some(item => item.value === props.organization.parent.id)) {
    options.unshift({
      title: props.organization.parent.name,
      value: props.organization.parent.id,
    })
  }

  return props.organization?.id
    ? options.filter(item => item.value !== props.organization.id)
    : options
}

const fetchParentOptions = async search => {
  parentOptionsLoading.value = true
  try {
    const response = await fetchPublicOrganizationOptions({
      search: search || undefined,
      status: 'active',
      sort_by: 'name',
      sort_order: 'asc',
      limit: 100,
    })

    parentOptions.value = normalizeParentOptions(response.data || [])
  }
  catch (error) {
    console.error('Fetch parent organizations error:', error)
    parentOptions.value = []
  }
  finally {
    parentOptionsLoading.value = false
  }
}

const resetForm = () => {
  form.value = defaultForm()
}

watch(() => props.isDrawerOpen, visible => {
  if (!visible)
    return

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

  parentSearch.value = ''
  fetchParentOptions()
})

watchDebounced(parentSearch, value => {
  if (!props.isDrawerOpen) return

  fetchParentOptions(value)
}, { debounce: 400, maxWait: 1000 })

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = async () => {
  if (props.readonly) {
    closeNavigationDrawer()

    return
  }

  if (!form.value.name?.trim()) {
    showSnackbar(t('form.validationName'), 'warning')

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
        ? t('form.updateSuccess')
        : t('form.createSuccess'),
    })
    closeNavigationDrawer()
  }
  catch (error) {
    console.error('Save organization error:', error)
    showError(
      error,
      props.organization?.id
        ? t('form.updateError')
        : t('form.createError'),
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
      :title="props.readonly ? t('form.detailTitle') : props.organization?.id ? t('form.editTitle') : t('form.createTitle')"
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
                  :label="t('form.name')"
                  :placeholder="t('form.namePlaceholder')"
                  :readonly="props.readonly"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.slug"
                  label="Slug"
                  :placeholder="t('form.slugPlaceholder')"
                  :readonly="props.readonly"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  :label="t('form.description')"
                  :placeholder="t('form.descriptionPlaceholder')"
                  :readonly="props.readonly"
                />
              </VCol>

              <VCol cols="12">
                <AppAutocomplete
                  v-model="form.parent_id"
                  v-model:search="parentSearch"
                  :label="t('form.parent')"
                  :placeholder="t('form.parentPlaceholder')"
                  :items="parentOptions"
                  :loading="parentOptionsLoading"
                  item-title="title"
                  item-value="value"
                  no-filter
                  :clearable="!props.readonly"
                  :readonly="props.readonly"
                  :disabled="props.readonly"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ t('form.parentHint') }}
                </div>
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="form.status"
                  :readonly="props.readonly"
                  :disabled="props.readonly"
                  :label="t('form.status')"
                  :items="[
                    { title: t('organizations.organizations.status.active'), value: 'active' },
                    { title: t('organizations.organizations.status.inactive'), value: 'inactive' },
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
                  :readonly="props.readonly"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ sortOrderHint }}
                </div>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-start gap-4">
                  <VBtn
                    v-if="!props.readonly"
                    type="submit"
                    :loading="saving"
                    prepend-icon="tabler-device-floppy"
                    color="primary"
                  >
                    {{ t('form.save') }}
                  </VBtn>
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="closeNavigationDrawer"
                  >
                    {{ props.readonly ? t('form.close') : t('form.cancel') }}
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
