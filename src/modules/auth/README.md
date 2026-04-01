# Auth Module Group

Group `auth` chua cac module quan ly he thong lien quan den tai khoan va phan quyen:

- `organizations`
- `user`
- `activity-logs`
- `roles`
- `permissions`
- `system-settings`

Nguyen tac:

- Khong doi route name hay business logic khi refactor cau truc.
- Moi module van giu `index.js`, `router/routes.js`, `router/navigation.js`.
- Dung `shared/moduleFactory.js` de giam lap lai manifest va navigation helper.

Luu y:

- `permissions` khong hien navigation rieng, vi da nam trong menu `roles`.
- Loader ho tro nested modules, nen cac module trong `auth/*` van duoc auto-discovery binh thuong.
