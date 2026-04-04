import { onMounted, ref } from 'vue'
import { useActionFeedback } from '@/composables/useActionFeedback'
import { fetchSystemSettings, normalizeSettingGroups, updateSystemSettings } from '../services/systemSettingService'

const getFields = config => config.sections.flatMap(section => section.fields || [])

const getInitialValue = field => {
  if (field.defaultValue !== undefined)
    return field.defaultValue

  return field.type === 'switch' ? false : ''
}

const formatIncomingValue = (value, field) => {
  if (value === undefined)
    return getInitialValue(field)

  if (field.transform === 'json')
    return value ? JSON.stringify(value, null, 2) : ''

  return value ?? getInitialValue(field)
}

const normalizeOutgoingValue = (value, field) => {
  if (field.transform === 'json') {
    if (!value?.trim())
      return null

    try {
      return JSON.parse(value)
    }
    catch {
      throw new Error('invalid_json')
    }
  }

  if (field.transform === 'number')
    return value === '' || value === null || value === undefined ? 0 : Number(value)

  if (field.transform === 'boolean')
    return Boolean(value)

  if (field.transform === 'string')
    return value ?? ''

  return value === '' ? null : value
}

export function useSystemSettingsPage(config, options = {}) {
  const {
    afterSave,
  } = options

  const { snackbar, showSuccess, showError } = useActionFeedback()
  const loading = ref(false)
  const saving = ref(false)

  const fields = getFields(config)
  const settings = ref(Object.fromEntries(fields.map(field => [field.key, getInitialValue(field)])))

  const hydrate = groups => {
    const nextState = { ...settings.value }

    fields.forEach(field => {
      const groupData = groups?.[field.group] || {}
      if (Object.hasOwn(groupData, field.key))
        nextState[field.key] = formatIncomingValue(groupData[field.key], field)
    })

    settings.value = nextState
  }

  const fetchSettings = async () => {
    loading.value = true

    try {
      hydrate(normalizeSettingGroups(await fetchSystemSettings()))
    }
    catch (error) {
      console.error(`Fetch settings error for ${config.title}:`, error)
      showError(error, config.loadErrorMessage)
    }
    finally {
      loading.value = false
    }
  }

  const saveSettings = async () => {
    saving.value = true

    try {
      const payload = Object.fromEntries(fields.map(field => [field.key, normalizeOutgoingValue(settings.value[field.key], field)]))
      const groups = normalizeSettingGroups(await updateSystemSettings(payload))

      hydrate(groups)

      if (typeof afterSave === 'function')
        await afterSave({ settings: settings.value, groups })

      showSuccess(config.saveSuccessMessage)
    }
    catch (error) {
      console.error(`Save settings error for ${config.title}:`, error)

      if (error?.message === 'invalid_json')
        showError(error, 'JSON cấu hình không hợp lệ.')
      else
        showError(error, config.saveErrorMessage)
    }
    finally {
      saving.value = false
    }
  }

  onMounted(fetchSettings)

  return {
    snackbar,
    settings,
    loading,
    saving,
    fetchSettings,
    saveSettings,
  }
}
