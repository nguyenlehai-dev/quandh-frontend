<template>
  <div class="meeting-system-footer">
    <div class="footer-left">
      <div class="footer-title">
        HỆ THỐNG PHÒNG HỌP KHÔNG GIẤY
      </div>
      <div class="footer-copy">
        Bản quyền thuộc về UBND phường Hòa Cường &middot; &copy; {{ new Date().getFullYear() }}
      </div>
      <div class="footer-dev">
        Phát triển bởi <a
          href="#"
          class="footer-link"
        >Danatec</a>
      </div>
    </div>
    <span class="d-md-flex gap-x-5 d-none footer-links">
      <a href="#">Điều khoản</a>
      <span class="text-disabled">&middot;</span>
      <a href="#">Bảo mật</a>
      <span class="text-disabled">&middot;</span>
      <a href="#">Hỗ trợ</a>
    </span>
  </div>
</template>

<style scoped>
.meeting-system-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.footer-title {
  font-weight: 700;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-copy {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.footer-dev {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.footer-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.footer-links a {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
