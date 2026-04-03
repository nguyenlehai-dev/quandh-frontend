# Frontend Modules API

Tai lieu nay duoc tu dong sinh tu `module.meta.js` trong tung module frontend.

Base URL:

- `VITE_API_BASE_URL`
- mac dinh: `/api`

## Meetings

Path: `src/modules/meetings`

Services:

- [src/modules/meetings/services/meetingService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/meetings/services/meetingService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/meetings/stats` | `fetchMeetingsOverview` | Thong ke meeting dashboard |
| GET | `/meetings/export` | `exportMeetings` | Xuat danh sach cuoc hop |
| POST | `/meetings/import` | `importMeetings` | Nhap danh sach cuoc hop |
| GET | `/meetings` | `fetchMeetings` | Danh sach cuoc hop |
| GET | `/meetings/:id` | `fetchMeeting` | Chi tiet cuoc hop |
| POST | `/meetings` | `createMeeting` | Tao cuoc hop |
| PUT | `/meetings/:id` | `updateMeeting` | Cap nhat cuoc hop |
| DELETE | `/meetings/:id` | `deleteMeeting` | Xoa cuoc hop |
| PATCH | `/meetings/:id/status` | `changeMeetingStatus` | Doi trang thai cuoc hop |
| GET | `/meetings/meeting-types` | `fetchMeetingTypes` | Danh muc loai cuoc hop |
| GET | `/meetings/attendee-groups` | `fetchAttendeeGroups` | Danh muc nhom thanh phan tham du |
| GET | `/meetings/meeting-document-types` | `fetchDocumentTypes` | Danh muc loai tai lieu meeting |
| GET | `/meetings/meeting-document-fields` | `fetchDocumentFields` | Danh muc linh vuc tai lieu meeting |
| GET | `/my-meetings` | `fetchMyMeetings` | Danh sach cuoc hop cua toi |
| GET | `/meetings/all-votings` | `fetchVotes` | Danh sach bieu quyet toan he thong |
| GET | `/meetings/all-documents` | `fetchDocuments` | Danh sach tai lieu toan he thong |
| GET | `/meetings/all-conclusions` | `fetchConclusions` | Danh sach ket luan toan he thong |
| GET | `/meetings/all-participants` | `fetchAttendees` | Danh sach nguoi tham gia toan he thong |

## Organizations

Path: `src/modules/auth/organizations`

Services:

- [src/modules/auth/organizations/services/organizationService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/organizations/services/organizationService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/organizations` | `fetchOrganizations` | Danh sach to chuc |
| GET | `/organizations/:id` | `fetchOrganization` | Chi tiet to chuc |
| POST | `/organizations` | `createOrganization` | Tao to chuc |
| PUT | `/organizations/:id` | `updateOrganization` | Cap nhat to chuc |
| DELETE | `/organizations/:id` | `deleteOrganization` | Xoa to chuc |
| PATCH | `/organizations/:id/status` | `changeOrganizationStatus` | Doi trang thai |
| GET | `/organizations/tree` | `fetchOrganizationTree` | Cay to chuc |
| POST | `/organizations/bulk-delete` | `bulkDeleteOrganizations` | Xoa hang loat |
| PATCH | `/organizations/bulk-status` | `bulkUpdateOrganizationStatus` | Cap nhat trang thai hang loat |
| GET | `/organizations/stats` | `fetchOrganizationStats` | Thong ke to chuc |
| GET | `/organizations/export` | `exportOrganizations` | Xuat Excel |
| GET | `/organizations/template` | `downloadOrganizationTemplate` | Tai file mau |
| POST | `/organizations/import` | `importOrganizations` | Nhap Excel |

## Users

Path: `src/modules/auth/user`

Services:

- [src/modules/auth/user/services/userService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/user/services/userService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/users` | `fetchUsers` | Danh sach user |
| GET | `/users/:id` | `fetchUser` | Chi tiet user |
| POST | `/users` | `createUser` | Tao user |
| PUT | `/users/:id` | `updateUser` | Cap nhat user |
| DELETE | `/users/:id` | `deleteUser` | Xoa user |
| PATCH | `/users/:id/status` | `changeUserStatus` | Doi trang thai user |
| POST | `/users/bulk-delete` | `bulkDeleteUsers` | Xoa hang loat |
| PATCH | `/users/bulk-status` | `bulkUpdateUserStatus` | Cap nhat trang thai hang loat |
| GET | `/users/stats` | `fetchUserStats` | Thong ke user |
| GET | `/users/export` | `exportUsers` | Xuat Excel |
| GET | `/users/template` | `downloadUserTemplate` | Tai file mau |
| POST | `/users/import` | `importUsers` | Nhap Excel |

## Activity Logs

Path: `src/modules/auth/activity-logs`

Services:

- [src/modules/auth/activity-logs/services/activityLogService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/activity-logs/services/activityLogService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/log-activities` | `fetchActivityLogs` | Danh sach nhat ky |
| GET | `/log-activities/stats` | `fetchActivityLogStats` | Thong ke nhat ky |
| GET | `/log-activities/export` | `exportActivityLogs` | Xuat danh sach nhat ky |
| POST | `/log-activities/bulk-delete` | `bulkDeleteActivityLogs` | Xoa hang loat nhat ky |

## Roles

Path: `src/modules/auth/roles`

Services:

- [src/modules/auth/roles/services/roleService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/roles/services/roleService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/roles` | `fetchRoles` | Danh sach role |
| GET | `/roles/:id` | `fetchRole` | Chi tiet role |
| POST | `/roles` | `createRole` | Tao role |
| PUT | `/roles/:id` | `updateRole` | Cap nhat role |
| DELETE | `/roles/:id` | `deleteRole` | Xoa role |
| POST | `/roles/bulk-delete` | `bulkDeleteRoles` | Xoa hang loat |
| GET | `/roles/stats` | `fetchRoleStats` | Thong ke role |
| GET | `/roles/export` | `exportRoles` | Xuat Excel |
| GET | `/roles/template` | `downloadRoleTemplate` | Tai file mau |
| POST | `/roles/import` | `importRoles` | Nhap Excel |

## Permissions

Path: `src/modules/auth/permissions`

Services:

- [src/modules/auth/permissions/services/permissionService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/permissions/services/permissionService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/permissions` | `fetchPermissions` | Danh sach permission |
| GET | `/permissions/:id` | `fetchPermission` | Chi tiet permission |
| POST | `/permissions` | `createPermission` | Tao permission |
| PUT | `/permissions/:id` | `updatePermission` | Cap nhat permission |
| DELETE | `/permissions/:id` | `deletePermission` | Xoa permission |
| GET | `/permissions/tree` | `fetchPermissionTree` | Cay permission |
| POST | `/permissions/bulk-delete` | `bulkDeletePermissions` | Xoa hang loat |
| GET | `/permissions/stats` | `fetchPermissionStats` | Thong ke permission |
| GET | `/permissions/export` | `exportPermissions` | Xuat Excel |
| GET | `/permissions/template` | `downloadPermissionTemplate` | Tai file mau |
| POST | `/permissions/import` | `importPermissions` | Nhap Excel |

## System Settings

Path: `src/modules/auth/system-settings`

Services:

- [src/modules/auth/system-settings/services/systemSettingService.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/system-settings/services/systemSettingService.js)

| Method | Endpoint | Service function | Mo ta |
|---|---|---|---|
| GET | `/settings` | `$api` | Lay toan bo cau hinh |
| PUT | `/settings` | `$api` | Cap nhat cau hinh |
| GET | `/settings/public` | `$api` | Lay cau hinh cong khai |
