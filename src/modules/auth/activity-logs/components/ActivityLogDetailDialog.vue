<script setup>
/* eslint-disable vue/max-attributes-per-line */
import { formatAuthDateTime } from '../../shared/dateTime'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  activityLog: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const closeDialog = () => {
  emit('update:modelValue', false)
}

const requestDataDisplay = computed(() => {
  if (!props.activityLog?.request_data)
    return '{}'

  if (typeof props.activityLog.request_data === 'string')
    return props.activityLog.request_data

  try {
    return JSON.stringify(props.activityLog.request_data, null, 2)
  }
  catch {
    return '{}'
  }
})
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="760"
    @update:model-value="closeDialog"
  >
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-2 pa-sm-6">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          Chi tiet nhat ky hoat dong
        </h4>
        <p class="text-body-1 text-center mb-6">
          Xem thong tin request, nguoi dung, route va du lieu lien quan.
        </p>

        <div
          v-if="loading"
          class="py-10 text-center"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>

        <VRow v-else>
          <VCol
            cols="12"
            md="6"
          >
            <strong>ID:</strong> {{ activityLog?.id ?? 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Nguoi dung:</strong> {{ activityLog?.user_name || 'Guest' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>User type:</strong> {{ activityLog?.user_type || 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Organization ID:</strong> {{ activityLog?.organization_id ?? 'N/A' }}
          </VCol>
          <VCol cols="12">
            <strong>Mo ta:</strong> {{ activityLog?.description || 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Route:</strong> {{ activityLog?.route || 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <strong>Method:</strong> {{ activityLog?.method_type || 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <strong>Status:</strong> {{ activityLog?.status_code ?? 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>IP:</strong> {{ activityLog?.ip_address || 'N/A' }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Country:</strong> {{ activityLog?.country || 'N/A' }}
          </VCol>
          <VCol cols="12">
            <strong>User agent:</strong>
            <div class="activity-log-detail__block mt-2">
              {{ activityLog?.user_agent || 'N/A' }}
            </div>
          </VCol>
          <VCol cols="12">
            <strong>Request data:</strong>
            <pre class="activity-log-detail__block mt-2">{{ requestDataDisplay }}</pre>
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Created at:</strong> {{ formatAuthDateTime(activityLog?.created_at, { fallback: 'N/A', includeSeconds: true }) }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>Updated at:</strong> {{ formatAuthDateTime(activityLog?.updated_at, { fallback: 'N/A', includeSeconds: true }) }}
          </VCol>
        </VRow>

        <div class="d-flex justify-center mt-6">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="closeDialog"
          >
            Dong
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.activity-log-detail__block {
  overflow: auto;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 12px 14px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
