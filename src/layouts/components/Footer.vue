<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const defaultCopyright = `© ${new Date().getFullYear()} Bản quyền thuộc về Sở Nội vụ thành phố Đà Nẵng`
const copyrightText = ref(localStorage.getItem('app_copyright') || defaultCopyright)

const footerLinks = [
  { title: 'Hệ thống', href: '#' },
  { title: 'Chính sách', href: '#' },
  { title: 'Tài liệu', href: '#' },
  { title: 'Hỗ trợ', href: '#' },
]

const syncCopyright = event => {
  const nextValue = event?.detail?.copyright

  if (typeof nextValue === 'string')
    copyrightText.value = nextValue || defaultCopyright
  else
    copyrightText.value = localStorage.getItem('app_copyright') || defaultCopyright
}

onMounted(() => {
  window.addEventListener('app-settings-updated', syncCopyright)
})

onBeforeUnmount(() => {
  window.removeEventListener('app-settings-updated', syncCopyright)
})
</script>

<template>
  <VContainer class="system-footer py-4 px-0">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">
      <div class="d-flex align-center min-w-0">
        <span class="footer-text text-body-2">
          {{ copyrightText }}
        </span>
      </div>

      <div class="d-flex flex-wrap align-center gap-x-6 gap-y-2 justify-start justify-md-end">
        <a
          v-for="link in footerLinks"
          :key="link.title"
          :href="link.href"
          class="footer-link text-body-2"
        >
          {{ link.title }}
        </a>
      </div>
    </div>
  </VContainer>
</template>

<style scoped>
.system-footer {
  inline-size: 100%;
}

.footer-text {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-weight: 500;
}

.footer-link {
  color: rgb(var(--v-theme-primary-darken-1));
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.footer-link:hover {
  color: rgb(var(--v-theme-primary-darken-1));
  opacity: 0.72;
}
</style>
