<script setup>
import navItems from '@/navigation/vertical'
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

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div
        class="d-flex h-100 align-center w-100 gap-4"
      >
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

        <NavSearchBar class="ms-0" />

        <VSpacer />

        <div class="d-flex h-100 align-center" style="gap: 4px;">
          <OrgSwitcher />

          <NavBarI18n
            v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
            :languages="themeConfig.app.i18n.langConfig"
          />
          <NavbarThemeSwitcher />
          <NavbarShortcuts />
          <NavBarNotifications class="me-1" />
          <UserProfile />
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
</style>
