# Module Migration Map

## Active runtime modules

These modules remain under `src/modules` and are part of the active application baseline:

- `auth`
- `dashboard`
- `role-permission`
- `user-management`

## Template modules

These modules have been moved to `src/module-templates` and act as source templates for future activation:

- `academy`
- `access-control`
- `app-shell`
- `calendar`
- `charts-reference`
- `chat`
- `content-pages`
- `dashboard`
- `ecommerce`
- `email`
- `extensions-reference`
- `forms-reference`
- `invoice`
- `kanban`
- `logistics`
- `profile-settings`
- `system-pages`
- `tables-reference`
- `ui-reference`

## Activation workflow

Use one of the existing templates as the source for a new active module:

```bash
pnpm modules:instantiate ecommerce
pnpm modules:instantiate dashboard dashboard-admin
```

This copies the selected template from `src/module-templates/<template-name>` to `src/modules/<target-module-name>`.
