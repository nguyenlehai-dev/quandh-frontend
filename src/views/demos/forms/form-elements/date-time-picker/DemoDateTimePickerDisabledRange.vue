<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Disabled Range',
  },
  placeholder: {
    type: String,
    default: 'Select date',
  },
  disabledRanges: {
    type: Array,
    default: () => {
      const now = new Date()
      const currentMonth = now.toLocaleString('default', { month: '2-digit' })
      const currentYear = now.getFullYear()

      return [{ from: `${currentYear}-${currentMonth}-20`, to: `${currentYear}-${currentMonth}-25` }]
    },
  },
})

const emit = defineEmits(['update:modelValue'])

const date = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <AppDateTimePicker
    v-model="date"
    :label="props.label"
    :placeholder="props.placeholder"
    :config="{ dateFormat: 'Y-m-d', disable: props.disabledRanges }"
  />
</template>
