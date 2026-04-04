<script setup>
import SystemSettingsFieldRenderer from './SystemSettingsFieldRenderer.vue'

defineProps({
  config: {
    type: Object,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'updateField'])
</script>

<template>
  <VCard :loading="loading">
    <VCardItem>
      <template #prepend>
        <VIcon
          :icon="config.icon"
          size="30"
          :color="config.color"
          class="me-2"
        />
      </template>
      <VCardTitle class="text-h5">
        {{ config.title }}
      </VCardTitle>
      <VCardSubtitle>
        {{ config.subtitle }}
      </VCardSubtitle>
      <template #append>
        <VBtn
          :color="config.color"
          variant="outlined"
          prepend-icon="tabler-device-floppy"
          :loading="saving"
          @click="$emit('save')"
        >
          {{ config.saveLabel }}
        </VBtn>
      </template>
    </VCardItem>

    <VCardText>
      <template
        v-for="(section, index) in config.sections"
        :key="section.title || index"
      >
        <VDivider
          v-if="index > 0"
          class="my-6"
        />

        <VRow>
          <VCol
            v-if="section.title"
            cols="12"
          >
            <h6 class="text-h6 mb-3">
              {{ section.title }}
            </h6>
          </VCol>

          <SystemSettingsFieldRenderer
            v-for="field in section.fields"
            :key="field.key"
            :field="field"
            :model-value="settings[field.key]"
            @update:model-value="value => emit('updateField', { key: field.key, value })"
          />
        </VRow>
      </template>

      <VAlert
        v-if="config.notice"
        type="info"
        variant="tonal"
        class="mt-6"
      >
        {{ config.notice }}
      </VAlert>

      <slot />
    </VCardText>
  </VCard>
</template>
