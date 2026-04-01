<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const defaultCopyright = `© ${new Date().getFullYear()} Bản quyền thuộc về Sở Nội vụ thành phố Đà Nẵng`
const copyrightText = ref(localStorage.getItem('app_copyright') || defaultCopyright)

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
  <div class="system-footer">
    <div class="footer-text">
      {{ copyrightText }}
    </div>
    <div class="d-md-flex gap-x-6 d-none footer-links">
      <a href="#">Bản quyền</a>
      <a href="#">Chính sách</a>
      <a href="#">Tài liệu</a>
      <a href="#">Hỗ trợ</a>
    </div>
  </div>
</template>

<style scoped>
.system-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding-block: 16px;
  padding-inline: 24px;
}

.footer-text {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

.footer-links a {
  color: #0ea5e9;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.footer-links a:hover {
  opacity: 0.8;
}
</style>
