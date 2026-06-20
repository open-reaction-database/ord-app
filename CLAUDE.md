# ord-app

Web application for the [Open Reaction Database](https://open-reaction-database.org): browse, create, and edit reaction datasets. Python/FastAPI backend + React UI, Auth0-gated, backed by Postgres.

## Layout

- `ord_app/` — Python backend (Python 3.12).
  - `service_api/` — FastAPI app (`service_api/main.py`), `repositories/`, `services/`, `domain/`, `schemas/`, `resources/`. Served under `/service_api`.
  - `api/`, `visualization/` — supporting modules. `tests/` — pytest suite.
- `ui/` — React 19 + Vite 6 frontend. Redux Toolkit store, Mantine v7, wouter routing, `ord-schema-protobufjs` for reaction protobufs. Imports use `baseUrl: ./src` (write `store/…`, `common/…`, `features/…`, not `../../`).
- `migrations/` — Alembic. `scripts/` — dev/E2E helpers. `docker-compose.yml` — Postgres + backend.

## Backend (Python, `uv`)

- Deps: `uv sync --frozen` (pyproject.toml + uv.lock). **No lazy imports**; Google-style docstrings.
- Postgres required, configured via `PG_DSN` / `PG_ALEMBIC_DSN` / `PG_TEST_DSN`. Migrate: `uv run alembic upgrade head`.
- Run dev server: `cd ord_app/service_api && ORD_APP_TESTING=TRUE uv run fastapi dev main.py` → http://localhost:8000 (`/docs`).
- Tests: `uv run pytest` (pytest-asyncio). Parallel runs are supported — `uv run pytest -n auto` — because the conftest gives each xdist worker its own isolated test database (DSN suffixed with `PYTEST_XDIST_WORKER`). Note: at the current suite size, per-worker DB setup makes `-n auto` roughly break-even with serial; the win grows as the suite does.
- Lint/type: `ruff` + `ruff format`, `ty` (Astral's type checker; `uv run ty check ord_app`).

## Frontend (`ui/`)

- Setup: `cd ui && npm ci`. Dev: `npm run dev`. Build: `npm run build` (= `tsc -b && vite build`).
- Unit tests: `npx vitest run` (Vitest + happy-dom + Testing Library). E2E: `npm run test:e2e` (Playwright, specs in `e2e/`).
- Lint/format: `npm run lint:check` (= `prettier --check . && npm run lint && npm run lint:css`, i.e. `eslint src *.ts *.cjs *.mjs` + `stylelint '**/*.[s]css'`).
- **Type-check with `tsc -b`, not bare `tsc --noEmit`** (the latter skips test files → false green; CI runs `tsc -b`). See `.claude/rules/ui-testing.md` and the **`ord-app-ui-testing` skill** for the full testing playbook (mocking patterns, render helpers, thunk harness, E2E stack boot).

## Formatting & pre-commit

Run hooks via [pre-commit](https://pre-commit.com): `uv run pre-commit install` once (and `npm ci` in `ui/` so UI hooks find their tools). Hooks: `addlicense` (Apache header, current year for new files), `ruff` + `ruff-format` (scoped to `ord_app/`), and UI `prettier`/`eslint`/`stylelint`. Run all: `uv run pre-commit run --all-files`.

## CI gates (a PR is not mergeable until these are green)

- **Tests**: `test_python` (ubuntu + macos), `test_ui`, `test_e2e` (boots the full no-auth stack).
- **Checks**: `check_python` (ruff / ruff-format / ty), `check_javascript` (clang-format), `lint_and_build_ui` (`lint:check` + `npm run build`), `check_license_headers`.
- **SonarCloud quality gate** and **Greptile review** also gate merges — never merge over a red Sonar check; address Greptile findings (and read its PR-body summary for sub-threshold notes) before merging.

## Conventions

- Every source file carries the Apache 2.0 license header (enforced by addlicense).
- Coverage is reported to Codecov (`codecov.yml`); each `codecov-action` must set an explicit `slug`.
- A living issue-triage plan lives in `ISSUE_TRIAGE_PLAN.md` (synced to issue #656) and epic #662.
