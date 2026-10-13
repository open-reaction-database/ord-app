# ord-app

Two web applications for the [Open Reaction Database](https://open-reaction-database.org).

The editor: browse, create, and edit reaction datasets; Python/FastAPI backend + React UI, Auth0-gated, backed by Postgres.

The viewer's backend: search and browse over one published corpus with `ord_schema.search`; no database.

The viewer: the public search and browse site over the viewer's backend; React UI on the shared package, no sign-in.

## Layout

- `backend/editor/` — the editor's backend, its own uv project (Python 3.12): `pyproject.toml`, `uv.lock`, `alembic.ini`, `migrations/` (Alembic), and the compose image's `Dockerfile`.
  - `ord_editor/service_api/` — FastAPI app (`service_api/main.py`), `repositories/`, `services/`, `domain/`, `schemas/`, `resources/`. Served under `/service_api`. Tests sit beside the code as `*_test.py`; shared fixtures in `ord_editor/conftest.py`, data in `ord_editor/testdata/`.
- `backend/viewer/` — the viewer's backend, its own uv project (Python 3.12), pinned to `ord-schema[search,nl]==0.9.2` and `rdkit==2026.3.5`: `Corpus` opens only artifacts stamped with its own RDKit version and artifact lineage, so RDKit follows the published corpus and ord-schema stays on a release whose artifact definitions match it. `ord_viewer/` — a FastAPI app with every route under `/api/`, serving one corpus directory (`ORD_VIEWER_CORPUS_DIR`: `projections/`, `structures/`, `pivots/`, `occurrences/`, `sources/`; `projections/`, `structures/`, and `sources/` each hold one shard level of files, while `pivots/` and `occurrences/` hold one subdirectory per level, each sharded the same way). Tests derive a small corpus (`ord_viewer/testing.py`) and need no Postgres. `openapi.json` is the API's committed OpenAPI document, which the viewer's frontend generates its types from; after changing a route or model, rewrite it with `uv run python -m ord_viewer.openapi` (a test fails until you do).
- `deploy/editor/` — the editor's production image: `Dockerfile` (the editor's bundle and backend behind nginx, under supervisord), `Dockerfile.dockerignore`, `nginx.conf`, `supervisord.conf`, `entrypoint.sh`.
- `ruff.toml` — the ruff config for every Python project. `scripts/` — dev/E2E helpers. `docker-compose.yml` — Postgres + the editor's backend.
- `frontend/` — npm workspace root: the lockfile, `.npmrc`, the shared lint/format tooling and configs, a `tsconfig.base.json` every project extends, and a `tsconfig.json` that references each project. Workspaces live in `apps/` (deployables) and `packages/` (shared code).
  - `apps/editor/` — the editor: React 19 + Vite 6, Redux Toolkit store, Mantine v7, wouter routing. Imports resolve from `src/` through tsconfig `paths`, one entry per top-level directory (write `store/…`, `common/…`, `features/…`, not `../../`). It has no phone layout: `index.html` sets a 1024 px viewport, so a phone lays it out as a 1024 px desktop window and zooms out; desktop windows ignore the setting.
  - `apps/viewer/` — the viewer: React 19, Vite 6, Mantine v7, wouter, and TanStack Query (`src/api/`: `fetch` behind typed hooks); no Redux, axios, or Auth0. Its own files import each other through `#…` subpath imports (`#components/ViewerPage.tsx`), never `../`. wouter matches routes against the path after `decodeURI`, so read a path parameter through `routeParam` (`src/routeParams.ts`), which decodes the escapes `decodeURI` leaves. Its API types (`src/api/schema.ts`) are generated from `backend/viewer/openapi.json` with `npm run generate:api -w apps/viewer`, after `uv run python -m ord_viewer.openapi`; `lint_and_build_ui` fails when they differ. ESLint, jscpd, and SonarCloud (`.sonarcloud.properties`) skip the file.
  - `packages/ui/` — `@open-reaction-database/ui`, private and unpublished: the Mantine theme, color/typography/button classes, and icons (`src/theme/`, with the global stylesheet `global.scss`), display primitives and form controls such as `KeyValueDisplay`, `Counter`, and `FileControl` (`src/display/`), the reaction model (`src/reaction/model/`: the `AppReaction` types and the converters to and from ord messages), `ReactionProvider` and its hooks (`src/reaction/provider/`), the reaction view and its drawer forms (`src/reaction/view/`), the structure-preview renderer (`src/reaction/previews/`), the page shell (`src/shell/`: `PageContainer` with its breadcrumbs, footer, and logo), the Ketcher structure dialog (`src/ketcher/`: `StructureDialog`, which loads `KetcherDialog` lazily), and test helpers (`src/testing/`). `packages/ui/README.md` lists what a host app provides. Apps consume it as TypeScript source and import it only through its `exports` (`@open-reaction-database/ui/theme`, `…/theme/global.scss`, `…/display`, `…/reaction`, `…/reaction/model`, `…/reaction/previews`, `…/shell`, `…/ketcher`, `…/testing`). Inside the package, files import each other by file through `#…` subpath imports (`#theme/colors.ts`) or from the same folder, never `../` and never through the package's own entry files, and every import must be declared in its own `package.json`; ESLint enforces these, rejects import cycles, and bans Redux, axios, and Auth0 there, wouter outside `src/shell/`, and Ketcher outside `src/ketcher/KetcherDialog.tsx`.
  - Reaction protobufs come from the protobuf-es SDK that the Buf Schema Registry generates from ord-schema, `@buf/open-reaction-database_ord-schema.bufbuild_es`; `frontend/.npmrc` points the `@buf` scope at buf.build. Pin it to the exact version of an ord-schema release (its `label-vX.Y.Z` dist-tag): a caret range floats to newer, unreleased BSR commits. The editor depends on it and the shared package declares it as both a peer and a dev dependency, so a bump changes all three. The model's converters map ord messages to and from the app's shapes.

