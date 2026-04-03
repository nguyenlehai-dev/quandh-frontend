<script setup>
import { getVerticalNavItems } from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import MobileNavUserPanel from '@/layouts/components/MobileNavUserPanel.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavSearchBar from '@/layouts/components/NavSearchBar.vue'
import NavbarShortcuts from '@/layouts/components/NavbarShortcuts.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import OrgSwitcher from '@/layouts/components/OrgSwitcher.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const navItems = computed(() => getVerticalNavItems())
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <template #before-vertical-nav-items>
      <MobileNavUserPanel section="header" />
    </template>

    <template #after-vertical-nav-items>
      <MobileNavUserPanel section="footer" />
    </template>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="app-navbar-shell">
        <div class="app-navbar-shell__primary">
          <IconBtn
            id="vertical-nav-toggle-btn"
            class="app-navbar-shell__toggle ms-n3 d-lg-none"
            @click="toggleVerticalOverlayNavActive(true)"
          >
            <VIcon
              size="26"
              icon="tabler-menu-2"
            />
          </IconBtn>

          <NavSearchBar class="app-navbar-shell__search ms-0" />
        </div>

        <div class="app-navbar-shell__secondary">
          <OrgSwitcher class="app-navbar-shell__org-switcher" />

          <div class="app-navbar-shell__actions">
            <div class="app-navbar-shell__action app-navbar-shell__action--i18n">
              <NavBarI18n
                v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
                :languages="themeConfig.app.i18n.langConfig"
              />
            </div>
            <div class="app-navbar-shell__action app-navbar-shell__action--theme">
              <NavbarThemeSwitcher />
            </div>
            <div class="app-navbar-shell__action app-navbar-shell__action--shortcuts">
              <NavbarShortcuts />
            </div>
            <div class="app-navbar-shell__action app-navbar-shell__action--notifications">
              <NavBarNotifications class="me-1" />
            </div>
            <div class="app-navbar-shell__action app-navbar-shell__action--profile">
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </VerticalNavLayout>
</template>

<style lang="scss">
/* Clean government-style navbar — no gradient, white/surface background */
.layout-wrapper.layout-nav-type-vertical {
  .layout-navbar {
    margin-block-start: 0 !important;
    max-inline-size: 100% !important;

    &.navbar-blur::after {
      display: none !important;
    }

    .navbar-content-container {
      background: rgb(var(--v-theme-surface)) !important;
      border-radius: 0 !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
      border-block-end: 1px solid rgba(0, 0, 0, 0.06) !important;
      max-inline-size: 100% !important;
    }
  }

  .layout-footer {
    max-inline-size: 100% !important;
  }
}

.app-navbar-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  inline-size: 100%;
  min-inline-size: 0;
  padding-block: 0.125rem;
}

.app-navbar-shell__primary,
.app-navbar-shell__secondary,
.app-navbar-shell__actions {
  display: flex;
  align-items: center;
  min-inline-size: 0;
}

.app-navbar-shell__primary {
  flex: 1 1 auto;
  gap: 0.75rem;
}

.app-navbar-shell__search {
  flex: 1 1 auto;
  min-inline-size: 0;
}

.app-navbar-shell__secondary {
  flex: 0 1 auto;
  justify-content: flex-end;
  gap: 0.5rem;
}

.app-navbar-shell__actions {
  flex-wrap: nowrap;
  gap: 0.25rem;
}

.app-navbar-shell__action {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 959px) {
  .app-navbar-shell {
    align-items: stretch;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .app-navbar-shell__primary,
  .app-navbar-shell__secondary {
    flex: 1 1 100%;
    justify-content: space-between;
  }

  .app-navbar-shell__secondary {
    gap: 0.75rem;
  }

  .app-navbar-shell__org-switcher {
    display: none;
  }
}

@media (max-width: 600px) {
  .app-navbar-shell {
    gap: 0.75rem;
    padding-block: 0.25rem;
  }

  .app-navbar-shell__primary {
    gap: 0.5rem;
  }

  .app-navbar-shell__secondary {
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .app-navbar-shell__org-switcher {
    flex: 1 1 100%;
    min-inline-size: 0;
  }

  .app-navbar-shell__actions {
    inline-size: 100%;
    justify-content: flex-end;
    gap: 0.125rem;
  }

  .app-navbar-shell__action--i18n,
  .app-navbar-shell__action--theme,
  .app-navbar-shell__action--shortcuts,
  .app-navbar-shell__action--profile {
    display: none;
  }

  .app-navbar-shell__action--notifications {
    margin-inline-start: auto;
  }
}
</style>
