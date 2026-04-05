<script setup>
import AppSelect from './app-form-elements/AppSelect.vue'

const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100],
  },
})

const emit = defineEmits(['update:page', 'update:itemsPerPage'])
const { locale } = useI18n({ useScope: 'global' })

const updatePage = value => {
  emit('update:page', value)
}

const updateItemsPerPage = value => {
  emit('update:itemsPerPage', Number(value))
}

const paginationText = computed(() => {
  const start = props.totalItems === 0 ? 0 : (props.page - 1) * props.itemsPerPage + 1
  const end = Math.min(props.page * props.itemsPerPage, props.totalItems)

  if (locale.value === 'vi')
    return `Hiển thị từ ${start} đến ${end} trong tổng số ${props.totalItems}`

  return `Showing ${start} to ${end} of ${props.totalItems} entries`
})
</script>

<template>
  <div>
    <VDivider />

    <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 px-6 py-3">
      <AppSelect
        :model-value="itemsPerPage"
        :items="itemsPerPageOptions"
        style="min-inline-size: 5.5rem; max-inline-size: 5.5rem;"
        @update:model-value="updateItemsPerPage"
      />

      <div class="d-flex align-center justify-sm-end justify-center flex-wrap gap-3">
        <p class="text-disabled mb-0">
          {{ paginationText }}
        </p>

        <VPagination
          :model-value="page"
          active-color="primary"
          :length="Math.ceil(totalItems / itemsPerPage)"
          :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.ceil(totalItems / itemsPerPage), 5)"
          @update:model-value="updatePage"
        />
      </div>
    </div>
  </div>
</template>
