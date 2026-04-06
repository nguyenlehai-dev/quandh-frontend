<script setup>
const props = defineProps({
  dataLabel: { type: String, default: 'Du lieu' },
  createLabel: { type: String, default: '' },
  importLabel: { type: String, default: '' },
  importSubtitle: { type: String, default: '' },
  exportLabel: { type: String, default: '' },
  exportSubtitle: { type: String, default: '' },
  templateLabel: { type: String, default: '' },
  templateSubtitle: { type: String, default: '' },
  showDataMenu: { type: Boolean, default: false },
  showImport: { type: Boolean, default: false },
  showExport: { type: Boolean, default: false },
  showTemplate: { type: Boolean, default: false },
  showCreate: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  createColor: { type: String, default: 'primary' },
})

const emit = defineEmits(['import', 'export', 'template', 'create'])
</script>

<template>
  <div class="auth-list-toolbar-actions">
    <VMenu v-if="props.showDataMenu && (props.showImport || props.showExport || props.showTemplate)">
      <template #activator="{ props: menuProps }">
        <VBtn
          v-bind="menuProps"
          class="auth-list-toolbar-actions__button"
          variant="outlined"
          color="info"
          prepend-icon="tabler-database"
          append-icon="tabler-chevron-down"
        >
          {{ props.dataLabel }}
        </VBtn>
      </template>

      <VList min-width="220">
        <VListItem
          v-if="props.showImport"
          prepend-icon="tabler-cloud-upload"
          @click="emit('import')"
        >
          <VListItemTitle>{{ props.importLabel }}</VListItemTitle>
          <VListItemSubtitle v-if="props.importSubtitle">
            {{ props.importSubtitle }}
          </VListItemSubtitle>
        </VListItem>

        <VListItem
          v-if="props.showTemplate"
          prepend-icon="tabler-file-download"
          @click="emit('template')"
        >
          <VListItemTitle>{{ props.templateLabel }}</VListItemTitle>
          <VListItemSubtitle v-if="props.templateSubtitle">
            {{ props.templateSubtitle }}
          </VListItemSubtitle>
        </VListItem>

        <VListItem
          v-if="props.showExport"
          prepend-icon="tabler-file-export"
          :disabled="props.exportLoading"
          @click="emit('export')"
        >
          <VListItemTitle>{{ props.exportLabel }}</VListItemTitle>
          <VListItemSubtitle v-if="props.exportSubtitle">
            {{ props.exportSubtitle }}
          </VListItemSubtitle>
        </VListItem>
      </VList>
    </VMenu>

    <VBtn
      v-if="props.showCreate"
      class="auth-list-toolbar-actions__button"
      :color="props.createColor"
      prepend-icon="tabler-plus"
      @click="emit('create')"
    >
      {{ props.createLabel }}
    </VBtn>
  </div>
</template>

<style scoped>
.auth-list-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.auth-list-toolbar-actions__button {
  min-inline-size: 164px;
}

@media (max-width: 959px) {
  .auth-list-toolbar-actions {
    justify-content: stretch;
    inline-size: 100%;
    margin-block-start: 12px;
  }
}

@media (max-width: 600px) {
  .auth-list-toolbar-actions {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    inline-size: 100%;
  }

  .auth-list-toolbar-actions__button {
    min-inline-size: 0;
  }

  .auth-list-toolbar-actions :deep(.v-btn) {
    justify-content: center;
    inline-size: 100%;
  }
}
</style>
