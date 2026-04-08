<script setup>
const { t } = useI18n()

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const inputRefs = ref({})

const regularFields = computed(() => props.group.fields.filter(field => field.type !== 'image'))
const imageFields = computed(() => props.group.fields.filter(field => field.type === 'image'))

const updateFieldValue = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}

const assignInputRef = (key, element) => {
  if (element)
    inputRefs.value[key] = element
}

const openFilePicker = key => {
  inputRefs.value[key]?.click()
}

const readPreviewFile = (event, field) => {
  const file = event?.target?.files?.[0]

  if (!file)
    return

  const reader = new FileReader()

  reader.onload = () => {
    if (typeof reader.result === 'string')
      updateFieldValue(field.key, reader.result)
  }

  reader.readAsDataURL(file)
}

const resetAsset = key => {
  updateFieldValue(key, '')
}

const resolveInputType = field => {
  if (field.type === 'password')
    return 'password'

  if (field.type === 'number')
    return 'number'

  return 'text'
}

const resolveLabel = field => field.labelKey ? t(field.labelKey) : field.label ?? field.key
</script>

<template>
  <div class="d-flex flex-column gap-y-6">
    <VCard>
      <VCardItem>
        <template #title>
          <div class="d-flex align-center gap-x-2">
            <VIcon :icon="group.icon" />
            <span>{{ group.titleKey ? $t(group.titleKey) : group.title }}</span>
          </div>
        </template>
        <template #subtitle>
          {{ group.subtitleKey ? $t(group.subtitleKey) : group.subtitle }}
        </template>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            v-for="field in regularFields"
            :key="field.key"
            cols="12"
            :md="field.cols ?? 12"
          >
            <AppSelect
              v-if="field.type === 'select'"
              :model-value="modelValue[field.key]"
              :label="resolveLabel(field)"
              :items="field.items"
              :loading="isLoading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <div v-else-if="field.type === 'switch'" class="d-flex flex-column gap-y-2">
              <span class="text-body-1 font-weight-medium">{{ resolveLabel(field) }}</span>
              <VSwitch
                :model-value="Boolean(modelValue[field.key])"
                color="primary"
                hide-details
                inset
                @update:model-value="updateFieldValue(field.key, $event)"
              />
            </div>

            <AppTextarea
              v-else-if="field.type === 'textarea'"
              :model-value="modelValue[field.key]"
              :label="resolveLabel(field)"
              :rows="field.rows ?? 3"
              :loading="isLoading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <AppTextField
              v-else
              :model-value="modelValue[field.key]"
              :type="resolveInputType(field)"
              :label="resolveLabel(field)"
              :loading="isLoading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard v-if="imageFields.length">
      <VCardItem>
        <template #title>
          <div class="d-flex align-center gap-x-2">
            <VIcon icon="tabler-photo" />
            <span>{{ $t('settings.image_assets') }}</span>
          </div>
        </template>
      </VCardItem>

      <VCardText class="d-flex flex-column gap-y-6">
        <div
          v-for="field in imageFields"
          :key="field.key"
          class="asset-uploader"
        >
          <div class="d-flex align-center gap-4 flex-wrap">
            <VAvatar
              size="72"
              rounded
              color="primary"
              variant="tonal"
              :image="modelValue[field.key] || undefined"
            />

            <div class="d-flex flex-column gap-y-2">
              <div class="text-body-1 font-weight-medium">
                {{ resolveLabel(field) }}
              </div>

              <div class="d-flex gap-3 flex-wrap">
                <VBtn
                  size="small"
                  color="info"
                  variant="tonal"
                  prepend-icon="tabler-upload"
                  @click="openFilePicker(field.key)"
                >
                  {{ $t('settings.upload_image') }}
                </VBtn>

                <VBtn
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="tabler-refresh"
                  @click="resetAsset(field.key)"
                >
                  {{ $t('settings.reset') }}
                </VBtn>
              </div>

              <div class="text-body-2 text-medium-emphasis">
                {{ field.hint }}
              </div>
            </div>
          </div>

          <input
            :ref="el => assignInputRef(field.key, el)"
            type="file"
            :accept="field.accept"
            hidden
            @input="readPreviewFile($event, field)"
          >
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.asset-uploader {
  padding: 1rem;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 0.75rem;
}
</style>
