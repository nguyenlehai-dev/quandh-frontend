# FE-BE Mapping

Tai lieu nay mo ta mapping giua frontend `quandh-frontend` va backend `quandh-backend` theo cau truc FE hien tai.

## 1. Tong quan kien truc

Frontend:

```text
src/main.js
-> registerPlugins(app)
-> installModules(app)
-> src/modules/**/services
-> $api(...)
-> /api/*
```

Backend:

```text
routes/api.php
-> app/Modules/*/Routes/*.php
-> Controller
-> Service
-> Model / Resource
```

## 2. Cau truc FE hien tai

Frontend duoc to chuc thanh 2 nhom module chinh:

- `src/modules/auth/*`
  - `organizations`
  - `user`
  - `activity-logs`
  - `roles`
  - `permissions`
  - `system-settings`
- `src/modules/meetings`

Loader dang scan module theo nested path qua [src/modules/_loader.js](/e:/Danatec/Projects/quandh-frontend/src/modules/_loader.js), vi vay `src/modules/auth/*` van duoc auto-discovery binh thuong.

## 3. Mapping module FE -> BE

| Frontend module | FE path | FE API / route chinh | Backend module | Backend route file | Ghi chu |
|---|---|---|---|---|---|
| `organizations` | `src/modules/auth/organizations` | `/organizations`, `system-organizations` | `Core` | `app/Modules/Core/Routes/organization.php` | CRUD, tree, import/export |
| `user` | `src/modules/auth/user` | `/users`, `apps-user-*` | `Core` | `app/Modules/Core/Routes/user.php` | CRUD, bulk status, import/export |
| `activity-logs` | `src/modules/auth/activity-logs` | `/log-activities`, `system-activity-logs` | `Core` | `app/Modules/Core/Routes/log_activity.php` | FE ten module khac API base |
| `roles` | `src/modules/auth/roles` | `/roles`, `apps-roles` | `Core` | `app/Modules/Core/Routes/role.php` | CRUD role, stats, import/export |
| `permissions` | `src/modules/auth/permissions` | `/permissions`, `apps-permissions` | `Core` | `app/Modules/Core/Routes/permission.php` | Quan ly permission |
| `system-settings` | `src/modules/auth/system-settings` | `/settings`, `/settings/public` | `Core` | `app/Modules/Core/Routes/setting.php` | Cau hinh he thong |
| `meetings` | `src/modules/meetings` | `/meetings`, `/my-meetings` | `Meeting` | `app/Modules/Meeting/Routes/meeting.php`, `app/Modules/Meeting/Routes/my_meeting.php` | Module nghiep vu trung tam |
| `meetings` danh muc | `src/modules/meetings` | `/document-types`, `/issuing-agencies`, `/issuing-levels`, `/document-fields`, `/document-signers` | `Document` | `app/Modules/Document/Routes/*.php` | FE gom trong meetings |
| `meetings` tin tuc | `src/modules/meetings` | `/posts`, `/post-categories` | `Post` | `app/Modules/Post/Routes/*.php` | FE gom trong meetings |
| shared auth | `src/services/auth.js` | `/auth/*`, `/user`, `/user/profile` | `Auth` + `Core` | `routes/api.php`, `app/Modules/Auth/Routes/auth.php` | Login, logout, profile, switch org |

## 4. Auth + organization context

Frontend:

- [src/services/auth.js](/e:/Danatec/Projects/quandh-frontend/src/services/auth.js)
- [src/utils/api.js](/e:/Danatec/Projects/quandh-frontend/src/utils/api.js)

Backend:

- `auth:sanctum`
- `set.permissions.team`
- `log.activity`

He qua:

- API protected can co token hop le.
- Nhieu API phu thuoc `X-Organization-Id` de set permission context theo to chuc hien tai.

## 5. Mapping chi tiet nhom auth

### 5.1 Roles

Frontend:

- [src/modules/auth/roles/views/RolesPageMain.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/roles/views/RolesPageMain.vue)
- [src/modules/auth/roles/services/roleService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/roles/services/roleService.js)

Backend:

- `app/Modules/Core/Routes/role.php`
- `app/Modules/Core/RoleController.php`
- `app/Modules/Core/Services/RoleService.php`

