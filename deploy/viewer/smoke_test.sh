#!/usr/bin/env bash
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

# Checks a running viewer image through nginx: the API, the SPA, and the routing,
# caching, and limits between them.
#
# Usage: deploy/viewer/smoke_test.sh <base URL> <reaction ID in its corpus>
set -euo pipefail

base=${1:?usage: smoke_test.sh <base URL> <reaction ID>}
reaction=${2:?usage: smoke_test.sh <base URL> <reaction ID>}

# The response's status, or 000 when nothing answers.
status() {
  curl -s -o /dev/null -w '%{http_code}' "$@" || true
}

expect_status() {
  local expected=$1
  shift
  local actual
  actual=$(status "$@")
  if [[ $actual != "$expected" ]]; then
    echo "expected $expected, got $actual: $*" >&2
    exit 1
  fi
}

# Each body or header block is read whole before it is matched, since a grep -q that
# stops at its first match can cut curl off mid-response and fail the pipeline.
expect_body() {
  local url=$1 pattern=$2 body
  body=$(curl -sf "$url") || {
    echo "could not fetch $url" >&2
    exit 1
  }
  if ! grep -qE -- "$pattern" <<<"$body"; then
    echo "expected $url to match $pattern" >&2
    exit 1
  fi
}

expect_header() {
  local url=$1 pattern=$2 headers
  headers=$(curl -sfI "$url") || {
    echo "could not fetch $url's headers" >&2
    exit 1
  }
  if ! grep -qiE -- "$pattern" <<<"$headers"; then
    echo "expected a header of $url to match $pattern" >&2
    exit 1
  fi
}

# The backend opens its corpus before it accepts connections; nginx answers 502 until then.
for _ in $(seq 1 90); do
  [[ $(status "$base/api/health") == 200 ]] && break
  sleep 2
done
expect_status 200 "$base/api/health"

# The SPA, at its root and at a deep link, which falls back to index.html.
expect_body "$base/" '<div id="root">'
expect_body "$base/reactions/$reaction" '<div id="root">'
expect_header "$base/" '^cache-control: no-cache'
index=$(curl -sf "$base/")
asset=$(grep -m1 -oE '/assets/[^"]+\.js' <<<"$index") || {
  echo "no script under /assets/ in $base/" >&2
  exit 1
}
expect_header "$base$asset" '^cache-control: public, max-age=31536000, immutable'

# The API, ahead of the static rules.
expect_body "$base/api/openapi.json" '"/api/search"'
expect_status 200 "$base/api/reactions/$reaction"
expect_status 301 "$base/editor"

# With no key set, an ask is refused by the backend, then by nginx past its burst.
ask=(-X POST -H 'Content-Type: application/json' -d '{"question": "pyridine"}' "$base/api/ask")
expect_status 503 "${ask[@]}"
limited=0
for _ in $(seq 1 10); do
  [[ $(status "${ask[@]}") == 429 ]] && limited=$((limited + 1))
done
if ((limited == 0)); then
  echo "expected some of 10 quick asks to be limited" >&2
  exit 1
fi

# A body past 128 KiB never reaches the backend.
head -c 200000 /dev/zero | tr '\0' 'a' >"${TMPDIR:-/tmp}/viewer-large-body"
expect_status 413 -X POST -H 'Content-Type: application/json' \
  --data-binary "@${TMPDIR:-/tmp}/viewer-large-body" "$base/api/download"

echo "the viewer's image passed its smoke test"
