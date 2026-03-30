# Standard Root Module Template

Template nay dung de tao mot module moi truc tiep duoi `src/modules/<module-name>`.

## Cach dung

1. Copy folder nay ra khoi `_template_modules`
2. Doi ten folder thanh module that, vi du `reports`
3. Doi:
   - `standard-root-module` -> ten module that
   - `StandardRootModule` -> PascalCase theo module that
   - `STANDARD_ROOT_MODULE` -> key constant neu can
4. Cap nhat:
   - `configs/index.js`
   - `services/*Service.js`
   - `router/routes.js`
   - `router/navigation.js`
   - `views/*Page.vue`
   - `module.meta.js`
5. Them i18n cho module moi
6. Chay:

```powershell
npm run validate
```

## Docs tu dong

Template nay co san `module.meta.js`.

Sau khi dev dien dung metadata va chay `npm run validate`, he thong se tu dong sinh lai:

- `src/docs/api/modules-api.md`
- `src/docs/answer/modules-analysis.md`

Neu docs khong dung nhu mong muon, check lai `module.meta.js` truoc.
