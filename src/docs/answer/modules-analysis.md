# Frontend Modules Analysis

Tai lieu nay duoc tu dong sinh tu `module.meta.js` trong tung module frontend.

## Nhom business

### Meetings

Path:

- [src/modules/meetings](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings)

Muc dich:

- Quan ly nghiep vu hop khong giay, participant flow, tai lieu, bieu quyet va ket luan.

Chuc nang chinh:

- CRUD cuoc hop
- Quan ly participants, documents, votings, conclusions
- Participant flow my-meetings
- Global lists va danh muc phu tro
- Realtime meeting updates

## Nhom auth

### Organizations

Path:

- [src/modules/auth/organizations](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/organizations)

Muc dich:

- Quan ly cay to chuc va boi canh lam viec theo to chuc.

Chuc nang chinh:

- Danh sach to chuc
- Tree organization
- Tao, sua, xoa to chuc
- Bulk delete va bulk status
- Import/export Excel

### Users

Path:

- [src/modules/auth/user](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user)

Muc dich:

- Quan ly nguoi dung he thong, phan quyen theo to chuc va profile ca nhan.

Chuc nang chinh:

- Danh sach user co filter, search, sort va pagination
- Tao, sua, xoa user
- Bulk delete va bulk status
- Import/export Excel
- Profile tabs: info, trends, activity logs, notifications

### Activity Logs

Path:

- [src/modules/auth/activity-logs](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/activity-logs)

Muc dich:

- Giam sat nhat ky thao tac cua he thong va xuat bao cao audit.

Chuc nang chinh:

- Danh sach nhat ky
- Loc theo route, method, status, thoi gian
- Thong ke tong quan
- Xem chi tiet request
- Xuat file
- Bulk delete
- Xoa theo khoang ngay
- Xoa toan bo

### Roles

Path:

- [src/modules/auth/roles](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/roles)

Muc dich:

- Quan ly vai tro va tap quyen cua tung vai tro trong he thong.

Chuc nang chinh:

- Danh sach role
- Tao, sua, xoa role
- Thong ke role
- Import/export Excel
- Dung chung menu voi permissions

### Permissions

Path:

- [src/modules/auth/permissions](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/permissions)

Muc dich:

- Quan ly danh sach permission va nhom quyen hien thi tren frontend.

Chuc nang chinh:

- Danh sach permission
- Tao, sua, xoa permission
- Tree permission
- Thong ke
- Import/export Excel
- Tu quan ly navigation item cua module permissions

### System Settings

Path:

- [src/modules/auth/system-settings](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/system-settings)

Muc dich:

- Quan ly cau hinh chung, logo, favicon, ngon ngu va thong bao cua he thong.

Chuc nang chinh:

- System dashboard
- General settings
- Notification settings
- Dong bo public settings cho shell app
