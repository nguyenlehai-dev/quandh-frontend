<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Xác nhận thao tác',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Xác nhận',
  },
  cancelText: {
    type: String,
    default: 'Hủy',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const updateModelValue = value => {
  emit('update:modelValue', value)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <VDialog
    :model-value="props.modelValue"
    max-width="440"
    @update:model-value="updateModelValue"
  >
    <VCard>
      <VCardItem>
        <template #prepend>
          <VAvatar
            color="warning"
            variant="tonal"
            size="40"
          >
            <VIcon icon="tabler-alert-triangle" />
          </VAvatar>
        </template>
        <VCardTitle>{{ props.title }}</VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        {{ props.message }}
      </VCardText>

      <VCardActions class="px-6 pb-5">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="props.loading"
          @click="updateModelValue(false)"
        >
          {{ props.cancelText }}
        </VBtn>
        <VBtn
          :color="props.confirmColor"
          :loading="props.loading"
          @click="handleConfirm"
        >
          {{ props.confirmText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