| Frontend call | Backend endpoint | Muc dich |
|---|---|---|
| `fetchRoles(params)` | `GET /roles` | Danh sach role |
| `fetchRole(id)` | `GET /roles/{role}` | Chi tiet role |
| `createRole(data)` | `POST /roles` | Tao role |
| `updateRole(id, data)` | `PUT /roles/{role}` | Cap nhat role |
| `deleteRole(id)` | `DELETE /roles/{role}` | Xoa role |
| `bulkDeleteRoles(ids)` | `POST /roles/bulk-delete` | Xoa hang loat |
| `fetchRoleStats(params)` | `GET /roles/stats` | Thong ke |
| `exportRoles(params)` | `GET /roles/export` | Xuat Excel |
| `downloadRoleTemplate()` | `GET /roles/template` | Tai file mau |
| `importRoles(file)` | `POST /roles/import` | Nhap Excel |

### 5.2 Permissions

Frontend:

- [src/modules/auth/permissions/views/PermissionsPage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/permissions/views/PermissionsPage.vue)
- [src/modules/auth/permissions/services/permissionService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/permissions/services/permissionService.js)

Backend:

- `app/Modules/Core/Routes/permission.php`

### 5.3 Users

Frontend:

- [src/modules/auth/user/views/UserListPage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user/views/UserListPage.vue)
- [src/modules/auth/user/views/UserEditPage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user/views/UserEditPage.vue)
- [src/modules/auth/user/views/ProfilePage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user/views/ProfilePage.vue)
- [src/modules/auth/user/services/userService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user/services/userService.js)

Backend:

- `app/Modules/Core/Routes/user.php`

### 5.4 Organizations

Frontend:

- [src/modules/auth/organizations/views/OrganizationListPage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/organizations/views/OrganizationListPage.vue)
- [src/modules/auth/organizations/services/organizationService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/organizations/services/organizationService.js)

Backend:

- `app/Modules/Core/Routes/organization.php`

### 5.5 Activity Logs

Frontend:

- [src/modules/auth/activity-logs/views/ActivityLogListPage.vue](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/activity-logs/views/ActivityLogListPage.vue)
- [src/modules/auth/activity-logs/services/activityLogService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/activity-logs/services/activityLogService.js)

Backend:

- `app/Modules/Core/Routes/log_activity.php`

## 6. Mapping chi tiet module meetings

Frontend:

- [src/modules/meetings/router/routes.js](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings/router/routes.js)
- [src/modules/meetings/router/navigation.js](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings/router/navigation.js)
- [src/modules/meetings/services/meetingService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings/services/meetingService.js)
- [src/modules/meetings/stores/useMeetingStore.js](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings/stores/useMeetingStore.js)

Backend:

- `app/Modules/Meeting/Routes/meeting.php`
- `app/Modules/Meeting/Routes/my_meeting.php`

### 6.1 Cuoc hop

| Frontend call | Backend endpoint |
|---|---|
| `fetchMeetings(params)` | `GET /meetings` |
| `fetchMeeting(id)` | `GET /meetings/{meeting}` |
| `createMeeting(data)` | `POST /meetings` |
| `updateMeeting(id, data)` | `PUT /meetings/{meeting}` |
| `deleteMeeting(id)` | `DELETE /meetings/{meeting}` |
| `changeMeetingStatus(id, status)` | `PATCH /meetings/{meeting}/status` |
| `exportMeetings(params)` | `GET /meetings/export` |
| `fetchMyCalendar(params)` | `GET /meetings/my-calendar` |

### 6.2 Dai bieu

| Frontend call | Backend endpoint |
|---|---|
| `fetchMyMeetings(params)` | `GET /my-meetings` |
| `fetchMyMeeting(id)` | `GET /my-meetings/{meeting}` |
| `fetchMyMeetingInfo(id)` | `GET /my-meetings/{meeting}/my-info` |

### 6.3 Global lists

| Frontend page / service | Backend endpoint |
|---|---|
| `VotesListPage.vue` | `GET /meetings/all-votings` |
| `DocumentsListPage.vue` | `GET /meetings/all-documents` |
| `ConclusionsListPage.vue` | `GET /meetings/all-conclusions` |
| `AttendeesListPage.vue` | `GET /meetings/all-participants` |

## 7. Ghi chu kien truc

- Group `auth` chi la nhom to chuc FE, khong doi route name hay API contract.
- `permissions` khong hien navigation rieng vi nam trong menu `roles`.
- Shared helpers cho nhom `auth` nam o:
  - [src/modules/auth/shared/moduleFactory.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/moduleFactory.js)
  - [src/modules/auth/shared/crudServiceFactory.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/crudServiceFactory.js)
  - [src/modules/auth/shared/config.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/config.js)

## 8. Diem can dong bo

- Naming permission giua FE config va BE middleware chua thong nhat hoan toan.
- `roles` va `user` van con mot so man hinh goi API truc tiep trong view thay vi di qua store/composable.
- `meetings` van la module lon nhat va co kha nang can tach them shared sub-domain trong tuong lai.
