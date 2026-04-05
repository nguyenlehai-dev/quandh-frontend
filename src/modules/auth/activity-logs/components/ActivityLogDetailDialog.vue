<script setup>
/* eslint-disable vue/max-attributes-per-line */
import { formatAuthDateTime } from '../../shared/dateTime'
const { t } = useI18n()

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
          {{ t('auth.auth.activity_logs.dialog.title') }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ t('auth.auth.activity_logs.dialog.description') }}
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
            <strong>{{ t('auth.auth.activity_logs.dialog.id') }}:</strong> {{ activityLog?.id ?? t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.user') }}:</strong> {{ activityLog?.user_name || t('auth.auth.activity_logs.table.guest') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.user_type') }}:</strong> {{ activityLog?.user_type || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.organization_id') }}:</strong> {{ activityLog?.organization_id ?? t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol cols="12">
            <strong>{{ t('auth.auth.activity_logs.dialog.description_label') }}:</strong> {{ activityLog?.description || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.route') }}:</strong> {{ activityLog?.route || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.method') }}:</strong> {{ activityLog?.method_type || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.status') }}:</strong> {{ activityLog?.status_code ?? t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.ip') }}:</strong> {{ activityLog?.ip_address || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.country') }}:</strong> {{ activityLog?.country || t('auth.auth.activity_logs.table.empty') }}
          </VCol>
          <VCol cols="12">
            <strong>{{ t('auth.auth.activity_logs.dialog.user_agent') }}:</strong>
            <div class="activity-log-detail__block mt-2">
              {{ activityLog?.user_agent || t('auth.auth.activity_logs.table.empty') }}
            </div>
          </VCol>
          <VCol cols="12">
            <strong>{{ t('auth.auth.activity_logs.dialog.request_data') }}:</strong>
            <pre class="activity-log-detail__block mt-2">{{ requestDataDisplay }}</pre>
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.created_at') }}:</strong> {{ formatAuthDateTime(activityLog?.created_at, { fallback: t('auth.auth.activity_logs.table.empty'), includeSeconds: true }) }}
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <strong>{{ t('auth.auth.activity_logs.dialog.updated_at') }}:</strong> {{ formatAuthDateTime(activityLog?.updated_at, { fallback: t('auth.auth.activity_logs.table.empty'), includeSeconds: true }) }}
          </VCol>
        </VRow>

        <div class="d-flex justify-center mt-6">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="closeDialog"
          >
            {{ t('auth.auth.activity_logs.dialog.close') }}
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
