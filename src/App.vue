<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { cookieRef } from '@layouts/stores/config'
import { getI18n } from '@/plugins/i18n'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()

import { themeConfig, layoutConfig as initialLayoutConfig } from '@themeConfig'
import { layoutConfig as activeLayoutConfig } from '@layouts'

// Load global logo and favicon dynamically
const loadGlobalSettings = async () => {
  const languageCookie = cookieRef('language', themeConfig.app.i18n.defaultLocale)
  const supportedLocales = new Set(themeConfig.app.i18n.langConfig.map(lang => lang.i18nLang))

  // 1. Load from localStorage instantly to avoid flicker
  const cachedLogo = localStorage.getItem('app_logo')
  const cachedIcon = localStorage.getItem('app_icon')

  if (cachedIcon) {
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = cachedIcon
  }

  if (cachedLogo) {
    const imgNode = h('img', { 
      src: cachedLogo, 
      style: 'height: 38px; max-width: 100%; object-fit: contain; margin-left: -5px;', 
    })

    themeConfig.app.logo = imgNode
    initialLayoutConfig.app.logo = imgNode
    activeLayoutConfig.app.logo = imgNode
  }

  // 2. Fetch fresh settings in background
  try {
    const res = await $api('/settings/public')
    if (res?.data?.general) {
      const { icon, logo, copyright, language } = res.data.general
      
      if (icon && icon !== cachedIcon) {
        localStorage.setItem('app_icon', icon)
        let link = document.querySelector("link[rel~='icon']")
        if (link) link.href = icon
      }
      
      if (logo && logo !== cachedLogo) {
        localStorage.setItem('app_logo', logo)

        const imgNode = h('img', { 
          src: logo, 
          style: 'height: 38px; max-width: 100%; object-fit: contain; margin-left: -5px;', 
        })

        themeConfig.app.logo = imgNode
        initialLayoutConfig.app.logo = imgNode
        activeLayoutConfig.app.logo = imgNode
      }

      if (copyright) {
        localStorage.setItem('app_copyright', copyright)
      }
      else {
        localStorage.removeItem('app_copyright')
      }

      if (language && supportedLocales.has(language) && languageCookie.value !== language) {
        languageCookie.value = language
        getI18n().global.locale.value = language
      }
    }
  } catch (err) {
    console.warn('Failed to load global settings', err)
  }
}

import { fetchMe, getOrganizationSessionState } from '@/services/auth'

loadGlobalSettings()

const hasCachedAuthState = () => {
  const { hasValidCurrentOrganization } = getOrganizationSessionState()

  return Boolean(
    useCookie('accessToken').value
    && hasValidCurrentOrganization
    && useCookie('userData').value
    && localStorage.getItem('userAbilityRules'),
  )
}

if (!hasCachedAuthState())
  fetchMe()

const syncPermissionsOnFocus = () => {
  if (document.visibilityState === 'visible') {
    fetchMe({ force: true })
  }
}

onMounted(() => {
  window.addEventListener('focus', syncPermissionsOnFocus)
  document.addEventListener('visibilitychange', syncPermissionsOnFocus)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', syncPermissionsOnFocus)
  document.removeEventListener('visibilitychange', syncPermissionsOnFocus)
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView :key="useCookie('currentOrganizationId').value || 'default'" />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
