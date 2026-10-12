# Cross-language copy-paste detection (replaces SonarCloud's duplication metric).
# Requires `npm ci` under frontend/ so the pinned jscpd binary is available.
.PHONY: duplication check-ruff python-formatting python-checking

duplication:
	frontend/node_modules/.bin/jscpd --config .jscpd.json

check-ruff:
	uv run --directory backend/editor ruff check ord_editor/

python-formatting:
	uv run --directory backend/editor ruff check ord_editor/ --fix

python-checking: check-ruff
	uv run --directory backend/editor ty check ord_editor
