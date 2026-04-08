# Module Templates

This directory stores module templates that can be copied into `src/modules` when a feature is activated.

Rules:

- Treat templates as source blueprints, not active business modules.
- Do not customize a template in place for one specific feature rollout.
- Copy a template to `src/modules/<module-name>` before implementing real business logic.
- `auth`, `dashboard`, `role-permission`, and `user-management` remain the active modules in the current application baseline.

Example:

```bash
pnpm modules:instantiate ecommerce
pnpm modules:instantiate dashboard dashboard-admin
```
