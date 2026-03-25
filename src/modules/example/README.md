# Module Template (Example)

## Tao module moi

```bash
# 1. Copy folder example
cp -r src/modules/example src/modules/ten-module-moi

# 2. Rename files va noi dung ben trong
#    - Employee -> TenEntity (vd: Product, Order, Customer)
#    - employee -> tenEntity
#    - EMPLOYEE -> TEN_ENTITY

# 3. Sua navOrder trong index.js
#    (so nho = hien truoc tren sidebar)

# 4. Done! Khoi dong lai dev server la thay module moi
```

## Cau truc thu muc

```
modules/ten-module/
├── index.js              # Entry point: routes + navigation + navOrder
├── router/
│   ├── routes.js         # Dinh nghia routes (path, name, component)
│   └── navigation.js     # Menu sidebar (title, icon, children)
├── configs/
│   └── index.js          # API_BASE, constants, permissions
├── models/
│   └── Entity.js         # @typedef, blankEntity, status resolvers
├── services/
│   └── entityService.js  # API calls (fetch, create, update, delete)
├── composables/
│   └── useEntity.js      # Form logic (submit, validate, reset)
├── stores/
│   └── useEntityStore.js # Pinia store (list, filters, pagination)
├── utils/
│   └── index.js          # Helper functions (format, convert)
├── components/           # Vue components rieng cua module
└── views/                # Page views (list, detail, form)
```

## navOrder tham khao

| navOrder | Module |
|----------|--------|
| 0 | dashboards |
| 10 | ecommerce |
| 20 | academy |
| 30 | logistics |
| 40 | email |
| 50 | chat |
| 60 | calendar |
| 70 | kanban |
| 80 | invoice |
| 90 | user |
| 100 | roles |
| 110 | permissions |
| 120 | front-pages |
