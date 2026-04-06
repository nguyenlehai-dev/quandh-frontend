<script setup>
import { h, onMounted, onBeforeUnmount, ref } from 'vue'
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { cookieRef } from '@layouts/stores/config'
import { getSupportedLocales, setAppLanguage } from '@/plugins/i18n'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()

import { themeConfig, layoutConfig as initialLayoutConfig } from '@themeConfig'
import { layoutConfig as activeLayoutConfig } from '@layouts'

const applyFavicon = icon => {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  link.href = icon || '/favicon.ico'
}

const applyLogo = logo => {
  const imgNode = h('img', {
    src: logo || '/src/assets/logo.svg',
    style: 'height: 38px; max-width: 100%; object-fit: contain; margin-left: -5px;',
  })

  themeConfig.app.logo = imgNode
  initialLayoutConfig.app.logo = imgNode
  activeLayoutConfig.app.logo = imgNode
}

// Load global logo and favicon dynamically
const loadGlobalSettings = async () => {
  const languageCookie = cookieRef('language', themeConfig.app.i18n.defaultLocale)
  const supportedLocales = getSupportedLocales()

  // 1. Load from localStorage instantly to avoid flicker
  const cachedLogo = localStorage.getItem('app_logo')
  const cachedIcon = localStorage.getItem('app_icon')

  applyFavicon(cachedIcon)

  applyLogo(cachedLogo)

  // 2. Fetch fresh settings in background
  try {
    const res = await $api('/settings/public')
    if (res?.data?.general) {
      const { icon, logo, copyright, designed_by, language } = res.data.general
      
      if (icon && icon !== cachedIcon) {
        localStorage.setItem('app_icon', icon)
        applyFavicon(icon)
      }
      else if (!icon) {
        localStorage.removeItem('app_icon')
        applyFavicon('')
      }
      
      if (logo && logo !== cachedLogo) {
        localStorage.setItem('app_logo', logo)
        applyLogo(logo)
      }
      else if (!logo) {
        localStorage.removeItem('app_logo')
        applyLogo('')
      }

      if (copyright) {
        localStorage.setItem('app_copyright', copyright)
      }
      else {
        localStorage.removeItem('app_copyright')
      }

      if (designed_by) {
        localStorage.setItem('app_designed_by', designed_by)
      }
      else {
        localStorage.removeItem('app_designed_by')
      }

      if (language && supportedLocales.has(language) && languageCookie.value !== language)
        setAppLanguage(language)

      window.dispatchEvent(new CustomEvent('app-settings-updated', {
        detail: {
          icon: icon || '',
          logo: logo || '',
          language: language || languageCookie.value || themeConfig.app.i18n.defaultLocale,
          copyright: copyright || '',
          designed_by: designed_by || '',
        },
      }))
    }
  } catch (err) {
    console.warn('Failed to load global settings', err)
  }
}

const syncAppShellSettings = event => {
  const nextLogo = event?.detail?.logo ?? localStorage.getItem('app_logo') ?? ''
  const nextIcon = event?.detail?.icon ?? localStorage.getItem('app_icon') ?? ''
  const nextLanguage = event?.detail?.language
  const nextDesignedBy = event?.detail?.designed_by

  applyLogo(nextLogo)
  applyFavicon(nextIcon)

  if (nextLanguage)
    setAppLanguage(nextLanguage)

  if (typeof nextDesignedBy === 'string') {
    if (nextDesignedBy)
      localStorage.setItem('app_designed_by', nextDesignedBy)
    else
      localStorage.removeItem('app_designed_by')
  }
}

import {
  fetchMe,
  getOrganizationSessionState,
  isAuthenticated,
} from '@/services/auth'

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

if (isAuthenticated()) {
  if (hasCachedAuthState())
    fetchMe({ force: true })
  else
    fetchMe()
}

const syncPermissionsOnFocus = () => {
  if (document.visibilityState === 'visible') {
    fetchMe({ force: true })
  }
}

onMounted(() => {
  window.addEventListener('focus', syncPermissionsOnFocus)
  document.addEventListener('visibilitychange', syncPermissionsOnFocus)
  window.addEventListener('app-settings-updated', syncAppShellSettings)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', syncPermissionsOnFocus)
  document.removeEventListener('visibilitychange', syncPermissionsOnFocus)
  window.removeEventListener('app-settings-updated', syncAppShellSettings)
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
