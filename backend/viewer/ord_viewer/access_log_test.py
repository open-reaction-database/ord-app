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

"""Uvicorn's access log, which leaves out the load balancer's health checks.

The image's check in .github/workflows/images.yml reads the lines uvicorn and nginx
write for requests through the running image.
"""

import logging

import pytest

# Importing the app's module installs the filter.
import ord_viewer.main  # noqa: F401


@pytest.mark.parametrize(
    ("path", "logged"),
    [
        ("/api/health", False),
        ("/api/health?probe=1", False),
        ("/api/healthz", True),
        ("/api/datasets", True),
    ],
)
def test_the_access_log_leaves_out_health_checks(path, logged):
    # The message and arguments uvicorn's access log writes for a request.
    record = logging.LogRecord(
        "uvicorn.access",
        logging.INFO,
        __file__,
        0,
        '%s - "%s %s HTTP/%s" %d',
        ("127.0.0.1:50000", "GET", path, "1.0", 200),
        None,
    )

    assert bool(logging.getLogger("uvicorn.access").filter(record)) is logged


def test_the_access_log_keeps_a_line_that_names_no_request():
    record = logging.LogRecord(
        "uvicorn.access", logging.INFO, __file__, 0, "/api/health", None, None
    )

    assert logging.getLogger("uvicorn.access").filter(record)
