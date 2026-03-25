# Cấu trúc dự án & Hướng dẫn phát triển Module mới

> Tài liệu mô tả cây cấu trúc project và hướng dẫn từng bước để tạo module mới theo flow hiện tại.

---

## 1. Cây cấu trúc dự án

```
src/
├── @core/                    # Core components (không sửa đổi)
├── @layouts/                 # Layout system, nav plugins, CASL
├── assets/                   # Static assets (images, icons)
├── components/               # Shared components (AppTextField, DataTable...)
├── docs/                     # 📖 Tài liệu
│   ├── api/                  #    API documentation (endpoint specs)
│   └── answer/               #    Module functional analysis
├── lang/                     # 🌐 i18n messages (module-based)
│   ├── en/                   #    English translations
│   │   ├── common/           #    Shared keys (actions, labels, status)
│   │   └── [module]/         #    Module-specific keys
│   └── vi/                   #    Vietnamese translations
│       ├── common/
│       └── [module]/
├── layouts/                  # App layouts (default, blank)
├── modules/                  # 🏗️ Business modules (auto-discovered)
│   ├── _loader.js            #    Auto-discovery: scan modules/*/index.js
│   ├── example/              #    📋 Template module (tham khảo)
│   └── [module-name]/        #    Mỗi module có cấu trúc chuẩn ↓
│       ├── index.js           #   Entry point: export routes, navigation, navOrder
│       ├── components/        #   Vue components riêng của module
│       ├── composables/       #   Vue composables (useXxx)
│       ├── configs/           #   API_BASE, enums, permissions, columns
│       │   └── index.js
│       ├── models/            #   Data models, TypeScript types
│       ├── router/            #   Routes & navigation
│       │   ├── routes.js      #   Vue Router routes
│       │   └── navigation.js  #   Sidebar nav items
│       ├── services/          #   API service functions
│       │   └── [name]Service.js
│       ├── stores/            #   Pinia stores
│       ├── utils/             #   Helper functions
│       │   └── index.js
│       └── views/             #   Vue pages (.vue)
├── pages/                    # File-based routing pages
├── plugins/                  # Vue plugins
│   ├── 1.router/             #   Vue Router + guards
│   ├── casl/                 #   CASL ability (phân quyền)
│   ├── fake-api/             #   MSW mock API handlers
│   └── i18n/                 #   vue-i18n setup
│       └── locales/          #   Legacy locale JSON (nav items, vuetify)
├── services/                 # 🔌 Shared services
│   ├── api-service.js        #   Axios-based ApiService class
│   └── auth.js               #   Auth service (login, logout)
├── utils/                    # Global utilities
│   └── api.js                #   ofetch $api client (Bearer + org header)
└── views/                    # Shared views (auth pages, error pages)
```

---

## 2. Hệ thống Auto-Discovery

Khi thêm module mới, **không cần sửa bất kỳ file nào khác**. Hệ thống tự động:

```
modules/_loader.js
    ↓ import.meta.glob('./*/index.js')
    ↓
Tự động scan → merge routes → merge navigation → install plugins
```

**Điều kiện**: Module phải có file `index.js` ở root folder.

---

## 3. Auth Flow

```
Login → POST /api/auth/login
    ↓
Cookie: accessToken, userData, userAbilityRules, currentOrganizationId
    ↓
ApiService.authHeader(): Bearer {token} + X-Organization-Id
    ↓
401 → xóa cookies → redirect /login
```

---

## 4. Hướng dẫn tạo Module mới

### Bước 1: Tạo thư mục

```
src/modules/[ten-module]/
├── index.js
├── components/
├── composables/
├── configs/
│   └── index.js
├── models/
├── router/
│   ├── routes.js
│   └── navigation.js
├── services/
│   └── [ten]Service.js
├── stores/
├── utils/
│   └── index.js
└── views/
    ├── [Ten]ListPage.vue
    └── [Ten]DetailPage.vue
```

### Bước 2: `configs/index.js` — Cấu hình

