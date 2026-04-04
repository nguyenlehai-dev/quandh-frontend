<script setup>
import { computed } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Object, Array, null],
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <VCol
    :cols="field.cols || 12"
    :md="field.md"
  >
    <VSwitch
      v-if="field.type === 'switch'"
      v-model="model"
      color="success"
      :label="field.label"
      :hint="field.hint"
      :persistent-hint="Boolean(field.hint)"
    />

    <AppTextarea
      v-else-if="field.type === 'textarea'"
      v-model="model"
      :label="field.label"
      :rows="field.rows || 3"
      :placeholder="field.placeholder"
    />

    <AppSelect
      v-else-if="field.type === 'select'"
      v-model="model"
      :label="field.label"
      :items="field.items || []"
      :placeholder="field.placeholder"
    />

    <AppTextField
      v-else
      v-model="model"
      :label="field.label"
      :type="field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'"
      :placeholder="field.placeholder"
    />
  </VCol>
</template>
