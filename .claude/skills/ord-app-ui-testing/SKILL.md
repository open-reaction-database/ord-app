---
name: ord-app-ui-testing
description: Use when writing, debugging, or running tests for the ord-app `ui/` package — Vitest unit/integration tests (components, thunks, reducers, converters), mocking patterns (axios, Ketcher, protobuf), or Playwright E2E against the live no-auth stack. Covers the CI gotchas that cause "passes locally, fails in CI".
---

# ORD-App UI Testing

Stack: React 19 / Vite 6 / Vitest 3 / happy-dom / @testing-library/react / Mantine v7 / Redux Toolkit / wouter. Playwright for E2E. Imports use `baseUrl: ./src` (vite-tsconfig-paths), so write `store/…`, `common/…`, `features/…`, `test/…` — not relative `../../`.

## Pre-flight: match CI or get a false green

- **Type-check with `tsc -b`, never bare `tsc --noEmit`.** CI's `npm run build` = `tsc -b && vite build`, and `tsc -b` type-checks the **test files**. Bare `tsc --noEmit` against the root config skips them → false green, then `lint_and_build_ui` fails in CI. Always: `cd ui && npx tsc -b --force`.
- **Lint/format** exactly as CI: `npm run lint:check` = `prettier --check . && npm run lint && npm run lint:css` (where `lint` is `eslint src *.ts *.cjs *.mjs` and `lint:css` is `stylelint '**/*.[s]css'`). Run `npx prettier --write <files>` and `npx eslint <files>` before committing. Pre-commit also runs these.
- **zsh word-splitting**: a `$VAR` holding a space-separated file list does NOT split. Use `${=FILES}` (e.g. `npx eslint ${=FILES}`).
- ESLint rules that bite tests: `no-duplicate-imports`; use `Array<string>` not `string[]`; `react-refresh/only-export-components` fires on files that export both a component and helpers (add a file-level `/* eslint-disable react-refresh/only-export-components */` to test-only render helpers); forbids inline `import()` type annotations (`@typescript-eslint/consistent-type-imports`) — see the partial-mock note below.

## Running tests

```
cd ui
npx vitest run                         # whole suite (~20s)
npx vitest run <path-or-substring>     # subset
```
Vitest is scoped to `src/**`; Playwright specs live in `e2e/` and run via `npm run test:e2e` (not vitest). The license header for new test files is Apache 2.0 with the current year.

## Render helpers (in `src/test/`)

- `renderWithMantine(ui)` — wraps in `MantineProvider` (Mantine components throw without it).
- `renderWithProviders(ui, { preloadedState })` — fresh `configureStore({ reducer: rootReducer, preloadedState })` + Mantine. Returns `{ store, ...renderResult }`. Seed only the slices the component reads.
- `renderInReactionView(ui, { reactionId, reaction, isViewOnly, pathComponents })` — also seeds `reactionContext` + `reactionEntityContext` and a reaction in the store (`emptyReactionData()` by default). Use for components under `ReactionView/` / `reactionEntityNode/`.

## Mocking patterns (the ones that cost time)

**Typed axios mock.** `vi.mocked(axiosInstance)` does NOT surface `mockResolvedValue` under `tsc -b` because axios methods are overloaded. Cast instead:
```ts
vi.mock('store/axiosInstance.ts', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
const axiosMock = axiosInstance as unknown as Record<'get' | 'post' | 'patch' | 'delete', ReturnType<typeof vi.fn>>;
```

**`vi.fn` arity.** `vi.fn(() => …)` is typed with **0 args**; calling it with one fails `tsc -b` and makes `mock.calls[0]` an empty tuple. Declare the arg: `vi.fn((_arg: unknown) => …)`.

**Partial mocks without inline `import()` types** (eslint forbids them):
```ts
vi.mock('./reactions.utils.ts', async importActual => ({
  ...((await importActual()) as Record<string, unknown>),
  parseReaction: () => ({ id: 99, data: {}, previews: {}, validation: null }),
}));
```

