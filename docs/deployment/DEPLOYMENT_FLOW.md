# QuandH Frontend Deployment Flow

## Source Model

- Single source repo: `/home/vpsroot/projects/frontend/quandh-frontend`
- Staging and production run Docker images built from branches, not copied local source.

## Domain Mapping

- `staging` branch -> `https://test.yukimart.io.vn/`
- `prod` branch -> `https://yukimart.io.vn/`

## Release Flow

1. Develop and merge changes into `staging`
2. GitHub Actions builds/pushes the `staging` image
3. Deploy `staging` to `https://test.yukimart.io.vn/`
4. Validate on test
5. Promote the validated commit from `staging` to `prod`
6. GitHub Actions builds/pushes the `prod` image
7. Deploy `prod` to `https://yukimart.io.vn/`

Short form:

- `staging -> test -> promote -> prod`

## SOP

Push/merge the frontend release commit into `staging`:

```bash
cd /home/vpsroot/projects/frontend/quandh-frontend
git status
git push origin HEAD:staging
```

Then:

1. Wait for the frontend staging image build to finish
2. Deploy staging from the backend deploy repo and QA on `https://test.yukimart.io.vn/`
3. Promote the validated `staging` commit to `prod`
4. Wait for the frontend prod image build to finish
5. Deploy and validate `https://yukimart.io.vn/`

## Runtime Config

- `staging` uses `Dockerfile.staging`
- `staging` uses `nginx.staging.conf`
- `prod` uses `Dockerfile`
- `prod` uses `nginx.conf`
- GitHub Actions build/push:
  - `staging` -> `ghcr.io/nguyenlehai-dev/quandh-frontend:staging`
  - `prod` -> `ghcr.io/nguyenlehai-dev/quandh-frontend:prod`

## Rules

- Do not copy source between environments manually.
- Promote only through branches and Git history.
- Deploy server pulls image tags that match the branch.