```js
/** Base API path */
export const API_BASE = '/ten-module'

/** Số dòng mặc định trên 1 trang */
export const DEFAULT_PER_PAGE = 10

/** Các tuỳ chọn items per page */
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

/** Statuses */
export const STATUSES = [
  { title: 'Hoạt động', value: 'active', color: 'success' },
  { title: 'Ngưng', value: 'inactive', color: 'secondary' },
]

/** Danh sách cột mặc định hiển thị */
export const DEFAULT_COLUMNS = ['name', 'status', 'createdAt']

/** Permission keys */
export const PERMISSIONS = {
  VIEW: 'ten-module.view',
  CREATE: 'ten-module.create',
  EDIT: 'ten-module.edit',
  DELETE: 'ten-module.delete',
}
```

### Bước 3: `services/[ten]Service.js` — API Service

```js
/**
 * [Ten] Service
 */
import { API_BASE } from '../configs'

export const fetchItems = params => {
  return $api(API_BASE, { params })
}

export const fetchItem = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createItem = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateItem = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteItem = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const exportItems = params => {
  return $api(`${API_BASE}/export`, { params, responseType: 'blob' })
}
```

### Bước 4: `router/routes.js` — Routes

```js
export const routes = [
  {
    path: '/ten-module',
    name: 'ten-module-list',
    component: () => import('../views/TenModuleListPage.vue'),
    meta: {
      action: 'view',
      subject: 'TenModule',
    },
  },
  {
    path: '/ten-module/:id',
    name: 'ten-module-detail',
    component: () => import('../views/TenModuleDetailPage.vue'),
    meta: {
      action: 'view',
      subject: 'TenModule',
      navActiveLink: 'ten-module-list',
    },
  },
]
```

### Bước 5: `router/navigation.js` — Sidebar Menu

```js
export const navigation = [
  {
    title: 'Ten Module',
    icon: { icon: 'tabler-box' },
    to: 'ten-module-list',
    action: 'view',
    subject: 'TenModule',
  },
]
```

### Bước 6: `index.js` — Entry Point

```js
import { routes } from './router/routes'
import { navigation } from './router/navigation'

export default {
  routes,
  navigation,
  navOrder: 50, // Thứ tự hiển thị trên sidebar (nhỏ = lên trước)
}
```

### Bước 7: i18n — Bản dịch (tùy chọn)

Tạo file `src/lang/en/[ten-module]/[ten-module].js` và `src/lang/vi/[ten-module]/[ten-module].js`:

```js
// src/lang/vi/ten-module/ten-module.js
export default {
  title: 'Tên Module',
  list_title: 'Danh sách',
  create_title: 'Tạo mới',
  fields: {
    name: 'Tên',
    status: 'Trạng thái',
  },
}
```

### Bước 8: Views — Tạo trang

Tham khảo `modules/example/views/` hoặc `modules/user/views/UserListPage.vue` để tạo views theo pattern chuẩn.

---

## 5. Checklist tạo Module mới

- [ ] Tạo thư mục `modules/[ten-module]/` với đầy đủ sub-folders
- [ ] Viết `configs/index.js` (API_BASE, enums, permissions)
- [ ] Viết `services/[ten]Service.js` (CRUD functions)
- [ ] Viết `router/routes.js` (Vue Router routes)
- [ ] Viết `router/navigation.js` (sidebar items)
- [ ] Viết `index.js` (export routes, navigation, navOrder)
- [ ] Tạo views trong `views/` (list page, detail page)
- [ ] Thêm i18n translations (en + vi)
- [ ] Kiểm tra sidebar hiển thị đúng
- [ ] Test CRUD hoạt động với API
- [ ] Cập nhật `docs/api/` và `docs/answer/`

---

## 6. Quy ước đặt tên

| Thành phần | Quy ước | Ví dụ |
|------------|---------|-------|
| Folder module | kebab-case | `user`, `front-pages` |
| Service file | camelCase + Service | `userService.js` |
| View file | PascalCase + Page | `UserListPage.vue` |
| Route name | kebab-case | `user-list`, `user-detail` |
| Config constants | UPPER_SNAKE | `API_BASE`, `DEFAULT_PER_PAGE` |
| Permission keys | dot notation | `user.view`, `user.create` |
| i18n keys | snake_case | `list_title`, `create_title` |
