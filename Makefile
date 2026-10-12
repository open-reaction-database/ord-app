# Copyright 2025 Open Reaction Database Project Authors
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

.PHONY: duplication check-ruff python-formatting python-checking

# Cross-language copy-paste detection (replaces SonarCloud's duplication metric).
# Requires `npm ci` under frontend/ so the pinned jscpd binary is available.
duplication:
	frontend/node_modules/.bin/jscpd --config .jscpd.json

check-ruff:
	uv run --directory backend/editor --frozen --no-build ruff check ord_editor/

python-formatting:
	uv run --directory backend/editor --frozen --no-build ruff format ord_editor/
	uv run --directory backend/editor --frozen --no-build ruff check ord_editor/ --fix

python-checking: check-ruff
	uv run --directory backend/editor --frozen --no-build ty check ord_editor