**Ketcher / d3 CJS break.** Rendering most `ReactionView/` editor components pulls in `reactionEntityToForm`, which eagerly imports every node form including the Ketcher/d3 structure editor → `require() of ES Module d3 … not supported` under vitest. If the field nodes aren't what you're testing, stub the registry barrel:
```ts
vi.mock('features/reactions/ReactionEntities', () => ({
  ReactionEntityBaseNode: () => null,
  reactionEntityToForm: new Proxy({}, { get: () => [] }),
}));
```

**Reaction protobufs.** Reaction API responses carry base64 `binpb`; don't fabricate them. Partial-mock `parseReaction`/`parseReactionList` (in `reactions.utils.ts`) and `linkReactionEntities` (in `reactions.converters.ts`) to plain objects, keeping the reducer's merge helpers intact.

## Thunk test harness (mocked axios + action recorder)

The store uses RTK `createThunk`/`createThunkWithExplicitResult` (not RTK Query) + a plain axios instance. To test a thunk: mock the I/O, dispatch against a **real** store with a recording middleware, assert HTTP calls + dispatched action *types* (this catches follow-up refetches).

```ts
vi.mock('store/axiosInstance.ts', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
vi.mock('wouter/use-browser-location', () => ({ navigate: vi.fn() }));
vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

function makeStore() {
  const actions: Array<UnknownAction> = [];
  const recorder = () => (next: (a: unknown) => unknown) => (a: unknown) => { actions.push(a as UnknownAction); return next(a); };
  const store = configureStore({ reducer: rootReducer, middleware: d => d().concat(recorder) });
  return { store, actions, types: () => actions.map(a => a.type) };
}
// dispatch with: store.dispatch(thunk(arg) as unknown as UnknownAction)
```

