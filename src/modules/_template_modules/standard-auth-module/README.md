# Standard Auth Submodule Template

Template nay dung de tao module moi ben trong `src/modules/auth/<module-name>`.

Template da dung san:

- `createModuleManifest`
- `createNavItem`
- `createCrudService`
- `DEFAULT_PER_PAGE_OPTIONS`

## Cach dung

1. Copy folder nay thanh `src/modules/auth/<module-name>`
2. Doi ten:
   - `standard-auth-module`
   - `StandardAuthModule`
3. Cap nhat:
   - `API_BASE`
   - `PERMISSIONS`
   - route name
   - CASL subject
   - i18n titleKey
   - `module.meta.js`
4. Chay:

```powershell
npm run validate
```

## Docs tu dong

Template nay co san `module.meta.js`.

Sau khi copy template va dien metadata, docs se duoc sinh lai tu dong khi chay:

- `npm run docs:generate`
- hoac `npm run validate`

Docs duoc cap nhat gom:

- `src/docs/api/modules-api.md`
- `src/docs/answer/modules-analysis.md`
