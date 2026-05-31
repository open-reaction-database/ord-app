#!/usr/bin/env bash
#
# Copyright 2026 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Run the full stack locally with the dev/test Auth0 bypass enabled, for manual testing or to
# run the Playwright E2E suite against. Requires a Postgres reachable via the PG_*_DSN env vars
# (e.g. `docker compose up -d` to start the bundled database). Reproducible: no machine-specific
# setup beyond uv and a provisioned Postgres — identical to the test_e2e CI job.
#
# Usage:
#   PG_DSN=... PG_ALEMBIC_DSN=... PG_TEST_DSN=... ./scripts/dev-e2e.sh
#   # then, in another shell: cd ui && npm run test:e2e
set -euo pipefail

export APP_ENV="${APP_ENV:-localhost}"
export ORD_APP_E2E="${ORD_APP_E2E:-true}"
# Match the UI origin (127.0.0.1:5173) below; the backend default only allows localhost:5173.
export CORS_ORIGINS="${CORS_ORIGINS:-[\"http://127.0.0.1:5173\"]}"

echo "Applying database migrations..."
uv run alembic upgrade head

echo "Starting backend (no-auth e2e mode) on http://127.0.0.1:8000 ..."
uv run uvicorn ord_app.service_api.main:app --host 127.0.0.1 --port 8000 &
backend_pid=$!
trap 'kill "${backend_pid}" 2>/dev/null || true' EXIT

echo "Starting UI (no-auth) on http://127.0.0.1:5173 ..."
( cd ui && VITE_E2E_NO_AUTH=TRUE npm run dev -- --host 127.0.0.1 --port 5173 )