- **Seed selector state by dispatching, not by hand-building preloadedState**: `store.dispatch(getReactionsListActions.request(5))` sets `activeDatasetId`; `store.dispatch(setEditingGroupIdAction(3))` sets the editing group. `arrayContaining`/`toContain` tolerate the extra setup action.
- Watch payload field names/enums: e.g. `updateGroupMembers` takes `{ user_id, role: USER_ROLES }` (snake_case, enum is `USER_ROLES.VIEWER` = `'viewer'`). `getDatasetsPage` requires its `Partial<CurrentPage>` arg.
- Teardown belongs in `afterEach`, not `beforeEach` (else the last test's global stub — e.g. `vi.unstubAllGlobals()` / clipboard stub — is never torn down).

## Playwright E2E against the live no-auth stack

Boot the full stack with the dev/test Auth0 bypass, then drive Chromium. The **critical, easy-to-miss** env var is `VITE_API_ENDPOINT` — without it the UI calls the *production* API and hangs on "Loading…".

```bash
# 1) Postgres (docker-compose maps it to host :5400; user/db = ord, empty password)
docker compose up -d db   # wait for healthy

# 2) migrations + backend (host), under /service_api
export PG_DSN="postgresql+asyncpg://ord@localhost:5400/ord"
export PG_ALEMBIC_DSN="postgresql+psycopg://ord@localhost:5400/ord"
export PG_TEST_DSN="postgresql+psycopg://ord@localhost:5400/test"
export APP_ENV=localhost ORD_APP_E2E=true CORS_ORIGINS='["http://127.0.0.1:5173"]'
uv run alembic upgrade head
uv run uvicorn ord_app.service_api.main:app --host 127.0.0.1 --port 8000 &   # docs: /service_api/docs

# 3) UI — BOTH env vars are required
cd ui && VITE_E2E_NO_AUTH=TRUE VITE_API_ENDPOINT="http://127.0.0.1:8000/service_api/api/v1" \
  npm run dev -- --host 127.0.0.1 --port 5173 &

# 4) Playwright (config baseURL is http://127.0.0.1:5173)
npx playwright install chromium   # first time only
npx playwright test e2e/<spec>
```
Teardown: kill the :5173/:8000 listeners, then `docker compose down`.

E2E driving tips (the app is WASM/Ketcher-heavy and slow):
- Grant clipboard for copy/paste flows: `test.use({ permissions: ['clipboard-read', 'clipboard-write'] })`; `127.0.0.1` is a secure context so the clipboard API works.
- Generous `test.setTimeout(120000)` + `page.setDefaultTimeout(10000)` so a bad selector fails fast instead of hanging 120s. Log each step to find the hang.
- Scope selectors to the dialog (`page.getByRole('dialog').getByLabel(…)`) — table headers collide with form labels. Prefer `getByRole('button', { name })` over `getByText` (the latter matches hidden icon `aria-label`s and hangs on click).
- Create-reaction lives on the **dataset** page (`/datasets/:id` → "Reaction" button → "From Scratch"), not the reaction editor.
- **Before/after on a one-line change**: edit the source file while the dev server runs — Vite HMR reloads it live — capture the buggy screenshot, revert, capture the fixed one. Verify the working tree is clean afterward.

## Exploratory screenshot verification (manual, not a spec)

For confirming a fix in the real app (e.g. "does this label/badge/unit render?"), drive Chromium with a throwaway Node script instead of a Playwright spec. It iterates faster — dump affordances, screenshot, adjust, rerun. These gotchas each cost a rerun; avoid them:

- **Standalone script import**: `@playwright/test` is CJS, so `import { chromium }` fails. Use:
  ```js
  import pkg from '/abs/path/ui/node_modules/@playwright/test/index.js';
  const { chromium } = pkg;
  ```
  Run with `node /tmp/shot.mjs`. Screenshot to `/tmp/*.png` and Read the image back.
- **`Close` discards unsaved edits.** The entity edit drawer commits only via its bottom **`Save`**; clicking `Close` (or navigating away) throws away role/amount/etc. you just set — they'll show as `UNSPECIFIED` on reload. The in-drawer select still shows your value (in-memory form state) even when nothing persisted, so **verify by reloading the page and reading the read-only view**, not the drawer.
- **Nested drawers have their own `Save`.** Adding an Identifier opens a sub-drawer (breadcrumb `Input / Component / Identifier`); its `Save` persists only the identifier. Set the component-level fields (role, amount, limiting) and then click the **component** drawer's `Save` — saving the sub-drawer or `Close`-ing the parent loses them. Breadcrumb items are links but not reliably `getByRole('link')`; click via `locator('a,[role=link],button').filter({ hasText: /^Component$/ })`.
- **Menu items are `role=menuitem`, not `button`.** The Reaction dropdown's "From Scratch"/"From File"/"From Enumeration" need `getByRole('menuitem', { name })`; `getByRole('button', …)` times out.
- **Combobox vs native `<select>` — don't assume.** The Create-Dataset **Group** field is a Mantine combobox: `dialog.getByPlaceholder('Select a group').click()` then `getByRole('option').first().click()`. Unit / reaction-role / identifier-type fields are real `<select>` (`AppNativeSelect`): use `selectOption({ label })`. To find the right one among several, match by its options (`if ((await s.locator('option').allTextContents()).includes('MILLILITER'))`).
- **Empty `placeholder=""` breaks `input:not([placeholder])`** (the attribute is present-but-empty). Target form fields by `getByLabel(/…/)` instead.
- **Build a component without Ketcher**: set Reaction role `REACTANT` (this reveals the `Limiting reactant` field), add an identifier row and set Type `SMILES` + value `O`/`CCO` — no WASM structure editor needed.
- **Cross-branch visual checks**: DB data persists across `git checkout`, and HMR picks up the new branch's source. Build the fixture reaction once, then check out each branch and re-screenshot the same URL — handy when two fixes live on separate branches.
- **Dumping the DOM for text** catches `<style>`/`<script>` contents (they contain words like "License"). Filter to leaf nodes (`el.childElementCount === 0`) or just read the screenshot.

## SonarCloud issues (public API, no token)

```bash
curl -s "https://sonarcloud.io/api/issues/search?componentKeys=open-reaction-database_ord-app&rules=typescript:S6582&resolved=false&ps=50"
```
The gate is part of CI; a PR isn't green over a red Sonar check. Many TS rules in this repo are documented false-positives/won't-fix (tracked in #671) — don't churn working code (e.g. `S2486` catches that already handle their condition, `S7735` readability-only branch flips). Avoid bare `Array.sort()` in tests (S-rule, needs a `localeCompare` comparator).
