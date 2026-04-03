<script setup>
import AuthListToolbarActions from './AuthListToolbarActions.vue'

const props = defineProps({
  dataLabel: { type: String, default: 'Du lieu' },
  createLabel: { type: String, default: '' },
  importLabel: { type: String, default: '' },
  importSubtitle: { type: String, default: '' },
  exportLabel: { type: String, default: '' },
  exportSubtitle: { type: String, default: '' },
  templateLabel: { type: String, default: '' },
  templateSubtitle: { type: String, default: '' },
  importDialogTitle: { type: String, default: '' },
  importHint: { type: String, default: '' },
  selectFileLabel: { type: String, default: '' },
  cancelText: { type: String, default: 'Huy' },
  importText: { type: String, default: 'Nhap du lieu' },
  templateButtonText: { type: String, default: 'Tai file mau' },
  accept: { type: String, default: '.xlsx,.xls,.csv' },
  dialogMaxWidth: { type: [String, Number], default: 500 },
  showImport: { type: Boolean, default: false },
  showExport: { type: Boolean, default: false },
  showTemplate: { type: Boolean, default: false },
  showCreate: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  createColor: { type: String, default: 'primary' },
  templateFile: { type: [String, Blob, Uint8Array, ArrayBuffer], default: null },
  templateFileName: { type: String, default: 'import-template.xlsx' },
  templateMimeType: { type: String, default: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  importHandler: { type: Function, default: null },
  exportHandler: { type: Function, default: null },
  templateHandler: { type: Function, default: null },
  createHandler: { type: Function, default: null },
})

const isImportDialogVisible = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

const canDownloadTemplate = computed(() => props.showTemplate || !!props.templateHandler || !!props.templateFile)
const showTemplateInToolbar = computed(() => canDownloadTemplate.value && !props.showImport)
const showTemplateInDialog = computed(() => canDownloadTemplate.value && props.showImport)
const hasDataActions = computed(() => props.showImport || props.showExport || showTemplateInToolbar.value)

const closeImportDialog = () => {
  isImportDialogVisible.value = false
  importFile.value = null
}

const openImportDialog = () => {
  if (!props.showImport) return

  isImportDialogVisible.value = true
}

const handleExport = () => props.exportHandler?.()
const handleCreate = () => props.createHandler?.()

const downloadTemplateFile = source => {
  if (!source) return

  const anchor = document.createElement('a')

  if (typeof source === 'string') {
    anchor.href = source
  }
  else {
    const blob = source instanceof Blob
      ? source
      : new Blob([source], { type: props.templateMimeType })

    anchor.href = window.URL.createObjectURL(blob)
  }

  anchor.download = props.templateFileName
  document.body.appendChild(anchor)
  anchor.click()
  setTimeout(() => {
    document.body.removeChild(anchor)
    if (typeof source !== 'string')
      window.URL.revokeObjectURL(anchor.href)
  }, 5000)
}

const handleTemplate = async () => {
  if (props.templateHandler) {
    await props.templateHandler()

    return
  }

  if (props.templateFile)
    downloadTemplateFile(props.templateFile)
}

const handleImport = async () => {
  if (!importFile.value || !props.importHandler) return

  isImporting.value = true
  try {
    const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

    await props.importHandler(file)
    closeImportDialog()
  }
  finally {
    isImporting.value = false
  }
}
</script>

<template>
  <AuthListToolbarActions
    :show-data-menu="hasDataActions"
    :show-import="props.showImport"
    :show-export="props.showExport"
    :show-template="showTemplateInToolbar"
    :show-create="props.showCreate"
    :data-label="props.dataLabel"
    :create-label="props.createLabel"
    :import-label="props.importLabel"
    :import-subtitle="props.importSubtitle"
    :export-label="props.exportLabel"
    :export-subtitle="props.exportSubtitle"
    :template-label="props.templateLabel"
    :template-subtitle="props.templateSubtitle"
    :export-loading="props.exportLoading"
    :create-color="props.createColor"
    @import="openImportDialog"
    @export="handleExport"
    @template="handleTemplate"
    @create="handleCreate"
  />

  <VDialog
    v-if="props.showImport"
    v-model="isImportDialogVisible"
    :max-width="props.dialogMaxWidth"
  >
    <VCard :title="props.importDialogTitle">
      <VCardText>
        <div
          v-if="props.importHint"
          class="text-caption mb-5 text-disabled"
        >
          {{ props.importHint }}
        </div>

        <div
          v-if="showTemplateInDialog"
          class="d-flex justify-end mb-4"
        >
          <VBtn
            variant="text"
            color="info"
            prepend-icon="tabler-download"
            @click="handleTemplate"
          >
            {{ props.templateButtonText }}
          </VBtn>
        </div>

        <VFileInput
          v-model="importFile"
          :label="props.selectFileLabel"
          :accept="props.accept"
          prepend-icon="tabler-file-spreadsheet"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="tonal"
          @click="closeImportDialog"
        >
          {{ props.cancelText }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="isImporting"
          :disabled="!importFile"
          @click="handleImport"
        >
          {{ props.importText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
