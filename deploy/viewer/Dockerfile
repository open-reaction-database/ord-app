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

# The viewer: its SPA and API behind nginx, under supervisord. The corpus is named by
# ORD_VIEWER_CORPUS_DIR: a directory mounted at run time, or, with the revisions set, one
# the API fetches into at startup, such as /app/corpus. Built from the repository's root:
#   docker build -f deploy/viewer/Dockerfile .

FROM ghcr.io/astral-sh/uv:0.13.0@sha256:cdc6093146eb3ff6a40107b38f008b789e050e77ad87865e381d9917da55a168 AS uv

FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS spa
WORKDIR /app
# The manifests first, so npm ci's layer stays cached until one of them changes. Every
# workspace the lockfile names is listed; npm ci fails if one is missing.
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
COPY frontend/apps/editor/package.json apps/editor/
COPY frontend/apps/viewer/package.json apps/viewer/
COPY frontend/packages/ui/package.json packages/ui/
RUN npm ci --ignore-scripts
COPY frontend/ ./
# The commit the footer shows: the GIT_COMMIT the image is labeled with below. Unset, as
# in local and CI builds, the footer shows none.
ARG GIT_COMMIT
RUN VITE_GIT_COMMIT="$GIT_COMMIT" npm run build -w apps/viewer

FROM python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /usr/sbin/nologin appuser
COPY --from=uv /uv /bin/
ENV UV_PROJECT_ENVIRONMENT=/usr/local \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
WORKDIR /app
# The lockfile first, so the dependencies' layer stays cached until it changes.
COPY backend/viewer/pyproject.toml backend/viewer/uv.lock ./
RUN uv sync --frozen --no-dev --no-build
COPY backend/viewer/ord_viewer/ ./ord_viewer/
COPY --from=spa /app/apps/viewer/dist /var/www/html
COPY deploy/viewer/nginx.conf /etc/nginx/nginx.conf
COPY deploy/viewer/supervisord.conf /etc/supervisor/viewer.conf
COPY deploy/viewer/exit_on_failure.sh /usr/local/bin/exit_on_failure.sh
COPY deploy/viewer/start.sh /usr/local/bin/start.sh
# nginx keeps its temporary files under /var/lib/nginx, and DuckDB may spill into /app.
RUN chmod +x /usr/local/bin/exit_on_failure.sh /usr/local/bin/start.sh && \
    chown -R appuser:appgroup /app /var/lib/nginx /var/log/nginx
USER appuser
EXPOSE 8080
ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.revision=$GIT_COMMIT
CMD ["/usr/local/bin/start.sh"]
