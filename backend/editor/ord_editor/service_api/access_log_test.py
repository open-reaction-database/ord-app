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
import asyncio
import logging
import socket
from logging.handlers import BufferingHandler

import httpx
import pytest
import uvicorn

from ord_editor.service_api.main import app


@pytest.fixture
def access_log():
    """Collects the records uvicorn's access logger passes to its handlers."""
    logger = logging.getLogger("uvicorn.access")
    handler = BufferingHandler(capacity=100)
    level, disabled = logger.level, logger.disabled
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    # The test database's migrations run Alembic's fileConfig, which disables every
    # logger that exists when it runs.
    logger.disabled = False
    yield handler.buffer
    logger.removeHandler(handler)
    logger.setLevel(level)
    logger.disabled = disabled


async def test_the_access_log_leaves_out_health_checks(access_log):
    # The real app, through uvicorn's own protocol, which writes the access log.
    server = uvicorn.Server(uvicorn.Config(app, lifespan="off", log_config=None))
    with socket.create_server(("127.0.0.1", 0)) as sock:
        serving = asyncio.create_task(server.serve(sockets=[sock]))
        async with asyncio.timeout(30):
            while not server.started:
                if serving.done():
                    serving.result()
                await asyncio.sleep(0.01)
        host, port = sock.getsockname()
        async with httpx.AsyncClient(base_url=f"http://{host}:{port}") as client:
            for path in ("/api/v1/health", "/api/v1/health?probe=1", "/api/v1/healthz"):
                await client.get(path)
        server.should_exit = True
        await serving

    requests = [record.getMessage().split('"')[1] for record in access_log]
    assert requests == ["GET /api/v1/healthz HTTP/1.1"]
