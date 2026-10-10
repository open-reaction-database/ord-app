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
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
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
    ntpsec-ntpdate \
    python3-dev \
    zlib1g-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# uv from its release image, pinned by version.
COPY --from=ghcr.io/astral-sh/uv:0.13.0 /uv /uvx /bin/

ENV UV_PROJECT_ENVIRONMENT=/usr/local \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY migrations/ ./migrations/
COPY alembic.ini .
COPY uv.lock .
COPY pyproject.toml .
COPY ord_app/ ./ord_app

RUN uv sync --frozen --no-build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/entrypoint.sh"]