<script setup>
import { getVerticalNavItems } from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavSearchBar from '@/layouts/components/NavSearchBar.vue'
import NavbarShortcuts from '@/layouts/components/NavbarShortcuts.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import OrgSwitcher from '@/layouts/components/OrgSwitcher.vue'
import NavBarI18n from '@core/components/I18n.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const navItems = computed(() => getVerticalNavItems())
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="app-navbar-row d-flex align-center w-100">
        <div class="app-navbar-main d-flex align-center flex-grow-1 gap-x-3">
          <IconBtn
            id="vertical-nav-toggle-btn"
            class="ms-n3 d-lg-none"
            @click="toggleVerticalOverlayNavActive(true)"
          >
            <VIcon
              size="26"
              icon="tabler-menu-2"
            />
          </IconBtn>

          <RouterLink
            to="/"
            class="app-navbar-brand d-flex align-center gap-x-3 text-disabled d-lg-none"
          >
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="app-title font-weight-semibold text-h6 mb-0">
              {{ themeConfig.app.title }}
            </h1>
          </RouterLink>

          <NavSearchBar class="app-navbar-search ms-0" />
        </div>

        <div class="app-navbar-actions d-flex align-center justify-end">
          <OrgSwitcher class="app-navbar-org-switcher" />

          <div class="d-flex align-center justify-end gap-1">
            <div class="d-none d-sm-flex align-center">
              <NavBarI18n
                v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
                :languages="themeConfig.app.i18n.langConfig"
              />
            </div>
            <div class="d-none d-sm-flex align-center">
              <NavbarThemeSwitcher />
            </div>
            <div class="d-none d-md-flex align-center">
              <NavbarShortcuts />
            </div>
            <div class="d-flex align-center">
              <NavBarNotifications class="me-1" />
            </div>
            <div class="d-flex align-center">
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
      display: flex;
      align-items: center;
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

.app-navbar-brand {
  min-inline-size: 0;
  text-decoration: none;

  :deep(img) {
    block-size: 2rem;
    inline-size: auto;
    object-fit: contain;
  }
}

.app-title {
  overflow: hidden;
  max-inline-size: 12rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-navbar-row {
  align-items: center;
  block-size: 100%;
  gap: 1rem;
  flex-wrap: nowrap;
}

.app-navbar-main {
  align-items: center;
  block-size: 100%;
  min-inline-size: 0;
  flex: 1 1 auto;
}

.app-navbar-search {
  flex: 1 1 26rem;
  max-inline-size: 26rem;
  min-inline-size: 0;
}

.app-navbar-actions {
  align-items: center;
  align-self: center;
  block-size: 100%;
  flex: 0 0 auto;
  min-inline-size: max-content;
  gap: 0.5rem;
}

.app-navbar-org-switcher {
  min-inline-size: 16rem;
}

@media (max-width: 959px) {
  .app-navbar-row {
    flex-wrap: wrap;
  }

  .app-navbar-main,
  .app-navbar-actions {
    flex: 1 1 100%;
  }

  .app-navbar-actions {
    min-inline-size: 0;
  }

  .app-navbar-org-switcher {
    display: none;
  }
}

@media (max-width: 599px) {
  .app-navbar-search {
    flex-basis: 100%;
    max-inline-size: 100%;
  }

  .app-navbar-actions {
    justify-content: flex-end;
  }
}
</style>
