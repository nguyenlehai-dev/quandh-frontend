<script setup>
import { formatAuthDateTime } from '../../shared/dateTime'
import { fetchOrganization } from '../services/organizationService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  organizationId: {
    type: [Number, String, null],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const organizationDetail = ref(null)

const closeDialog = () => emit('update:modelValue', false)
const hasInactiveParent = computed(() => organizationDetail.value?.parent?.status === 'inactive')

const statusTone = status => status === 'active' ? 'success' : 'error'
const statusLabel = status => status === 'active' ? 'Dang hoat dong' : 'Ngung hoat dong'
const effectiveStatusTone = computed(() => hasInactiveParent.value ? 'warning' : statusTone(organizationDetail.value?.status))
const effectiveStatusLabel = computed(() => hasInactiveParent.value ? 'Phu thuoc to chuc cha dang ngung' : statusLabel(organizationDetail.value?.status))

const detailRows = computed(() => {
  if (!organizationDetail.value) return []

  return [
    ['Ten to chuc', organizationDetail.value.name || 'N/A'],
    ['Slug', organizationDetail.value.slug || 'N/A'],
    ['Trang thai', statusLabel(organizationDetail.value.status)],
    ['To chuc cap tren', organizationDetail.value.parent?.name || 'To chuc goc'],
    ['Thu tu', organizationDetail.value.sort_order ?? 0],
    ['Do sau cay', organizationDetail.value.depth ?? 0],
    ['Nguoi tao', organizationDetail.value.created_by || 'N/A'],
    ['Nguoi cap nhat', organizationDetail.value.updated_by || 'N/A'],
    ['Ngay tao', formatAuthDateTime(organizationDetail.value.created_at)],
    ['Lan cap nhat cuoi', formatAuthDateTime(organizationDetail.value.updated_at)],
    ['Mo ta', organizationDetail.value.description || 'Khong co mo ta'],
  ]
})

const childrenNames = computed(() => {
  const children = organizationDetail.value?.children

  if (!Array.isArray(children) || !children.length)
    return []

  return children.map(child => child.name)
})

const loadOrganizationDetail = async () => {
  if (!props.organizationId) {
    organizationDetail.value = null

    return
  }

  loading.value = true
  try {
    const response = await fetchOrganization(props.organizationId)

    organizationDetail.value = response.data ?? response
  }
  catch (error) {
    console.error('Failed to fetch organization detail:', error)
    organizationDetail.value = null
  }
  finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.organizationId],
  ([visible]) => {
    if (visible) {
      loadOrganizationDetail()
    }
    else {
      organizationDetail.value = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="760"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <VCard>
      <VCardItem>
        <template #prepend>
          <VIcon icon="tabler-building-bank" color="primary" class="me-2" />
        </template>
        <VCardTitle>Chi tiet to chuc</VCardTitle>
        <template #append>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </template>
      </VCardItem>

      <VDivider />

      <VCardText v-if="loading" class="py-10">
        <div class="d-flex align-center justify-center flex-column gap-3">
          <VProgressCircular indeterminate color="primary" />
          <span class="text-body-2 text-medium-emphasis">Dang tai chi tiet to chuc...</span>
        </div>
      </VCardText>

      <VCardText v-else-if="organizationDetail">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
          <div>
            <h4 class="text-h4 mb-1">
              {{ organizationDetail.name }}
            </h4>
            <div class="text-body-2 text-medium-emphasis">
              {{ organizationDetail.slug || 'Khong co slug' }}
            </div>
          </div>

          <VChip
            label
            variant="tonal"
            :color="effectiveStatusTone"
          >
            {{ effectiveStatusLabel }}
          </VChip>
        </div>

        <VRow>
          <VCol
            v-for="[label, value] in detailRows"
            :key="label"
            cols="12"
            md="6"
          >
            <VCard variant="tonal" color="default">
              <VCardText>
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ label }}
                </div>
                <div class="text-body-1 text-high-emphasis">
                  {{ value }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <div class="mt-6">
          <div class="text-subtitle-1 font-weight-medium mb-3">
            To chuc con
          </div>

          <div
            v-if="childrenNames.length"
            class="d-flex flex-wrap gap-2"
          >
            <VChip
              v-for="childName in childrenNames"
              :key="childName"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ childName }}
            </VChip>
          </div>

          <VAlert v-else type="info" variant="tonal">
            To chuc nay hien chua co to chuc con.
          </VAlert>
        </div>
      </VCardText>

      <VCardText v-else>
        <VAlert type="warning" variant="tonal">
          Khong tai duoc chi tiet to chuc.
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn variant="tonal" @click="closeDialog">
          Dong
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
