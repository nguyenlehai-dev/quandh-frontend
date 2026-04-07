import { defineStore } from 'pinia'
import { getPublicCoreSettings } from '@/modules/system-settings/services/coreSettings'

export const useCoreSettingsStore = defineStore('coreSettings', {
  state: () => ({
    copyright: '',
    designedBy: '',
    language: 'vi',
    timeFormat: '24h',
    favicon: '',
    logo: '',
    _loaded: false,
  }),

  getters: {
    copyrightText: state => state.copyright || `© ${new Date().getFullYear()}`,
    designedByText: state => state.designedBy || '',
    faviconUrl: state => state.favicon || '/favicon.ico',
    logoUrl: state => state.logo || '',
    isLoaded: state => state._loaded,
  },

  actions: {
    async fetchSettings() {
      try {
        const response = await getPublicCoreSettings()
        const general = response?.data?.general ?? {}

        this.applySettings(general)
        this._loaded = true
      }
      catch {
        // Silently fail — use defaults
      }
    },

    applySettings(data) {
      if (data.copyright !== undefined)
        this.copyright = data.copyright
      if (data.designed_by !== undefined)
        this.designedBy = data.designed_by
      if (data.language !== undefined)
        this.language = data.language
      if (data.time_format !== undefined)
        this.timeFormat = data.time_format
      if (data.icon !== undefined)
        this.favicon = data.icon
      if (data.logo !== undefined)
        this.logo = data.logo
    },

    applyFavicon() {
      if (typeof document === 'undefined')
        return

      const url = this.faviconUrl
      let link = document.querySelector('link[rel="icon"]')

      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }

      link.href = url
    },
  },
})
