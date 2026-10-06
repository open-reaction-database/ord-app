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
"""Response helpers shared by the v1 routers."""

import re
from urllib.parse import quote

from fastapi import Response

from ord_app.service_api.schemas.datasets import DatasetDownloadFileFormats

# Characters that can't appear inside a quoted ASCII ``filename`` parameter: anything
# outside printable ASCII (0x20-0x7e), plus ``"`` (0x22) and ``\`` (0x5c).
_UNSAFE_FILENAME_CHARACTERS = re.compile(r"[^\x20\x21\x23-\x5b\x5d-\x7e]")

# Content type of each download format. nginx compresses responses by content type
# (gzip_types in nginx.conf), so a download without one is sent uncompressed. Parquet
# is already compressed, and nginx.conf leaves it out.
DOWNLOAD_MEDIA_TYPES: dict[DatasetDownloadFileFormats, str] = {
    "binpb": "application/x-protobuf",
    "json": "application/json",
    "txtpb": "text/plain; charset=utf-8",
    "parquet": "application/vnd.apache.parquet",
}


def attachment_response(data: bytes, filename: str, media_type: str) -> Response:
    """Returns ``data`` as a file download that the client saves as ``filename``.

    Header values are Latin-1, so the name is sent twice (RFC 6266): an ASCII
    ``filename`` with other characters replaced by ``_``, and the exact name in
    ``filename*``, percent-encoded as UTF-8.

    Args:
        data: The file contents.
        filename: The name to save the file under.
        media_type: The ``Content-Type``; see ``DOWNLOAD_MEDIA_TYPES``.

    Returns:
        A response with an attachment ``Content-Disposition`` header.
    """
    fallback = _UNSAFE_FILENAME_CHARACTERS.sub("_", filename)
    encoded = quote(filename, safe="")
    return Response(
        data,
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f"attachment; filename=\"{fallback}\"; filename*=UTF-8''{encoded}"
            )
        },
    )
