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
    gcc \
    g++ \
    make \
    cmake \
    libboost-dev \
    libboost-python-dev \
    python3-dev \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libgl1 \
    libxrender1 \
    libxext6 \
    git \
    ntpsec-ntpdate && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry

COPY migrations/ ./migrations/
COPY alembic.ini .
COPY poetry.lock .
COPY pyproject.toml .
COPY tox.ini .
COPY ord_app/ ./ord_app

RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --with dev --no-root --no-interaction --no-ansi

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/entrypoint.sh"]