## Backend (Python, uv)

- Each project under `backend/` is its own uv project; run its commands from its directory (`cd backend/editor`) or with `uv run --directory backend/editor …`.
- Deps: `uv sync --frozen` (pyproject.toml + uv.lock). **No lazy imports**; Google-style docstrings.
- Postgres required, configured via `PG_DSN` / `PG_ALEMBIC_DSN` / `PG_TEST_DSN`. Migrate (from `backend/editor`): `uv run alembic upgrade head`.
- Run dev server (from `backend/editor`): `APP_ENV=localhost uv run uvicorn ord_editor.service_api.main:app --reload` → http://localhost:8000 (`/service_api/docs`).
- Tests (from `backend/editor`): `uv run pytest` (pytest-asyncio). Parallel runs are supported — `uv run pytest -n auto` — because the conftest gives each xdist worker its own isolated test database (DSN suffixed with `PYTEST_XDIST_WORKER`). Note: at the current suite size, per-worker DB setup makes `-n auto` roughly break-even with serial; the win grows as the suite does.
- Viewer: `cd backend/viewer && uv sync --frozen`; tests `uv run pytest -n auto`; serve with `ORD_VIEWER_CORPUS_DIR=<corpus> uv run uvicorn ord_viewer.main:app --port 8001` (opening a full corpus takes about 40 s and 7 GiB); the API docs are at `/api/docs`; the other `ORD_VIEWER_*` settings are listed in `README.md`'s "Viewer backend" section; `/api/ask` needs `ORD_ANTHROPIC_API_KEY` (or `ANTHROPIC_API_KEY`) and answers 503 without one.
- Lint/type: `ruff` + `ruff format` (config in the root `ruff.toml`), `ty` (Astral's type checker; `uv run ty check ord_editor`).

## Frontend (`frontend/`)

- Run from `frontend/`: setup `npm ci`; lint/format `npm run lint:check` (= `prettier --check . && npm run lint && npm run lint:css`, i.e. `eslint .` + `stylelint '**/*.[s]css'`); type-check `npm run typecheck` (= `tsc -b`); coverage `npm run test:coverage` (each workspace's own Vitest config and floors).
- Editor: `npm run dev -w apps/editor`, `npm run build -w apps/editor` (= `tsc -b && vite build`), `npm run test:e2e -w apps/editor` (Playwright, specs in `apps/editor/e2e/`). Unit tests: `cd apps/editor && npx vitest run` (Vitest + happy-dom + Testing Library).
- Viewer: `npm run dev -w apps/viewer` (port 5174, sending `/api` to the backend on 8001 or `ORD_VIEWER_API`), `npm run build -w apps/viewer`, unit tests `npm test -w apps/viewer -- --run` (render with `#test/render.tsx`'s `renderAt`).
- Shared package: unit tests `npm test -w packages/ui -- --run` (its own Vitest config; render with `#testing/renderWithMantine.tsx`). A component's tests move with it into the package and no longer run in the editor's suite.
- **Type-check with `tsc -b`, not bare `tsc --noEmit`** (the latter skips test files → false green; CI runs `tsc -b`). See `.claude/rules/ui-testing.md` and the **`ord-app-ui-testing` skill** for the full testing playbook (mocking patterns, render helpers, thunk harness, E2E stack boot).

## Formatting & pre-commit

Run hooks via [pre-commit](https://pre-commit.com): `uvx pre-commit install` once (and `npm ci` in `frontend/` so UI hooks find their tools). Hooks: `addlicense` (Apache header, current year for new files), `ruff` + `ruff-format` + `ty-editor` + `ty-viewer` (scoped to `backend/editor/ord_editor/` and `backend/viewer/ord_viewer/`), UI `prettier`/`eslint`/`stylelint` and the `tsc -b` type check, and `jscpd`. Run all: `uvx pre-commit run --all-files`.

## CI gates (a PR is not mergeable until these are green)

- **Tests**: `test_python` and `test_python_viewer` (each ubuntu + macos), `test_ui` (the editor's and the shared package's tests), `test_ui_viewer`, `test_e2e` (boots the full no-auth stack).
- **Checks**: `check_python` (ruff / ruff-format / ty), `check_duplication` (jscpd copy-paste detection, root `.jscpd.json`; also `make duplication`), `lint_and_build_ui` (`lint:check` + `typecheck` + `npm run build`), `check_license_headers`.
- **SonarCloud quality gate** and **Greptile review** also gate merges — never merge over a red Sonar check; address Greptile findings (and read its PR-body summary for sub-threshold notes) before merging.

## Conventions

- Every source file carries the Apache 2.0 license header (enforced by addlicense).
- Image builds (`deploy/editor/Dockerfile`) take the Auth0 settings as build arguments or from `frontend/apps/editor/.env`, and fail without them; the backend reads them from the environment or `backend/editor/ord_editor/.env`. Both `.env` files are gitignored; copy each from the `.env.template` beside it.
- Coverage is measured locally in CI (`pytest --cov` + Vitest `coverage`) and enforced by floors (`[tool.coverage.report] fail_under` in `backend/editor/pyproject.toml`, Vitest `coverage.thresholds` in `frontend/apps/editor/vite.config.ts`, `frontend/apps/viewer/vite.config.ts`, and `frontend/packages/ui/vitest.config.ts`), and is not uploaded to Codecov.
- A living issue-triage plan lives in `ISSUE_TRIAGE_PLAN.md` (synced to issue #656) and epic #662.
