import { createI18n } from 'vue-i18n'
import { cookieRef } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'
import enLang from '@/lang/en'
import viLang from '@/lang/vi'

// Legacy: messages tu locales/*.json (navigation items, vuetify labels)
const legacyMessages = Object.fromEntries(Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
  .map(([key, value]) => [key.slice(10, -5), value.default]))

// Deep merge: lang files (module messages) + legacy locales
function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    }
    else {
      result[key] = source[key]
    }
  }

  return result
}

const messages = {
  en: deepMerge(legacyMessages.en || {}, enLang),
  vi: deepMerge(legacyMessages.vi || {}, viLang),
  fr: legacyMessages.fr || {},
  ar: legacyMessages.ar || {},
}

let _i18n = null
export const getI18n = () => {
  if (_i18n === null) {
    _i18n = createI18n({
      legacy: false,
      locale: cookieRef('language', themeConfig.app.i18n.defaultLocale).value,
      fallbackLocale: 'en',
      messages,
      missingWarn: false,
      fallbackWarn: false,
    })
  }

  return _i18n
}
export default function (app) {
  app.use(getI18n())
}
