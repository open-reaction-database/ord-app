# Copyright 2024 Open Reaction Database Project Authors
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

# uv from its release image, pinned by version and digest. A FROM line, unlike a
# COPY --from image reference, is one Dependabot updates.
FROM ghcr.io/astral-sh/uv:0.13.0@sha256:cdc6093146eb3ff6a40107b38f008b789e050e77ad87865e381d9917da55a168 AS uv

# Stage 1: Build the React app
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS react-build

WORKDIR /app

# Copy the frontend workspace
COPY frontend/ ./

# Install dependencies
RUN npm ci --ignore-scripts

# The backend is served from the same origin (nginx proxies /api to uvicorn), so
# default the API base to a relative path. This keeps every deployed environment
# (prod, staging, ...) calling its own origin instead of a hardcoded host, which
# would otherwise be baked in from a local frontend/apps/editor/.env at build time. A
# build-time env var takes precedence over .env files in Vite. Override with --build-arg
# if needed.
ARG VITE_API_ENDPOINT=/api/v1
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}

# The Auth0 settings are compiled into the bundle. They come from these build arguments
# or, for any not passed, from frontend/apps/editor/.env. ORD_APP_REQUIRE_AUTH0 fails the
# build when one is missing (see frontend/apps/editor/vite.config.ts).
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ARG VITE_AUTH0_ISSUER
ARG VITE_AUTH0_SCOPE

# Build the React app
RUN ORD_APP_REQUIRE_AUTH0=true npm run build -w apps/editor

# Stage 2: Build the FastAPI backend
FROM python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1 AS fastapi-build

WORKDIR /app

# The app user and system dependencies
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser && \
    apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    curl \
    g++ \
    gcc \
    git \
    libboost-dev \
    libboost-python-dev \
    libffi-dev \
    libgl1 \
    libjpeg-dev \
    libpng-dev \
    libxext6 \
    libxml2-dev \
    libxrender1 \
    libxslt-dev \
    make \
    nginx \
    ntpsec-ntpdate \
    python3-dev \
    supervisor \
    zlib1g-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=uv /uv /uvx /bin/

ENV UV_PROJECT_ENVIRONMENT=/usr/local \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Copy project files
COPY backend/editor/uv.lock backend/editor/pyproject.toml ./

# Install Python dependencies (production only, no dev group)
RUN uv sync --frozen --no-dev --no-build

# Copy the rest of the FastAPI app
COPY backend/editor/ord_editor/ ./ord_editor

# Copy the built React app from the previous stage
COPY --from=react-build /app/apps/editor/dist /var/www/html

# Copy Nginx config file
COPY deploy/editor/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/lib/nginx /var/tmp/nginx /var/log/nginx && \
    chown -R appuser:appgroup /var/lib/nginx /var/tmp/nginx /var/log/nginx /run

# Copy Supervisor config
COPY deploy/editor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN (chown -R appuser:appgroup /app /var/www/html /etc/nginx || ls -lah /app) && \
    chown -R appuser:appgroup /etc/supervisor /var/log/supervisor

COPY deploy/editor/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# nginx serves the bundle and proxies the API on this port (nginx.conf).
EXPOSE 5173

# Record the source commit so the deployed image is traceable to a commit. The infra
# build (ord-infrastructure's sibling_head) passes the checkout's HEAD, suffixed
# -dirty when the tree has changes, or "unknown" when it cannot read one; local and
# manual builds default to "unknown". Declared last so only this layer rebuilds per
# commit.
ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.revision=$GIT_COMMIT

ENTRYPOINT ["sh", "./entrypoint.sh"]
