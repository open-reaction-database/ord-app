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

"""Keeps the load balancer's health checks out of uvicorn's access log."""

import logging


def skip_access_log(path: str) -> None:
    """Drops uvicorn's access-log lines for requests to one path.

    Uvicorn configures its loggers before it imports the app, so a filter added while
    the app's module loads stays on the access logger for the life of the process.

    Args:
        path: The path whose requests go unlogged, matched exactly and without the
            query string.
    """
    # Uvicorn logs each request with the arguments (client, method, path and query,
    # HTTP version, status).
    logging.getLogger("uvicorn.access").addFilter(
        lambda record: not (
            isinstance(record.args, tuple)
            and len(record.args) == 5
            and str(record.args[2]).partition("?")[0] == path
        )
    )
