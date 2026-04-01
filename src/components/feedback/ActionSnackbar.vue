<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'success',
  },
  timeout: {
    type: Number,
    default: 3200,
  },
})

const emit = defineEmits(['update:modelValue'])

const updateModelValue = value => {
  emit('update:modelValue', value)
}
</script>

<template>
  <VSnackbar
    :model-value="props.modelValue"
    :color="props.color"
    :timeout="props.timeout"
    location="top right"
    @update:model-value="updateModelValue"
  >
    {{ props.message }}

    <template #actions>
      <VBtn
        icon
        variant="text"
        color="white"
        @click="updateModelValue(false)"
      >
        <VIcon icon="tabler-x" />
      </VBtn>
    </template>
  </VSnackbar>
</template>
