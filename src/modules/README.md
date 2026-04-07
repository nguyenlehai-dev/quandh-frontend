# Modules

This directory contains only active runtime modules.

Rules:

- Modules may inherit from `@core`, `@layouts`, shared `components`, shared `composables`, and shared `utils`.
- Modules must not modify core behavior directly for local feature needs.
- `src/pages` remains the route-entry layer for file-based routing.
- Real page implementations live under `src/modules/<module>/views`.
- Keep this directory lean. Active modules currently include `auth`, `dashboard`, `role-permission`, `user-management`, `activity-log`, and `system-settings`.
- Reusable templates belong in `src/module-templates`, not here.
