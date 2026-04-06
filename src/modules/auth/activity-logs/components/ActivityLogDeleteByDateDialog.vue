<script setup>
import { computed } from 'vue'
const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'update:fromDate',
  'update:toDate',
  'submit',
])

const fromDateModel = computed({
  get: () => props.fromDate,
  set: value => emit('update:fromDate', value),
})

const toDateModel = computed({
  get: () => props.toDate,
  set: value => emit('update:toDate', value),
})
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard class="pa-2 pa-sm-6">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">
          {{ t('auth.auth.activity_logs.delete_by_date_dialog.title') }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ t('auth.auth.activity_logs.delete_by_date_dialog.description') }}
        </p>

        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppDateTimePicker
              v-model="fromDateModel"
              :label="t('auth.auth.activity_logs.toolbar.from_date')"
              placeholder="YYYY-MM-DD"
              :config="{ dateFormat: 'Y-m-d' }"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <AppDateTimePicker
              v-model="toDateModel"
              :label="t('auth.auth.activity_logs.toolbar.to_date')"
              placeholder="YYYY-MM-DD"
              :config="{ dateFormat: 'Y-m-d' }"
            />
          </VCol>
        </VRow>

        <div class="d-flex gap-4 justify-center mt-6">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="emit('update:modelValue', false)"
          >
            {{ t('auth.auth.activity_logs.delete_by_date_dialog.cancel') }}
          </VBtn>
          <VBtn
            color="error"
            :loading="loading"
            @click="emit('submit')"
          >
            {{ t('auth.auth.activity_logs.delete_by_date_dialog.submit') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
