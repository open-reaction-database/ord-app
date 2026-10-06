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
from urllib.parse import unquote

import pytest

from ord_app.service_api.resources.v1.responses import attachment_response


@pytest.mark.parametrize(
    ("filename", "fallback"),
    [
        ("dataset.binpb", "dataset.binpb"),
        ("C–N coupling at 25 °C.json", "C_N coupling at 25 _C.json"),
        ('a "quoted" \\ name.txtpb', "a _quoted_ _ name.txtpb"),
    ],
)
def test_attachment_response_names_the_file(filename, fallback):
    response = attachment_response(b"data", filename, "application/json")

    header = response.headers["content-disposition"]
    assert header.startswith(f'attachment; filename="{fallback}"; ')
    assert unquote(header.split("filename*=UTF-8''")[1]) == filename
    assert response.body == b"data"
    assert response.headers["content-type"] == "application/json"
