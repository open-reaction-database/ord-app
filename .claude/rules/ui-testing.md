---
paths:
  - "ui/**/*"
---

# UI testing & type-checking (ord-app `ui/`)

Two silent-failure traps when working in `ui/`:

- **Type-check with `tsc -b`, not `tsc --noEmit`.** CI's `npm run build` runs `tsc -b`, which type-checks the test files too. Bare `tsc --noEmit` against the root config skips them → false green, then the `lint_and_build_ui` CI job fails. Run `cd ui && npx tsc -b --force`.
- **Booting the dev/E2E UI needs BOTH `VITE_E2E_NO_AUTH=TRUE` and `VITE_API_ENDPOINT="http://127.0.0.1:8000/service_api/api/v1"`.** `VITE_E2E_NO_AUTH` only skips Auth0; without the endpoint the app calls the **production** API and hangs on "Loading…". (Backend is mounted under `/service_api`.)

For the full playbook — Vitest mocking patterns (overloaded-axios `vi.mocked`, the Ketcher/d3 barrel stub, protobuf partial-mocks), the render helpers, the thunk-test harness, and the E2E stack-boot recipe — use the **`ord-app-ui-testing` skill**.
