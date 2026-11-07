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

# Every request gives up rather than hang: 5 s to connect, 30 s in all.
request() {
  curl --connect-timeout 5 --max-time 30 "$@"
}

# The response's status, or 000 when nothing answers.
status() {
  request -s -o /dev/null -w '%{http_code}' "$@" || true
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
  body=$(request -sf "$url") || {
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
  headers=$(request -sfI "$url") || {
    echo "could not fetch $url's headers" >&2
    exit 1
  }
  if ! grep -qiE -- "$pattern" <<<"$headers"; then
    echo "expected a header of $url to match $pattern" >&2
    exit 1
  fi
}

# The backend opens its corpus before it accepts connections; nginx answers 502 until
# then. Wait up to three minutes.
deadline=$((SECONDS + 180))
until [[ $(status "$base/api/health") == 200 ]] || ((SECONDS >= deadline)); do
  sleep 2
done
expect_status 200 "$base/api/health"

# index.html's mount point, which marks a response as the SPA.
spa='<div id="root">'

# The SPA, at its root and at a deep link, which falls back to index.html.
expect_body "$base/" "$spa"
expect_body "$base/reactions/$reaction" "$spa"
expect_header "$base/" '^cache-control: no-cache'
index=$(request -sf "$base/")
asset=$(grep -m1 -oE '/assets/[^"]+\.js' <<<"$index") || {
  echo "no script under /assets/ in $base/" >&2
  exit 1
}
expect_header "$base$asset" '^cache-control: public, max-age=31536000, immutable'

# The ask page; an ask address with its question in the query goes to the same address
# with the query as its fragment, relative to the host it was asked of.
legacy="$base/ask?q=reactions+that+use+%40A&%40A=CCN"
expect_body "$base/ask" "$spa"
expect_status 302 "$legacy"
expect_header "$legacy" '^location: /ask#q=reactions\+that\+use\+%40A&%40A=CCN[[:space:]]*$'

# The search page; a search address with its form in the query goes the same way.
legacy="$base/search?reaction_id=$reaction&limit=100"
expect_body "$base/search" "$spa"
expect_status 302 "$legacy"
expect_header "$legacy" "^location: /search#reaction_id=$reaction&limit=100[[:space:]]*\$"

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

# An address of 16,000 characters, within the 16 KiB request line the load balancer
# passes, is served, and one twice that is past nginx's.
long="/datasets?q=$(head -c 15988 /dev/zero | tr '\0' 'a')"
expect_body "$base$long" "$spa"
expect_status 414 "$base$long$long"

# A body past 128 KiB never reaches the backend.
large=$(mktemp)
head -c 200000 /dev/zero | tr '\0' 'a' >"$large"
expect_status 413 -X POST -H 'Content-Type: application/json' \
  --data-binary "@$large" "$base/api/download"
rm -f "$large"

echo "the viewer's image passed its smoke test"
