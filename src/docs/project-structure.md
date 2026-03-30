# Project Structure And Module Guide

Tai lieu nay mo ta cau truc frontend hien tai, quy trinh tao module moi, va cach de docs tu dong cap nhat ma khong can viet tay.

## 1. Tong quan cau truc `src`

```text
src/
|-- @core/                      # Core framework cua template
|-- @layouts/                   # Layout system, nav utils, CASL helpers
|-- assets/                     # Static assets
|-- components/                 # Shared UI components
|-- docs/                       # Tai lieu noi bo
|   |-- api/
|   `-- answer/
|-- lang/                       # i18n theo namespace
|   |-- en/
|   `-- vi/
|-- layouts/                    # App layouts
|-- modules/                    # Business modules
|   |-- _loader.js              # Auto-discovery loader
|   |-- _template_modules/      # Template de copy, khong duoc load vao app
|   |-- auth/                   # Nhom module he thong
|   |   |-- shared/             # Shared helpers cho auth group
|   |   |-- activity-logs/
|   |   |-- organizations/
|   |   |-- permissions/
|   |   |-- roles/
|   |   |-- system-settings/
|   |   `-- user/
|   `-- meetings/
|       |-- shared/            # Shared helpers rieng cho meetings
|       |-- components/admin/  # Form, tabs, live tabs cho admin
|       `-- views/
|           |-- overview/
|           |-- management/
|           |-- catalogs/
|           |-- news/
|           |-- participant/
|           `-- admin/
|-- pages/                      # File-based pages
|-- plugins/                    # Router, i18n, CASL...
|-- services/                   # Shared services
|-- utils/                      # Global utilities
`-- views/                      # Shared views
```

## 2. Nguyen tac to chuc module

Moi module la mot bounded context o frontend. Module co the nam:

- truc tiep duoi `src/modules/<module-name>`
- hoac nam trong nhom, vi du `src/modules/auth/<module-name>`

Moi module nen co day du:

- `components/`
- `composables/`
- `configs/index.js`
- `models/`
- `router/routes.js`
- `router/navigation.js`
- `services/*Service.js`
- `stores/`
- `utils/index.js`
- `views/`
- `index.js`
- `module.meta.js`

Luu y:

- Loader hien tai da ho tro nested modules.
- Folder bat dau bang `_` se bi bo qua.
- `_template_modules` chi de lam template, khong duoc nap vao app.
- `module.meta.js` duoc dung de sinh docs tu dong.

## 3. Loader module

Loader nam o [src/modules/_loader.js](/e:/Danatec/Projects/quandh-frontend/src/modules/_loader.js).

Loader hien tai:

- scan `src/modules/**/index.js`
- bo qua `src/modules/_template_modules/**`
- ho tro module nested trong `auth/*`
- doc `routes`, `navigation`, `navOrder`
- goi `install(app)` neu module co export ham nay

Dieu kien de module duoc nhan:

- co `index.js`
- khong nam trong folder bat dau bang `_`
- co cau truc folder hop le

## 4. Cau truc chuan cua mot module

```text
src/modules/<group?>/<module-name>/
|-- components/
|-- composables/
|-- configs/
|   `-- index.js
|-- models/
|-- router/
|   |-- navigation.js
|   `-- routes.js
|-- services/
|   `-- <module>Service.js
|-- stores/
|-- utils/
|   `-- index.js
|-- views/
|-- index.js
`-- module.meta.js
```

`<group?>` la tuy chon, vi du `auth`.

## 5. Nhom `auth`

Nhom `auth` dung de gom cac module he thong:

- `user`
- `roles`
- `permissions`
- `organizations`
- `activity-logs`
- `system-settings`

Shared helpers cua nhom nay:

- [src/modules/auth/shared/moduleFactory.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/moduleFactory.js)
- [src/modules/auth/shared/crudServiceFactory.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/crudServiceFactory.js)
- [src/modules/auth/shared/config.js](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/shared/config.js)
- [src/modules/auth/README.md](/e:/Danatec/Projects/quandh-frontend/src/modules/auth/README.md)

Khi tao module moi trong `auth`, uu tien tan dung cac helper nay de giam duplicate va giam loi.

## 5.1 Module `meetings`

`meetings` la root module lon nhat cua repo, nen ben trong no duoc tach tiep theo sub-domain thay vi de toan bo file o cung mot mat phang.

Cau truc hien tai:

```text
src/modules/meetings/
|-- components/
|   `-- admin/
|       |-- forms/
|       |-- live-tabs/
|       `-- tabs/
|-- shared/
|   `-- moduleFactory.js
`-- views/
    |-- overview/
    |-- management/
    |-- catalogs/
    |   |-- participants/
    |   |-- documents/
    |   |-- meetings/
    |   `-- issuers/
    |-- news/
    |-- monitoring/
    |-- participant/
    |   `-- details/
    `-- admin/
        |-- edit/
        `-- live/
```

Muc dich:

- `overview/`: man tong quan nghiep vu
- `management/`: danh sach van hanh nhu meetings, votes, documents, conclusions, calendar
- `catalogs/`: cac danh muc phu tro
- `news/`: bai viet va the loai bai viet
- `participant/`: flow cua dai bieu
- `admin/`: flow quan tri, edit va live controller
- `components/admin/`: component phuc vu man admin
- `shared/`: helper chung cho manifest va navigation cua module

## 6. Cac file quan trong cua module

### 6.1 `index.js`

La entry cua module. It nhat phai export:

- `routes`
- `navigation`
- `navOrder`

Module root co the export object truc tiep:

```js
import { routes } from './router/routes'
import { navigation } from './router/navigation'

export default {
  routes,
  navigation,
  navOrder: 120,
}
```

Module trong `auth` nen dung `createModuleManifest`:

```js
import { routes } from './router/routes'
import { navigation } from './router/navigation'
import { createModuleManifest } from '../shared/moduleFactory'

export default createModuleManifest({
  routes,
  navigation,
  navOrder: 120,
})
```

### 6.2 `configs/index.js`

Nen chua:

- `API_BASE`
- `DEFAULT_PER_PAGE`
- `PER_PAGE_OPTIONS`
- `DEFAULT_COLUMNS`
- `PERMISSIONS`

### 6.3 `services/*Service.js`

La noi map API cua module.

Trong `auth`, nen uu tien dung `createCrudService()` de gom CRUD chung.

### 6.4 `router/routes.js`

Khai bao route cua module. Route name nen on dinh de tranh vo navigation, tab state, va link sau refactor.

### 6.5 `router/navigation.js`

Tra ve:

- `null`
- mot nav item
- hoac mang nav items

Neu module la nav link thuong thi khong duoc de `children: undefined`, vi nav layout se hieu sai thanh group.

### 6.6 `module.meta.js`

Day la file quan trong de docs tu dong cap nhat.

Vi du:

```js
export default {
  name: 'reports',
  displayName: 'Reports',
  group: 'root',
  navOrder: 120,
  path: 'src/modules/reports',
  servicePaths: ['src/modules/reports/services/reportService.js'],
  purpose: 'Quan ly bao cao nghiep vu.',
  features: [
    'Danh sach bao cao',
    'Tao moi, cap nhat, xoa',
    'Filter va export',
  ],
  api: [
    { method: 'GET', endpoint: '/reports', service: 'fetchReports', description: 'Danh sach reports' },
    { method: 'GET', endpoint: '/reports/:id', service: 'fetchReport', description: 'Chi tiet report' },
    { method: 'POST', endpoint: '/reports', service: 'createReport', description: 'Tao report' },
  ],
}
```

Y nghia cac field:

- `name`: ten ky thuat cua module
- `displayName`: ten hien thi trong docs
- `group`: nhom module, vi du `auth`, `root`
- `navOrder`: thu tu hien thi trong docs
- `path`: duong dan module trong repo
- `servicePaths`: danh sach service chinh
- `purpose`: mo ta ngan ve muc dich
- `features`: chuc nang chinh
- `api`: cac endpoint frontend dang goi

## 7. Cac docs duoc sinh tu dong

Script generator nam o [scripts/generate-module-docs.js](/e:/Danatec/Projects/quandh-frontend/scripts/generate-module-docs.js).

Script nay doc tat ca `src/modules/**/module.meta.js` va sinh:

- [src/docs/api/modules-api.md](/e:/Danatec/Projects/quandh-frontend/src/docs/api/modules-api.md)
- [src/docs/answer/modules-analysis.md](/e:/Danatec/Projects/quandh-frontend/src/docs/answer/modules-analysis.md)

Lenh chay tay:

```powershell
npm run docs:generate
```

Generator cung duoc goi trong:

- `npm run validate`
- `npm run build` thong qua `prebuild`

Nghia la:

- dev copy template
- doi ten file/folder
- cap nhat `module.meta.js`
- chay `npm run validate`

la docs se duoc cap nhat truoc khi validator kiem tra.

## 8. Cach tao mot module moi

Co 2 truong hop:

1. Tao module root trong `src/modules`
2. Tao module con trong `src/modules/auth`

### 8.1 Cach nhanh nhat: copy template

Template co san:

- [standard-root-module](/e:/Danatec/Projects/quandh-frontend/src/modules/_template_modules/standard-root-module)
- [standard-auth-module](/e:/Danatec/Projects/quandh-frontend/src/modules/_template_modules/standard-auth-module)

Chon template phu hop, copy ra ngoai `_template_modules`, roi doi ten.

### 8.2 Tao module root

Vi du tao `reports`:

1. Copy `src/modules/_template_modules/standard-root-module`
2. Doi ten folder thanh `src/modules/reports`
3. Doi cac ten mau:
   - `standard-root-module` -> `reports`
   - `StandardRootModule` -> `Reports`
4. Cap nhat:
   - `configs/index.js`
   - `services/reportService.js`
   - `router/routes.js`
   - `router/navigation.js`
   - `views/ReportsListPage.vue`
   - `module.meta.js`
5. Them i18n:
   - `src/lang/en/reports/reports.js`
   - `src/lang/vi/reports/reports.js`
6. Chay:

```powershell
npm run validate
```

### 8.3 Tao module trong `auth`

Vi du tao `report-periods`:

1. Copy `src/modules/_template_modules/standard-auth-module`
2. Doi ten folder thanh `src/modules/auth/report-periods`
3. Doi cac ten mau:
   - `standard-auth-module` -> `report-periods`
   - `StandardAuthModule` -> `ReportPeriods`
4. Cap nhat:
   - `configs/index.js`
   - `services/reportPeriodsService.js`
   - `router/routes.js`
   - `router/navigation.js`
   - `views/ReportPeriodsListPage.vue`
   - `module.meta.js`
5. Them i18n:
   - `src/lang/en/report-periods/report-periods.js`
   - `src/lang/vi/report-periods/report-periods.js`
6. Chay:

```powershell
npm run validate
```

### 8.4 Checklist khi tao module moi

- [ ] Chon dung loai template: root hay auth
- [ ] Doi ten folder va file mau
- [ ] Tao `index.js`
- [ ] Tao `configs/index.js`
- [ ] Tao `router/routes.js`
- [ ] Tao `router/navigation.js`
- [ ] Tao it nhat 1 `services/*Service.js`
- [ ] Tao it nhat 1 `.vue` trong `views`
- [ ] Tao `module.meta.js`
- [ ] Them i18n `en` va `vi`
- [ ] Chay `npm run validate`

## 9. Quy trinh cap nhat docs tu dong

Sau khi dev copy template va lam feature moi, docs se cap nhat theo quy trinh nay:

1. Hoan thien module code
2. Dien dung `module.meta.js`
3. Chay `npm run docs:generate` hoac `npm run validate`
4. Script sinh lai `modules-api.md` va `modules-analysis.md`
5. Commit code cung docs da sinh

## 10. Validator module

Validator nam o [scripts/validate-modules.js](/e:/Danatec/Projects/quandh-frontend/scripts/validate-modules.js).

Lenh:

```powershell
npm run validate
```

Validator hien tai se check:

- required folders
- required files
- `index.js`
- `configs/index.js`
- `services/*Service.js`
- docs file can thiet
- va nhac neu module moi chua co `module.meta.js`

## 11. Quy uoc dat ten

| Thanh phan | Quy uoc | Vi du |
|---|---|---|
| Folder module | kebab-case | `activity-logs` |
| Group path | kebab-case | `auth` |
| Service file | camelCase + `Service` | `userService.js` |
| View file | PascalCase + `Page` | `UserListPage.vue` |
| Route name | kebab-case on dinh | `roles-list` |
| Config constant | UPPER_SNAKE_CASE | `API_BASE` |
| Permission key | dot notation | `user.view` |
| i18n namespace | folder/file based | `user.user.list.title` |

## 12. Ghi chu quan trong

- Khong lam feature that trong `_template_modules`.
- Khi refactor folder module, giu nguyen route name va API contract neu khong co yeu cau doi logic.
- Module trong `auth` nen uu tien tan dung shared helpers truoc khi viet utility moi.
- Neu docs co ve khong khop module thuc te, check lai `module.meta.js` truoc khi sua tay docs generated.
